import { useState, useMemo, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { clients, bookings, invoices, payments, conversations, communications, internalNotes, getAllConversationsWithRelations } from "@/lib/mock-data";
import { formatCurrency, getInitials } from "@/lib/format";
import { getClientIdsWithPaidBookings, resolveLifecycleStatus } from "@/lib/client-lifecycle";
import { canViewClient } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { LIFECYCLE_AVATAR_COLORS } from "@/lib/constants";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { ErrorState } from "@/components/shared/error-state";
import { ClientSidebar } from "@/components/clients/client-sidebar";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { ClientChatPanel } from "@/components/clients/client-chat-panel";
import type { Attachment, Channel, Communication, ConversationWithRelations } from "@/types";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, allUsers, conversationLastReadAt, markConversationRead } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [, forceUpdate] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [deletingOpen, setDeletingOpen] = useState(false);

  const fromConversation = location.state?.from === "conversation"
    ? (location.state.conversationId as string)
    : null;

  if (!id || !canViewClient(currentUser, id, conversations)) {
    return <PermissionDenied />;
  }

  const client = clients.find((c) => c.id === id);

  if (!client) {
    return <ErrorState message="Client not found" />;
  }

  const paidClientIds = getClientIdsWithPaidBookings(bookings, invoices, payments);
  const lifecycle = resolveLifecycleStatus(client, paidClientIds);
  if (lifecycle === "lead") {
    return <ErrorState message="This person is a lead and does not have a client profile yet." />;
  }

  const clientBookings = bookings.filter((b) => b.clientId === client.id);
  const clientNotes = internalNotes.filter((n) => n.clientId === client.id);

  const clientConversationsByChannel = useMemo(() => {
    const all = getAllConversationsWithRelations();
    const clientConvs = all.filter((c) => c.client.id === client.id);
    const byChannel = new Map<Channel, ConversationWithRelations>();
    for (const conv of clientConvs) {
      const existing = byChannel.get(conv.channel);
      if (!existing || conv.updatedAt > existing.updatedAt) {
        byChannel.set(conv.channel, conv);
      }
    }
    return byChannel;
  }, [client.id]);

  const [localMessages, setLocalMessages] = useState<Map<string, Communication[]>>(new Map());

  const lastReadAtOnOpenRef = useRef<Record<string, string | null> | null>(null);
  if (lastReadAtOnOpenRef.current === null && clientConversationsByChannel.size > 0) {
    const snap: Record<string, string | null> = {};
    for (const [, conv] of clientConversationsByChannel) {
      snap[conv.id] = conversationLastReadAt[conv.id] ?? null;
    }
    lastReadAtOnOpenRef.current = snap;
  }

  const handleChatSend = useCallback(
    (conversationId: string, message: string, attachments?: Attachment[]) => {
      const conv = [...clientConversationsByChannel.values()].find((c) => c.id === conversationId);
      const newComm: Communication = {
        id: `local-${Date.now()}`,
        conversationId,
        sender: "agent",
        senderName: currentUser.name,
        channel: conv?.channel ?? "web",
        message,
        deliveryStatus: "sent",
        attachments,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => {
        const next = new Map(prev);
        const existing = next.get(conversationId) ?? [];
        next.set(conversationId, [...existing, newComm]);
        return next;
      });
    },
    [clientConversationsByChannel, currentUser.name]
  );

  const handleChatSharePaymentLink = useCallback(
    (conversationId: string, invoiceId: string) => {
      const conv = [...clientConversationsByChannel.values()].find((c) => c.id === conversationId);
      const channel = conv?.channel ?? "web";

      // If invoice is draft, send it first
      const invoice = invoices.find((i) => i.id === invoiceId);
      if (invoice && invoice.status === "draft") {
        invoice.status = "sent";
        invoice.updatedAt = new Date().toISOString();

        const invoiceSentComm: Communication = {
          id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          conversationId,
          sender: "system",
          senderName: "System",
          channel,
          message: `Invoice sent to client.`,
          event: {
            type: "invoice_sent",
            bookingId: invoice.bookingId,
            invoiceId: invoice.id,
            invoiceTotal: invoice.total,
          },
          createdAt: new Date().toISOString(),
        };
        communications.push(invoiceSentComm);
        if (conv) conv.communications.push(invoiceSentComm);

        // Change booking status from draft to awaiting_payment
        const bookingRef = bookings.find((b) => b.id === invoice.bookingId);
        if (bookingRef && bookingRef.status === "draft") {
          const fromStatus = bookingRef.status;
          bookingRef.status = "awaiting_payment";
          bookingRef.updatedAt = new Date().toISOString();

          const statusComm: Communication = {
            id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            conversationId,
            sender: "system",
            senderName: "System",
            channel,
            message: `Booking status changed from ${fromStatus} to awaiting_payment`,
            event: {
              type: "booking_status_changed",
              bookingId: bookingRef.id,
              fromStatus,
              toStatus: "awaiting_payment",
            },
            createdAt: new Date().toISOString(),
          };
          communications.push(statusComm);
          if (conv) conv.communications.push(statusComm);
        }
      }

      forceUpdate((n) => n + 1);
    },
    [clientConversationsByChannel]
  );

  const handleChatCreateInvoice = useCallback(
    (conversationId: string, bookingId: string) => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;

      const existingInvoice = invoices.find((i) => i.bookingId === bookingId);
      if (existingInvoice) return;

      const subtotal = booking.price;
      const taxRate = 10;
      const taxAmount = Math.round(subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;
      const newInvoiceId = `inv-${Date.now()}`;

      const conv = [...clientConversationsByChannel.values()].find((c) => c.id === conversationId);
      const channel = conv?.channel ?? "web";

      invoices.push({
        id: newInvoiceId,
        bookingId: booking.id,
        clientId: booking.clientId,
        status: "draft",
        lineItems: [{ description: booking.title, quantity: 1, unitPrice: subtotal }],
        subtotal,
        taxRate,
        taxAmount,
        total,
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const systemComm: Communication = {
        id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        conversationId,
        sender: "system",
        senderName: "System",
        channel,
        message: `Invoice created for ${formatCurrency(total)}.`,
        event: {
          type: "invoice_created",
          bookingId: booking.id,
          invoiceId: newInvoiceId,
          invoiceTotal: total,
        },
        createdAt: new Date().toISOString(),
      };
      communications.push(systemComm);
      if (conv) conv.communications.push(systemComm);

      forceUpdate((n) => n + 1);
    },
    [clientConversationsByChannel]
  );

  const handleAddNote = (content: string) => {
    const note = {
      id: `note-client-${Date.now()}`,
      conversationId: "",
      clientId: client.id,
      authorId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    internalNotes.push(note);
    forceUpdate((n) => n + 1);
  };

  const handleEditNote = (noteId: string, content: string) => {
    const note = internalNotes.find((n) => n.id === noteId);
    if (note) {
      note.content = content;
      note.updatedAt = new Date().toISOString();
    }
    forceUpdate((n) => n + 1);
  };

  const handleDeleteNote = (noteId: string) => {
    const idx = internalNotes.findIndex((n) => n.id === noteId);
    if (idx !== -1) internalNotes.splice(idx, 1);
    forceUpdate((n) => n + 1);
  };

  const handleSaveClient = (data: {
    name: string;
    email?: string;
    phone?: string;
    company: string;
    isVip: boolean;
  }) => {
    const idx = clients.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      clients[idx] = {
        ...clients[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }
    setFormOpen(false);
    forceUpdate((n) => n + 1);
  };

  const handleConfirmDelete = () => {
    const idx = clients.findIndex((c) => c.id === client.id);
    if (idx !== -1) clients.splice(idx, 1);
    setDeletingOpen(false);
    navigate("/clients");
  };

  const backUrl = fromConversation ? `/inbox?id=${fromConversation}` : "/clients";
  const backLabel = fromConversation ? "Back to Conversation" : "Back to Clients";

  return (
    <div className="flex h-full">
      {/* Center: main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center border-b px-4 py-2">
          <Button variant="ghost" size="sm" className="-ml-2 h-7 text-xs" asChild>
            <Link to={backUrl}>
              <ArrowLeft className="size-3.5" />
              {backLabel}
            </Link>
          </Button>
        </div>

        {/* Client profile header */}
        <div className="flex items-center gap-3 border-b px-4 py-2">
          <Avatar>
            <AvatarFallback className={LIFECYCLE_AVATAR_COLORS.client}>
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="text-sm font-semibold">{client.name}</span>
            {client.isVip && <VipIndicator />}
            {client.company && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{client.company}</span>
              </>
            )}
          </div>
          <div className="ml-auto flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
              <Pencil className="mr-1.5 size-3.5" />
              Edit
            </Button>
            {currentUser.role === "admin" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeletingOpen(true)}
                  >
                    <Trash2 className="mr-2 size-4 text-destructive" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <ClientChatPanel
          conversationsByChannel={clientConversationsByChannel}
          localMessages={localMessages}
          conversationLastReadAt={conversationLastReadAt}
          lastReadAtOnOpen={lastReadAtOnOpenRef.current ?? {}}
          onSend={handleChatSend}
          onSharePaymentLink={handleChatSharePaymentLink}
          onCreateInvoice={handleChatCreateInvoice}
          onMarkRead={markConversationRead}
        />
      </div>

      {/* Right: sidebar */}
      <div className="w-80 shrink-0 overflow-y-auto border-l">
        <ClientSidebar
          client={client}
          bookings={clientBookings}
          notes={clientNotes}
          users={allUsers}
          currentUserId={currentUser.id}
          currentUserRole={currentUser.role}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      </div>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={client}
        onSave={handleSaveClient}
      />

      {deletingOpen && (
        <DeleteClientDialog
          open={deletingOpen}
          onOpenChange={setDeletingOpen}
          client={client}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

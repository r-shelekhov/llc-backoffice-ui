import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getAllConversationsWithRelations, conversations as sourceConversations, communications, internalNotes, users as sourceUsers, bookings, invoices } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { filterConversationsByPermission, filterVipConversations } from "@/lib/permissions";
import { isConversationUnread, getUnreadCount } from "@/lib/unread";
import { getConversationActionReasons, type ActionReason } from "@/lib/filters";
import type { Attachment, Booking, Channel, Communication, ConversationWithRelations, SortField, SortDirection, Priority } from "@/types";
import { InboxLayout } from "@/components/inbox/inbox-layout";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ConversationThread } from "@/components/inbox/conversation-thread";
import { ContactDetailPanel } from "@/components/inbox/contact-detail-panel";
import { BookingCreateForm } from "@/components/bookings/booking-create-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VALID_SORT_FIELDS: SortField[] = ["last_activity", "date_started", "priority", "waiting_since", "sla_due"];
const PRIORITY_WEIGHT: Record<Priority, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function getLastCommTime(conversation: ConversationWithRelations): number {
  if (conversation.communications.length === 0) return new Date(conversation.createdAt).getTime();
  return Math.max(
    ...conversation.communications.map((c) => new Date(c.createdAt).getTime())
  );
}

function getWaitingSince(conversation: ConversationWithRelations): number | null {
  const comms = conversation.communications.filter((c) => c.sender !== "system");
  if (comms.length === 0) return null;
  const latestClient = comms.filter((c) => c.sender === "client").reduce<number | null>(
    (max, c) => { const t = new Date(c.createdAt).getTime(); return max === null || t > max ? t : max; }, null
  );
  if (latestClient === null) return null;
  const latestAgent = comms.filter((c) => c.sender === "agent").reduce<number | null>(
    (max, c) => { const t = new Date(c.createdAt).getTime(); return max === null || t > max ? t : max; }, null
  );
  if (latestAgent === null || latestClient > latestAgent) return Date.now() - latestClient;
  return null;
}

function getSortValue(conversation: ConversationWithRelations, field: SortField): number | null {
  switch (field) {
    case "last_activity": return getLastCommTime(conversation);
    case "date_started": return new Date(conversation.createdAt).getTime();
    case "priority": return PRIORITY_WEIGHT[conversation.priority];
    case "waiting_since": return getWaitingSince(conversation);
    case "sla_due": return new Date(conversation.slaDueAt).getTime();
  }
}

function compareConversations(a: ConversationWithRelations, b: ConversationWithRelations, field: SortField, direction: SortDirection): number {
  const av = getSortValue(a, field);
  const bv = getSortValue(b, field);

  // Nulls always sort to bottom
  if (av === null && bv === null) return 0;
  if (av === null) return 1;
  if (bv === null) return -1;

  const primary = direction === "asc" ? av - bv : bv - av;
  if (primary !== 0) return primary;

  // Tie-breakers: priority desc, then last_activity desc, then id asc
  const priDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  if (priDiff !== 0) return priDiff;

  const actDiff = getLastCommTime(b) - getLastCommTime(a);
  if (actDiff !== 0) return actDiff;

  return a.id.localeCompare(b.id);
}

function matchesSearch(conversation: ConversationWithRelations, query: string): boolean {
  const q = query.toLowerCase();
  return (
    conversation.client.name.toLowerCase().includes(q) ||
    conversation.title.toLowerCase().includes(q) ||
    conversation.communications.some((c) =>
      c.message.toLowerCase().includes(q)
    )
  );
}

interface InboxPageProps {
  myConversationsOnly?: boolean;
}

export function InboxPage({ myConversationsOnly }: InboxPageProps = {}) {
  const { currentUser, allUsers, conversationLastReadAt, markConversationRead } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const sortBy = (VALID_SORT_FIELDS.includes(searchParams.get("sort") as SortField)
    ? searchParams.get("sort") as SortField
    : "last_activity") satisfies SortField;
  const sortDirection = (searchParams.get("order") === "asc" ? "asc" : "desc") satisfies SortDirection;

  const viewMode = (searchParams.get("view") === "all" ? "all" : "action") as "action" | "all";

  const handleViewModeChange = useCallback(
    (mode: "action" | "all") => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (mode === "all") {
          next.set("view", "all");
        } else {
          next.delete("view");
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (field: SortField) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("sort", field);
        return next;
      });
    },
    [setSearchParams]
  );

  const handleDirectionToggle = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("order", prev.get("order") === "asc" ? "desc" : "asc");
      return next;
    });
  }, [setSearchParams]);

  const [activeChannel, setActiveChannel] = useState<Channel | "all">("all");
  const [search, setSearch] = useState("");
  const [localMessages, setLocalMessages] = useState<
    Map<string, Communication[]>
  >(new Map());
  const [updateCounter, forceUpdate] = useState(0);
  const conversationLastReadAtRef = useRef(conversationLastReadAt);
  conversationLastReadAtRef.current = conversationLastReadAt;
  const [lastReadAtOnOpen, setLastReadAtOnOpen] = useState<string | null>(null);

  const allConversations = useMemo(() => getAllConversationsWithRelations(), [updateCounter]);

  const permittedConversations = useMemo(() => {
    const base = filterVipConversations(currentUser, filterConversationsByPermission(currentUser, allConversations));
    if (myConversationsOnly) {
      return base.filter((c) => c.managerIds.includes(currentUser.id));
    }
    return base;
  }, [currentUser, allConversations, myConversationsOnly, updateCounter]);

  const actionReasonsMap = useMemo(() => {
    const map = new Map<string, ActionReason[]>();
    for (const conv of permittedConversations) {
      const reasons = getConversationActionReasons(conv, conversationLastReadAt[conv.id]);
      if (reasons.length > 0) map.set(conv.id, reasons);
    }
    return map;
  }, [permittedConversations, conversationLastReadAt, updateCounter]);

  const filteredConversations = useMemo(() => {
    let result = permittedConversations;

    // Filter by action mode (before channel/search)
    if (viewMode === "action") {
      result = result.filter((r) => actionReasonsMap.has(r.id) || r.id === selectedId);
    }

    // Filter by channel (concierge only visible in "all")
    if (activeChannel !== "all") {
      result = result.filter((r) => r.channel === activeChannel);
    }

    // Filter by search
    if (search) {
      result = result.filter((r) => matchesSearch(r, search));
    }

    return [...result].sort((a, b) => compareConversations(a, b, sortBy, sortDirection));
  }, [permittedConversations, viewMode, actionReasonsMap, activeChannel, search, sortBy, sortDirection]);

  const selectedConversation = useMemo(
    () => (selectedId ? permittedConversations.find((r) => r.id === selectedId) ?? null : null),
    [selectedId, permittedConversations]
  );

  useEffect(() => {
    if (!selectedConversation) return;
    const id = selectedConversation.id;
    setLastReadAtOnOpen(conversationLastReadAtRef.current[id] ?? null);
    markConversationRead(id);
  }, [selectedConversation?.id, markConversationRead]);

  const unreadCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const conversation of permittedConversations) {
      if (!isConversationUnread(conversation, conversationLastReadAt)) continue;
      const count = getUnreadCount(conversation, conversationLastReadAt);
      if (count > 0) map.set(conversation.id, count);
    }
    return map;
  }, [permittedConversations, conversationLastReadAt]);

  const unreadConversationIds = useMemo(
    () => new Set(unreadCountMap.keys()),
    [unreadCountMap]
  );

  const handleManagersChange = useCallback(
    (conversationId: string, managerIds: string[]) => {
      const conv = sourceConversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.managerIds = managerIds;
        conv.updatedAt = new Date().toISOString();
      }
      const convWR = allConversations.find((c) => c.id === conversationId);
      if (convWR) {
        convWR.managerIds = managerIds;
        convWR.managers = managerIds
          .map((id) => sourceUsers.find((u) => u.id === id))
          .filter((u): u is typeof sourceUsers[number] => u != null);
        convWR.updatedAt = new Date().toISOString();
      }

      // Propagate managers to all bookings linked to this conversation
      for (const booking of bookings) {
        if (booking.conversationId !== conversationId) continue;
        booking.managerIds = managerIds;
        booking.updatedAt = new Date().toISOString();

        // Auto-schedule: paid + has manager + execution date → scheduled
        if (booking.status === "paid" && managerIds.length > 0 && booking.executionAt !== "") {
          const fromStatus = booking.status;
          booking.status = "scheduled";

          const conversation = sourceConversations.find((c) => c.id === conversationId);
          if (conversation) {
            communications.push({
              id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              conversationId,
              sender: "system",
              senderName: "System",
              channel: conversation.channel,
              message: `Booking status changed from ${fromStatus} to scheduled`,
              event: {
                type: "booking_status_changed",
                bookingId: booking.id,
                fromStatus,
                toStatus: "scheduled",
              },
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      forceUpdate((n) => n + 1);
    },
    [allConversations]
  );

  const handleAddNote = useCallback(
    (content: string) => {
      if (!selectedConversation) return;
      const note = {
        id: `note-local-${Date.now()}`,
        conversationId: selectedConversation.id,
        clientId: selectedConversation.clientId,
        authorId: currentUser.id,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      internalNotes.push(note);
      selectedConversation.internalNotes.push(note);
      forceUpdate((n) => n + 1);
    },
    [selectedConversation, currentUser.id]
  );

  const handleEditNote = useCallback(
    (noteId: string, content: string) => {
      const note = internalNotes.find((n) => n.id === noteId);
      if (note) {
        note.content = content;
        note.updatedAt = new Date().toISOString();
      }
      if (selectedConversation) {
        const convNote = selectedConversation.internalNotes.find((n) => n.id === noteId);
        if (convNote) {
          convNote.content = content;
          convNote.updatedAt = new Date().toISOString();
        }
      }
      forceUpdate((n) => n + 1);
    },
    [selectedConversation]
  );

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      const idx = internalNotes.findIndex((n) => n.id === noteId);
      if (idx !== -1) internalNotes.splice(idx, 1);
      if (selectedConversation) {
        const convIdx = selectedConversation.internalNotes.findIndex((n) => n.id === noteId);
        if (convIdx !== -1) selectedConversation.internalNotes.splice(convIdx, 1);
      }
      forceUpdate((n) => n + 1);
    },
    [selectedConversation]
  );

  const handleSelect = useCallback(
    (id: string) => {
      markConversationRead(id);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("id", id);
        return next;
      });
    },
    [markConversationRead, setSearchParams]
  );

  const handleSend = useCallback(
    (message: string, attachments?: Attachment[]) => {
      if (!selectedId) return;
      const newComm: Communication = {
        id: `local-${Date.now()}`,
        conversationId: selectedId,
        sender: "agent",
        senderName: currentUser.name,
        channel: selectedConversation?.channel ?? "web",
        message,
        deliveryStatus: "sent",
        attachments,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => {
        const next = new Map(prev);
        const existing = next.get(selectedId) ?? [];
        next.set(selectedId, [...existing, newComm]);
        return next;
      });
    },
    [selectedId, currentUser.name, selectedConversation?.channel]
  );

  const handleSharePaymentLink = useCallback(
    (invoiceId: string) => {
      if (!selectedId) return;

      // If invoice is draft, send it first
      const invoice = invoices.find((i) => i.id === invoiceId);
      if (invoice && invoice.status === "draft") {
        invoice.status = "sent";
        invoice.updatedAt = new Date().toISOString();

        const invoiceSentComm: Communication = {
          id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          conversationId: selectedId,
          sender: "system",
          senderName: "System",
          channel: selectedConversation?.channel ?? "web",
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
        const convWR = allConversations.find((c) => c.id === selectedId);
        if (convWR) convWR.communications.push(invoiceSentComm);

        // Change booking status from draft to awaiting_payment
        const bookingRef = bookings.find((b) => b.id === invoice.bookingId);
        if (bookingRef && bookingRef.status === "draft") {
          const fromStatus = bookingRef.status;
          bookingRef.status = "awaiting_payment";
          bookingRef.updatedAt = new Date().toISOString();

          const statusComm: Communication = {
            id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            conversationId: selectedId,
            sender: "system",
            senderName: "System",
            channel: selectedConversation?.channel ?? "web",
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
          if (convWR) convWR.communications.push(statusComm);
        }
      }

      forceUpdate((n) => n + 1);
    },
    [selectedId, selectedConversation?.channel, allConversations]
  );

  const handleCreateInvoice = useCallback(
    (bookingId: string, conversationId: string) => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;

      const existingInvoice = invoices.find((i) => i.bookingId === bookingId);
      if (existingInvoice) return;

      const subtotal = booking.price;
      const taxRate = 10;
      const taxAmount = Math.round(subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;
      const invoiceId = `inv-${Date.now()}`;

      invoices.push({
        id: invoiceId,
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
        channel: selectedConversation?.channel ?? "web",
        message: `Invoice created for ${formatCurrency(total)}.`,
        event: {
          type: "invoice_created",
          bookingId: booking.id,
          invoiceId,
          invoiceTotal: total,
        },
        createdAt: new Date().toISOString(),
      };
      communications.push(systemComm);
      const convWR = allConversations.find((c) => c.id === conversationId);
      if (convWR) {
        convWR.communications.push(systemComm);
      }

      forceUpdate((n) => n + 1);
    },
    [selectedConversation?.channel, allConversations]
  );

  const currentLocalMessages = selectedId
    ? localMessages.get(selectedId) ?? []
    : [];

  // Auto-select first conversation when none is selected or selected conversation no longer exists
  useEffect(() => {
    if (filteredConversations.length === 0) return;
    const existsInPermitted = selectedId && permittedConversations.some((c) => c.id === selectedId);
    if (!existsInPermitted) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("id", filteredConversations[0].id);
        return next;
      });
    }
  }, [filteredConversations, selectedId, permittedConversations, setSearchParams]);

  const [createBookingConvId, setCreateBookingConvId] = useState<string | null>(null);

  const createBookingConversation = createBookingConvId
    ? allConversations.find((c) => c.id === createBookingConvId) ?? null
    : null;

  const handleResolve = useCallback(() => {
    if (!selectedConversation) return;
    const convId = selectedConversation.id;
    const now = new Date().toISOString();

    // Update source conversation
    const srcConv = sourceConversations.find((c) => c.id === convId);
    if (srcConv) {
      srcConv.resolvedAt = now;
      srcConv.resolvedBy = currentUser.id;
      srcConv.updatedAt = now;
    }

    // Push system communication
    const systemComm: Communication = {
      id: `sys-resolve-${Date.now()}`,
      conversationId: convId,
      sender: "system",
      senderName: currentUser.name,
      channel: selectedConversation.channel,
      message: "Conversation resolved",
      event: { type: "conversation_resolved" },
      createdAt: now,
    };
    communications.push(systemComm);

    // Update in-memory snapshot
    const convWR = allConversations.find((c) => c.id === convId);
    if (convWR) {
      convWR.resolvedAt = now;
      convWR.resolvedBy = currentUser.id;
      convWR.updatedAt = now;
      convWR.communications.push(systemComm);
    }

    forceUpdate((n) => n + 1);
  }, [selectedConversation, currentUser, allConversations]);

  const handleBookingCreated = useCallback(
    (booking: Booking) => {
      if (!createBookingConvId) return;
      setCreateBookingConvId(null);

      const systemComm: Communication = {
        id: `sys-${Date.now()}`,
        conversationId: createBookingConvId,
        sender: "system",
        senderName: "System",
        channel: "web",
        message: `Booking created: ${booking.title}`,
        event: {
          type: "booking_created",
          bookingId: booking.id,
          title: booking.title,
          category: booking.category,
          executionAt: booking.executionAt,
          location: booking.location,
          price: booking.price,
        },
        createdAt: new Date().toISOString(),
      };
      // Persist into the source mock data so it survives navigation
      communications.push(systemComm);
      // Also push into the current snapshot so it's visible immediately
      const convWR = allConversations.find((c) => c.id === createBookingConvId);
      if (convWR) {
        convWR.communications.push(systemComm);
      }
      forceUpdate((n) => n + 1);
    },
    [createBookingConvId, allConversations]
  );

  return (
    <>
    <InboxLayout
      emptyMessage={myConversationsOnly
        ? "Conversations will appear here once they are assigned to you."
        : undefined
      }
      left={
        <ConversationList
          conversations={filteredConversations}
          unreadConversationIds={unreadConversationIds}
          unreadCountMap={unreadCountMap}
          selectedId={selectedId}
          onSelect={handleSelect}
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortByChange={handleSortChange}
          onSortDirectionChange={handleDirectionToggle}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          actionableCount={actionReasonsMap.size}
          totalCount={permittedConversations.length}
          actionReasonsMap={actionReasonsMap}
          currentUserId={currentUser.id}
          {...(myConversationsOnly && {
            title: "My Queue",
          })}
        />
      }
      middle={
        selectedConversation ? (
          <ConversationThread
            conversation={selectedConversation}
            localMessages={currentLocalMessages}
            onSend={handleSend}
            onCreateBooking={(id) => setCreateBookingConvId(id)}
            onSharePaymentLink={handleSharePaymentLink}
            onCreateInvoice={handleCreateInvoice}
            onResolve={handleResolve}
            lastReadAtOnOpen={lastReadAtOnOpen}
          />
        ) : null
      }
      right={
        selectedConversation ? (
          <ContactDetailPanel
            conversation={selectedConversation}
            users={allUsers}
            onManagersChange={handleManagersChange}
            currentUserId={currentUser.id}
            currentUserRole={currentUser.role}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        ) : null
      }
    />
    <Dialog
      open={!!createBookingConvId}
      onOpenChange={(open) => {
        if (!open) setCreateBookingConvId(null);
      }}
    >
      <DialogContent className="sm:max-w-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create Booking</DialogTitle>
        </DialogHeader>
        {createBookingConversation && (
          <BookingCreateForm
            conversation={createBookingConversation}
            onSubmit={handleBookingCreated}
            onCancel={() => setCreateBookingConvId(null)}
          />
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

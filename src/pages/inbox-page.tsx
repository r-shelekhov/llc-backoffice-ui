import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getAllConversationsWithRelations, conversations as sourceConversations, communications, internalNotes, users as sourceUsers } from "@/lib/mock-data";
import { filterConversationsByPermission, filterVipConversations } from "@/lib/permissions";
import { isConversationUnread } from "@/lib/unread";
import type { Attachment, Booking, Channel, Communication, ConversationStatus, ConversationWithRelations, InboxStatusTab, SortField, SortDirection, Priority } from "@/types";
import { InboxLayout } from "@/components/inbox/inbox-layout";
import { InboxEmptyState } from "@/components/inbox/inbox-empty-state";
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

export function InboxPage() {
  const { currentUser, allUsers, conversationLastReadAt, markConversationRead } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const sortBy = (VALID_SORT_FIELDS.includes(searchParams.get("sort") as SortField)
    ? searchParams.get("sort") as SortField
    : "last_activity") satisfies SortField;
  const sortDirection = (searchParams.get("order") === "asc" ? "asc" : "desc") satisfies SortDirection;

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

  const [activeStatusTab, setActiveStatusTab] = useState<InboxStatusTab>("all");
  const [activeChannel, setActiveChannel] = useState<Channel | "all">("all");
  const [search, setSearch] = useState("");
  const [localMessages, setLocalMessages] = useState<
    Map<string, Communication[]>
  >(new Map());
  const [previousSelectedId, setPreviousSelectedId] = useState<string | null>(null);
  const prevIdRef = useRef<string | null>(null);
  const [, forceUpdate] = useState(0);

  const allConversations = useMemo(() => getAllConversationsWithRelations(), []);

  const permittedConversations = useMemo(
    () => filterVipConversations(currentUser, filterConversationsByPermission(currentUser, allConversations)),
    [currentUser, allConversations]
  );

  const filteredConversations = useMemo(() => {
    let result = permittedConversations;

    // Filter by status tab
    const isSnoozed = (c: ConversationWithRelations) =>
      c.snoozedUntil && new Date(c.snoozedUntil).getTime() > Date.now();

    switch (activeStatusTab) {
      case "open":
        result = result.filter((r) => (r.status === "new" || r.status === "in_review") && !isSnoozed(r));
        break;
      case "awaiting":
        result = result.filter((r) => r.status === "awaiting_client" && !isSnoozed(r));
        break;
      case "converted":
        result = result.filter((r) => r.status === "converted");
        break;
      case "closed":
        result = result.filter((r) => r.status === "closed");
        break;
      case "snoozed":
        result = result.filter(isSnoozed);
        break;
      case "all":
      default:
        // Hide snoozed from "all" tab
        result = result.filter((r) => !isSnoozed(r));
        break;
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
  }, [permittedConversations, activeStatusTab, activeChannel, search, sortBy, sortDirection]);

  const selectedConversation = useMemo(
    () => (selectedId ? permittedConversations.find((r) => r.id === selectedId) ?? null : null),
    [selectedId, permittedConversations]
  );

  useEffect(() => {
    if (!selectedConversation) return;
    markConversationRead(selectedConversation.id);
  }, [selectedConversation, markConversationRead]);

  useEffect(() => {
    if (selectedId && selectedId !== prevIdRef.current) {
      setPreviousSelectedId(prevIdRef.current);
      prevIdRef.current = selectedId;
    }
  }, [selectedId]);

  const isSnoozed = useCallback((c: ConversationWithRelations) =>
    !!(c.snoozedUntil && new Date(c.snoozedUntil).getTime() > Date.now()), []);

  const tabCounts = useMemo(() => {
    const counts: Record<InboxStatusTab, number> = {
      all: 0, open: 0, awaiting: 0, converted: 0, closed: 0, snoozed: 0,
    };
    for (const c of permittedConversations) {
      if (isSnoozed(c)) {
        counts.snoozed++;
      } else {
        counts.all++;
        if (c.status === "new" || c.status === "in_review") counts.open++;
        else if (c.status === "awaiting_client") counts.awaiting++;
        else if (c.status === "converted") counts.converted++;
        else if (c.status === "closed") counts.closed++;
      }
    }
    return counts;
  }, [permittedConversations, isSnoozed]);

  const unreadConversationIds = useMemo(
    () => new Set(
      permittedConversations
        .filter((conversation) => isConversationUnread(conversation, conversationLastReadAt))
        .map((conversation) => conversation.id)
    ),
    [permittedConversations, conversationLastReadAt]
  );

  const handleStatusChange = useCallback(
    (conversationId: string, newStatus: ConversationStatus) => {
      const conv = sourceConversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.status = newStatus;
        conv.updatedAt = new Date().toISOString();
      }
      // Also update the WithRelations copy in allConversations
      const convWR = allConversations.find((c) => c.id === conversationId);
      if (convWR) {
        convWR.status = newStatus;
        convWR.updatedAt = new Date().toISOString();
      }
      forceUpdate((n) => n + 1);
    },
    [allConversations]
  );

  const handleSnooze = useCallback(
    (conversationId: string, until: string) => {
      const conv = sourceConversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.snoozedUntil = until;
      }
      const convWR = allConversations.find((c) => c.id === conversationId);
      if (convWR) {
        convWR.snoozedUntil = until;
      }

      // Add system message as feedback
      const formatted = new Date(until).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      const systemComm: Communication = {
        id: `sys-snooze-${Date.now()}`,
        conversationId,
        sender: "system",
        senderName: "System",
        channel: "web",
        message: `Conversation snoozed until ${formatted}`,
        createdAt: new Date().toISOString(),
      };
      communications.push(systemComm);
      if (convWR) {
        convWR.communications.push(systemComm);
      }

      forceUpdate((n) => n + 1);
    },
    [allConversations]
  );

  const handleAssigneeChange = useCallback(
    (conversationId: string, assigneeId: string | null) => {
      const conv = sourceConversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.assigneeId = assigneeId;
        conv.updatedAt = new Date().toISOString();
      }
      const convWR = allConversations.find((c) => c.id === conversationId);
      if (convWR) {
        convWR.assigneeId = assigneeId;
        convWR.assignee = assigneeId ? sourceUsers.find((u) => u.id === assigneeId) ?? null : null;
        convWR.updatedAt = new Date().toISOString();
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

  const currentLocalMessages = selectedId
    ? localMessages.get(selectedId) ?? []
    : [];

  const emptyStateStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = permittedConversations.filter(
      (c) => c.updatedAt.slice(0, 10) === today
    ).length;
    return {
      openCount: tabCounts.open,
      awaitingCount: tabCounts.awaiting,
      avgResponseTime: "1h 24m",
      todayCount,
    };
  }, [permittedConversations, tabCounts]);

  const [createBookingConvId, setCreateBookingConvId] = useState<string | null>(null);

  const createBookingConversation = createBookingConvId
    ? allConversations.find((c) => c.id === createBookingConvId) ?? null
    : null;

  const handleBookingCreated = useCallback(
    (booking: Booking) => {
      if (!createBookingConvId) return;
      handleStatusChange(createBookingConvId, "converted");
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
    [createBookingConvId, handleStatusChange, allConversations]
  );

  return (
    <>
    <InboxLayout
      emptyState={<InboxEmptyState stats={emptyStateStats} onStatusTabChange={setActiveStatusTab} />}
      left={
        <ConversationList
          conversations={filteredConversations}
          unreadConversationIds={unreadConversationIds}
          selectedId={selectedId}
          onSelect={handleSelect}
          activeStatusTab={activeStatusTab}
          onStatusTabChange={setActiveStatusTab}
          tabCounts={tabCounts}
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortByChange={handleSortChange}
          onSortDirectionChange={handleDirectionToggle}
        />
      }
      middle={
        selectedConversation ? (
          <ConversationThread
            conversation={selectedConversation}
            localMessages={currentLocalMessages}
            onSend={handleSend}
            onStatusChange={handleStatusChange}
            onCreateBooking={(id) => setCreateBookingConvId(id)}
            onSnooze={handleSnooze}
            previousConversationId={previousSelectedId && previousSelectedId !== selectedId ? previousSelectedId : null}
          />
        ) : null
      }
      right={
        selectedConversation ? (
          <ContactDetailPanel
            conversation={selectedConversation}
            users={allUsers}
            allConversations={permittedConversations}
            onStatusChange={handleStatusChange}
            onAssigneeChange={handleAssigneeChange}
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

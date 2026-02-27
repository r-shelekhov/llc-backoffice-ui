import { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getAllConversationsWithRelations, conversations as sourceConversations } from "@/lib/mock-data";
import { filterConversationsByPermission, filterVipConversations } from "@/lib/permissions";
import { isConversationUnread } from "@/lib/unread";
import type { Channel, Communication, ConversationStatus, ConversationWithRelations, SortField, SortDirection, Priority } from "@/types";
import { InboxLayout } from "@/components/inbox/inbox-layout";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ConversationThread } from "@/components/inbox/conversation-thread";
import { ContactDetailPanel } from "@/components/inbox/contact-detail-panel";

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

  const [activeChannel, setActiveChannel] = useState<Channel | "all">("all");
  const [search, setSearch] = useState("");
  const [localMessages, setLocalMessages] = useState<
    Map<string, Communication[]>
  >(new Map());
  const [, forceUpdate] = useState(0);

  const allConversations = useMemo(() => getAllConversationsWithRelations(), []);

  const permittedConversations = useMemo(
    () => filterVipConversations(currentUser, filterConversationsByPermission(currentUser, allConversations)),
    [currentUser, allConversations]
  );

  const filteredConversations = useMemo(() => {
    let result = permittedConversations;

    // Filter by channel (concierge only visible in "all")
    if (activeChannel !== "all") {
      result = result.filter((r) => r.channel === activeChannel);
    }

    // Filter by search
    if (search) {
      result = result.filter((r) => matchesSearch(r, search));
    }

    return [...result].sort((a, b) => compareConversations(a, b, sortBy, sortDirection));
  }, [permittedConversations, activeChannel, search, sortBy, sortDirection]);

  const selectedConversation = useMemo(
    () => (selectedId ? permittedConversations.find((r) => r.id === selectedId) ?? null : null),
    [selectedId, permittedConversations]
  );

  useEffect(() => {
    if (!selectedConversation) return;
    markConversationRead(selectedConversation.id);
  }, [selectedConversation, markConversationRead]);

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
    (message: string) => {
      if (!selectedId) return;
      const newComm: Communication = {
        id: `local-${Date.now()}`,
        conversationId: selectedId,
        sender: "agent",
        senderName: currentUser.name,
        channel: selectedConversation?.channel ?? "web",
        message,
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

  return (
    <InboxLayout
      left={
        <ConversationList
          conversations={filteredConversations}
          unreadConversationIds={unreadConversationIds}
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
        />
      }
      middle={
        selectedConversation ? (
          <ConversationThread
            conversation={selectedConversation}
            localMessages={currentLocalMessages}
            onSend={handleSend}
            onStatusChange={handleStatusChange}
          />
        ) : null
      }
      right={
        selectedConversation ? (
          <ContactDetailPanel conversation={selectedConversation} users={allUsers} onStatusChange={handleStatusChange} />
        ) : null
      }
    />
  );
}

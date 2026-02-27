import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getAllConversationsWithRelations, conversations as sourceConversations } from "@/lib/mock-data";
import { filterConversationsByPermission, filterVipConversations } from "@/lib/permissions";
import type { Channel, Communication, ConversationStatus, ConversationWithRelations } from "@/types";
import { InboxLayout } from "@/components/inbox/inbox-layout";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ConversationThread } from "@/components/inbox/conversation-thread";
import { ContactDetailPanel } from "@/components/inbox/contact-detail-panel";

function getLastCommTime(conversation: ConversationWithRelations): number {
  if (conversation.communications.length === 0) return 0;
  return Math.max(
    ...conversation.communications.map((c) => new Date(c.createdAt).getTime())
  );
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
  const { currentUser, allUsers } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

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

    // Sort by most recent communication
    return [...result].sort(
      (a, b) => getLastCommTime(b) - getLastCommTime(a)
    );
  }, [permittedConversations, activeChannel, search]);

  const selectedConversation = useMemo(
    () => (selectedId ? permittedConversations.find((r) => r.id === selectedId) ?? null : null),
    [selectedId, permittedConversations]
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
      setSearchParams({ id });
    },
    [setSearchParams]
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
          selectedId={selectedId}
          onSelect={handleSelect}
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          search={search}
          onSearchChange={setSearch}
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

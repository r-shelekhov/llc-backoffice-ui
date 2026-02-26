import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getAllRequestsWithRelations } from "@/lib/mock-data";
import { filterRequestsByPermission } from "@/lib/permissions";
import type { Channel, Communication, RequestWithRelations } from "@/types";
import { InboxLayout } from "@/components/inbox/inbox-layout";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ConversationThread } from "@/components/inbox/conversation-thread";
import { ContactDetailPanel } from "@/components/inbox/contact-detail-panel";

function getLastCommTime(request: RequestWithRelations): number {
  if (request.communications.length === 0) return 0;
  return Math.max(
    ...request.communications.map((c) => new Date(c.createdAt).getTime())
  );
}

function matchesSearch(request: RequestWithRelations, query: string): boolean {
  const q = query.toLowerCase();
  return (
    request.client.name.toLowerCase().includes(q) ||
    request.title.toLowerCase().includes(q) ||
    request.communications.some((c) =>
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

  const allRequests = useMemo(() => getAllRequestsWithRelations(), []);

  const permittedRequests = useMemo(
    () => filterRequestsByPermission(currentUser, allRequests),
    [currentUser, allRequests]
  );

  const filteredRequests = useMemo(() => {
    let result = permittedRequests;

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
  }, [permittedRequests, activeChannel, search]);

  const selectedRequest = useMemo(
    () => (selectedId ? permittedRequests.find((r) => r.id === selectedId) ?? null : null),
    [selectedId, permittedRequests]
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
        requestId: selectedId,
        sender: "agent",
        senderName: currentUser.name,
        channel: selectedRequest?.channel ?? "web",
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
    [selectedId, currentUser.name, selectedRequest?.channel]
  );

  const currentLocalMessages = selectedId
    ? localMessages.get(selectedId) ?? []
    : [];

  return (
    <InboxLayout
      left={
        <ConversationList
          requests={filteredRequests}
          selectedId={selectedId}
          onSelect={handleSelect}
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          search={search}
          onSearchChange={setSearch}
        />
      }
      middle={
        selectedRequest ? (
          <ConversationThread
            request={selectedRequest}
            localMessages={currentLocalMessages}
            onSend={handleSend}
          />
        ) : null
      }
      right={
        selectedRequest ? (
          <ContactDetailPanel request={selectedRequest} users={allUsers} />
        ) : null
      }
    />
  );
}

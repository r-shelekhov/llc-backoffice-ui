import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Communication, ConversationWithRelations } from "@/types";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import { CommunicationTimeline } from "@/components/request-detail/communication-timeline";
import { Button } from "@/components/ui/button";
import { MessageComposer } from "./message-composer";

interface ConversationThreadProps {
  conversation: ConversationWithRelations;
  localMessages: Communication[];
  onSend: (message: string) => void;
}

export function ConversationThread({
  conversation,
  localMessages,
  onSend,
}: ConversationThreadProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const allMessages = [...conversation.communications, ...localMessages];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.id, allMessages.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{conversation.title}</h3>
            <ChannelIcon channel={conversation.channel} className="size-3.5 shrink-0 text-muted-foreground" />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => navigate(`/requests/${conversation.id}`)}
          >
            Full Details
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge type="conversation" status={conversation.status} />
          <PriorityBadge priority={conversation.priority} />
          <SlaBadge state={conversation.slaState} />
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <CommunicationTimeline communications={allMessages} />
      </div>
      <MessageComposer onSend={onSend} />
    </div>
  );
}

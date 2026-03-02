import { useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Clock, Eye } from "lucide-react";
import type { Attachment, Communication, ConversationWithRelations } from "@/types";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import { CommunicationTimeline } from "@/components/conversation-detail/communication-timeline";
import { Button } from "@/components/ui/button";
import { MessageComposer } from "./message-composer";
import { formatDuration } from "@/lib/format";

// Deterministic mock collision: use conversation ID hash
function hasCollision(conversationId: string): { active: boolean; agentName: string } {
  const hash = conversationId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  if (hash % 3 !== 0) return { active: false, agentName: "" };
  const agents = ["Sophie Laurent", "David Kim", "Anna Petrova"];
  return { active: true, agentName: agents[hash % agents.length] };
}

interface ConversationThreadProps {
  conversation: ConversationWithRelations;
  localMessages: Communication[];
  onSend: (message: string, attachments?: Attachment[]) => void;
  onCreateBooking: (conversationId: string) => void;
  previousConversationId?: string | null;
}

export function ConversationThread({
  conversation,
  localMessages,
  onSend,
  onCreateBooking,
  previousConversationId,
}: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const allMessages = [...conversation.communications, ...localMessages];

  // Compute waiting time
  const waitingSince = useMemo(() => {
    const nonSystemMsgs = allMessages.filter((c) => c.sender !== "system");
    if (nonSystemMsgs.length === 0) return null;
    const sorted = [...nonSystemMsgs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const latest = sorted[0];
    if (latest.sender === "client") {
      return Date.now() - new Date(latest.createdAt).getTime();
    }
    return null;
  }, [allMessages]);

  const collision = useMemo(() => hasCollision(conversation.id), [conversation.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.id, allMessages.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b px-4 py-3">
        {previousConversationId && (
          <div className="mb-2">
            <Button variant="ghost" size="sm" className="-ml-2 h-7 text-xs" asChild>
              <Link to={`/inbox?id=${previousConversationId}`}>
                <ArrowLeft className="size-3.5" />
                Back to previous conversation
              </Link>
            </Button>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{conversation.title}</h3>
            <ChannelIcon channel={conversation.channel} className="size-3.5 shrink-0 text-muted-foreground" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              onClick={() => onCreateBooking(conversation.id)}
            >
              <Plus className="size-4" />
              Create Booking
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Priority</p>
              <div className="mt-1">
                <PriorityBadge priority={conversation.priority} />
              </div>
          </div>
          <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">SLA</p>
              <div className="mt-1">
                <SlaBadge state={conversation.slaState} />
              </div>
          </div>
        </div>
      </div>
      {collision.active && (
        <div className="flex items-center gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2 text-xs text-primary">
          <Eye className="size-3.5 shrink-0" />
          <span>{collision.agentName} is also viewing this conversation</span>
        </div>
      )}
      {waitingSince !== null && waitingSince > 60000 && (
        <div className="flex items-center gap-2 border-b bg-tone-warning-light px-4 py-2 text-xs font-medium text-tone-warning-foreground">
          <Clock className="size-3.5 shrink-0" />
          <span>Client waiting for {formatDuration(waitingSince)}</span>
        </div>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <CommunicationTimeline communications={allMessages} />
      </div>
      <MessageComposer onSend={onSend} />
    </div>
  );
}

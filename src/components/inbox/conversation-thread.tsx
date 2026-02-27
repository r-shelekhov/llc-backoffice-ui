import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import type { Communication, ConversationStatus, ConversationWithRelations } from "@/types";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import { CommunicationTimeline } from "@/components/request-detail/communication-timeline";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MessageComposer } from "./message-composer";
import { CONVERSATION_STATUS_TRANSITIONS, CONVERSATION_STATUS_LABELS } from "@/lib/constants";

interface ConversationThreadProps {
  conversation: ConversationWithRelations;
  localMessages: Communication[];
  onSend: (message: string) => void;
  onStatusChange: (conversationId: string, newStatus: ConversationStatus) => void;
}

export function ConversationThread({
  conversation,
  localMessages,
  onSend,
  onStatusChange,
}: ConversationThreadProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const allMessages = [...conversation.communications, ...localMessages];
  const transitions = CONVERSATION_STATUS_TRANSITIONS[conversation.status];
  const showCreateBooking = conversation.status !== "converted" && conversation.status !== "closed";

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
          <div className="flex shrink-0 items-center gap-2">
            {showCreateBooking && (
              <Button
                size="sm"
                onClick={() => {
                  onStatusChange(conversation.id, "converted");
                  navigate(`/bookings/new?conversationId=${conversation.id}`);
                }}
              >
                <Plus className="size-4" />
                Create Booking
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/conversations/${conversation.id}`)}
            >
              Full Details
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {transitions.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex cursor-pointer items-center gap-1">
                  <StatusBadge type="conversation" status={conversation.status} />
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {transitions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusChange(conversation.id, status)}
                  >
                    {CONVERSATION_STATUS_LABELS[status]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <StatusBadge type="conversation" status={conversation.status} />
          )}
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

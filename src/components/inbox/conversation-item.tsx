import { Crown } from "lucide-react";
import type { ConversationWithRelations } from "@/types";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  conversation: ConversationWithRelations;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const lastComm = conversation.communications.length
    ? conversation.communications.reduce((a, b) =>
        a.createdAt > b.createdAt ? a : b
      )
    : null;

  const isUnread =
    conversation.status === "new" || conversation.status === "awaiting_client";

  const preview = lastComm
    ? `${lastComm.sender === "agent" ? "You: " : ""}${lastComm.message}`
    : "No messages yet";

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full gap-3 border-l-2 border-l-transparent px-4 py-3 text-left transition-colors hover:bg-accent/30",
        isSelected && "border-l-primary bg-accent/50"
      )}
    >
      <img
        src={conversation.client.avatarUrl}
        alt={conversation.client.name}
        className="size-10 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate text-sm font-medium">
              {conversation.client.name}
            </span>
            {conversation.client.isVip && (
              <Crown className="size-3 shrink-0 text-amber-500" />
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {lastComm ? formatRelativeTime(lastComm.createdAt) : ""}
          </span>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {conversation.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground/70">
            {preview}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <ChannelIcon
              channel={conversation.channel}
              className="size-3 text-muted-foreground"
            />
            {isUnread && (
              <span className="size-2 rounded-full bg-primary" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

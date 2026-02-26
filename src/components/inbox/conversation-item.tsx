import { Crown } from "lucide-react";
import type { RequestWithRelations } from "@/types";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  request: RequestWithRelations;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  request,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const lastComm = request.communications.length
    ? request.communications.reduce((a, b) =>
        a.createdAt > b.createdAt ? a : b
      )
    : null;

  const isUnread =
    request.status === "new" || request.status === "action_required";

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
        src={request.client.avatarUrl}
        alt={request.client.name}
        className="size-10 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate text-sm font-medium">
              {request.client.name}
            </span>
            {request.client.isVip && (
              <Crown className="size-3 shrink-0 text-amber-500" />
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {lastComm ? formatRelativeTime(lastComm.createdAt) : ""}
          </span>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {request.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground/70">
            {preview}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <ChannelIcon
              channel={request.channel}
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

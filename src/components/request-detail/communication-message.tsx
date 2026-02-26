import { Paperclip } from "lucide-react";
import { formatRelativeTime, formatFileSize } from "@/lib/format";
import type { Communication } from "@/types";

interface CommunicationMessageProps {
  communication: Communication;
}

export function CommunicationMessage({
  communication,
}: CommunicationMessageProps) {
  if (communication.sender === "system") {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 border-t border-muted" />
        <p className="text-sm text-muted-foreground italic text-center shrink-0">
          {communication.message}
        </p>
        <div className="flex-1 border-t border-muted" />
      </div>
    );
  }

  const isAgent = communication.sender === "agent";

  return (
    <div
      className={`flex ${isAgent ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`rounded-lg p-3 max-w-[80%] ${
          isAgent ? "bg-accent" : "bg-muted"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="text-xs font-medium">
            {communication.senderName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(communication.createdAt)}
          </span>
        </div>

        <p className="text-sm">{communication.message}</p>

        {communication.attachments && communication.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {communication.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-1.5 rounded-md bg-background/50 px-2 py-1 text-xs"
              >
                <Paperclip className="size-3" />
                <span>{attachment.name}</span>
                <span className="text-muted-foreground">
                  ({formatFileSize(attachment.size)})
                </span>
              </div>
            ))}
          </div>
        )}

        {communication.tags && communication.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {communication.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

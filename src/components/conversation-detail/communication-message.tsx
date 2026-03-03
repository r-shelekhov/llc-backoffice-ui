import { Paperclip, Check, CheckCheck } from "lucide-react";
import { formatRelativeTime, formatFileSize } from "@/lib/format";
import { DELIVERY_STATUS_LABELS } from "@/lib/constants";
import type { Communication } from "@/types";
import { ServiceMessage } from "./service-message";

function getTagStyle(tag: string): string {
  switch (tag.toLowerCase()) {
    case "vip":
      return "bg-tone-vip-light text-tone-vip-foreground border-tone-vip-foreground/20";
    case "urgent":
      return "bg-tone-danger-light text-tone-danger-foreground border-tone-danger-foreground/20";
    case "follow-up":
      return "bg-tone-warning-light text-tone-warning-foreground border-tone-warning-foreground/20";
    default:
      return "bg-tone-info-light text-tone-info-foreground border-tone-info-foreground/20";
  }
}

interface CommunicationMessageProps {
  communication: Communication;
  onSharePaymentLink?: () => void;
}

export function CommunicationMessage({
  communication,
  onSharePaymentLink,
}: CommunicationMessageProps) {
  if (communication.sender === "system") {
    if (communication.event) {
      return <ServiceMessage communication={communication} onSharePaymentLink={onSharePaymentLink} />;
    }

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

        {isAgent && communication.deliveryStatus && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            {communication.deliveryStatus === "sent" && <Check className="size-3" />}
            {communication.deliveryStatus === "delivered" && <CheckCheck className="size-3" />}
            {communication.deliveryStatus === "read" && <CheckCheck className="size-3 text-primary" />}
            <span>{DELIVERY_STATUS_LABELS[communication.deliveryStatus]}</span>
          </div>
        )}

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
                className={`text-[11px] font-medium rounded-full px-2 py-0.5 border ${getTagStyle(tag)}`}
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

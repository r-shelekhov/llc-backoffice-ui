import type { Communication } from "@/types";
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, StickyNote } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CallLogEntryProps {
  communication: Communication;
}

function formatCallDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CallLogEntry({ communication }: CallLogEntryProps) {
  const { call, message, senderName, createdAt } = communication;

  if (!call) return null;

  const isMissed = call.outcome === "missed" || call.outcome === "no_answer";

  const DirectionIcon =
    isMissed
      ? PhoneMissed
      : call.direction === "inbound"
        ? PhoneIncoming
        : PhoneOutgoing;

  const directionLabel =
    isMissed
      ? call.outcome === "voicemail"
        ? "Voicemail"
        : call.outcome === "missed"
          ? "Missed call"
          : "No answer"
      : call.direction === "inbound"
        ? "Inbound call"
        : "Outbound call";

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        isMissed && "border-destructive/30 bg-destructive/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <DirectionIcon
            className={cn("size-4 shrink-0", isMissed ? "text-destructive" : "text-muted-foreground")}
          />
          <span className={cn(isMissed && "text-destructive")}>
            {directionLabel}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground font-normal">{senderName}</span>
        </div>
        {call.duration != null && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatCallDuration(call.duration)}
          </span>
        )}
      </div>

      <p className="mt-0.5 text-xs text-muted-foreground">
        {formatDateTime(createdAt)}
      </p>

      {message && (
        <p className="mt-2 text-sm">{message}</p>
      )}

      {call.notes && (
        <div className="mt-2 flex gap-1.5 text-xs text-muted-foreground">
          <StickyNote className="mt-0.5 size-3 shrink-0" />
          <p>{call.notes}</p>
        </div>
      )}
    </div>
  );
}

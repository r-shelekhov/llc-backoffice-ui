import { CheckCircle2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

interface ResolutionSeparatorProps {
  resolvedBy: string;
  resolvedAt: string;
}

export function ResolutionSeparator({ resolvedBy, resolvedAt }: ResolutionSeparatorProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-3">
      <div className="flex w-full items-center gap-3">
        <div className="flex-1 border-t border-tone-success/30" />
        <span className="flex items-center gap-1.5 rounded-full bg-tone-success-light px-3 py-1 text-xs font-medium text-tone-success-foreground">
          <CheckCircle2 className="size-3.5" />
          Conversation resolved
        </span>
        <div className="flex-1 border-t border-tone-success/30" />
      </div>
      <p className="text-[11px] text-muted-foreground">
        by {resolvedBy} · {formatRelativeTime(resolvedAt)}
      </p>
    </div>
  );
}

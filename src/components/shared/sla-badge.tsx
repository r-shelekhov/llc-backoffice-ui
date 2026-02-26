import { Badge } from "@/components/ui/badge";
import { SLA_STATE_LABELS, SLA_STATE_COLORS } from "@/lib/constants";
import type { SlaState } from "@/types";
import { cn } from "@/lib/utils";

interface SlaBadgeProps {
  state: SlaState;
}

export function SlaBadge({ state }: SlaBadgeProps) {
  return (
    <Badge variant="outline" className={cn("gap-1.5", SLA_STATE_COLORS[state])}>
      <span
        className="size-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {SLA_STATE_LABELS[state]}
    </Badge>
  );
}

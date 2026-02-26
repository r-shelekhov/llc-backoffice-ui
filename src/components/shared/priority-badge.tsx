import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import type { Priority } from "@/types";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge variant="outline" className={cn("gap-1.5", PRIORITY_COLORS[priority])}>
      <span
        className="size-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

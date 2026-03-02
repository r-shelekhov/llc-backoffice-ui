import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface BillingStatusTabsProps<S extends string> {
  items: { status: S }[];
  statuses: (S | null)[];
  labels: Record<S, string>;
  activeStatus: S | null;
  onStatusChange: (status: S | null) => void;
}

export function BillingStatusTabs<S extends string>({
  items,
  statuses,
  labels,
  activeStatus,
  onStatusChange,
}: BillingStatusTabsProps<S>) {
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const item of items) {
      map[item.status] = (map[item.status] ?? 0) + 1;
    }
    return map;
  }, [items]);

  return (
    <div className="flex gap-1 border-b">
      {statuses.map((status) => {
        const isActive = status === activeStatus;
        const label = status ? labels[status] : "All";
        const count = status ? (counts[status] ?? 0) : counts.all;

        return (
          <button
            key={status ?? "all"}
            onClick={() => onStatusChange(status)}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            <span
              className={cn(
                "ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs",
                isActive
                  ? "bg-foreground/10 text-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
            {isActive && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}

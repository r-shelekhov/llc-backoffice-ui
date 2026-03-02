import { useMemo } from "react";
import type { BookingStatus, BookingWithRelations } from "@/types";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BookingStatusTabsProps {
  bookings: BookingWithRelations[];
  activeStatus: BookingStatus | null;
  onStatusChange: (status: BookingStatus | null) => void;
}

const TAB_STATUSES: (BookingStatus | null)[] = [
  null,
  "draft",
  "awaiting_payment",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

export function BookingStatusTabs({ bookings, activeStatus, onStatusChange }: BookingStatusTabsProps) {
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: bookings.length };
    for (const b of bookings) {
      map[b.status] = (map[b.status] ?? 0) + 1;
    }
    return map;
  }, [bookings]);

  return (
    <div className="flex gap-1 border-b">
      {TAB_STATUSES.map((status) => {
        const isActive = status === activeStatus;
        const label = status ? BOOKING_STATUS_LABELS[status] : "All";
        const count = status ? (counts[status] ?? 0) : counts.all;

        return (
          <button
            key={status ?? "all"}
            onClick={() => onStatusChange(status)}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            <span
              className={cn(
                "ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs",
                isActive
                  ? "bg-foreground/10 text-foreground"
                  : "bg-muted text-muted-foreground"
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

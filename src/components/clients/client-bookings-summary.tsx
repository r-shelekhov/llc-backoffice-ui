import { useNavigate } from "react-router-dom";
import type { Booking } from "@/types";
import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

const ACTIVE_STATUSES = new Set(["draft", "awaiting_payment", "scheduled", "in_progress"]);

interface ClientBookingsSummaryProps {
  bookings: Booking[];
  clientId: string;
  conversationId?: string;
}

export function ClientBookingsSummary({ bookings, clientId, conversationId }: ClientBookingsSummaryProps) {
  const navigate = useNavigate();
  const activeBookings = bookings.filter((b) => ACTIVE_STATUSES.has(b.status));

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Bookings
        </h4>
        {activeBookings.length > 0 && (
          <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5 text-[10px]">
            {activeBookings.length}
          </Badge>
        )}
      </div>

      {activeBookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active bookings</p>
      ) : (
        <div className="space-y-2">
          {activeBookings.map((booking) => (
            <button
              key={booking.id}
              className="w-full rounded-md border p-2.5 text-left transition-colors hover:bg-muted/50"
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              <p className="truncate text-sm font-medium">{booking.title}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                  {BOOKING_STATUS_LABELS[booking.status]}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatCurrency(booking.price)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {bookings.length > 0 && (
        <button
          className="mt-3 text-xs font-medium text-primary hover:underline"
          onClick={() => navigate(`/bookings?clientId=${clientId}`, conversationId ? { state: { from: "conversation", conversationId } } : undefined)}
        >
          View all {bookings.length} bookings →
        </button>
      )}
    </div>
  );
}

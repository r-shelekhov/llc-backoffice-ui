import { Link } from "react-router-dom";
import { ArrowRight, LinkIcon } from "lucide-react";
import { formatRelativeTime, formatCurrency } from "@/lib/format";
import { BOOKING_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import type { Communication } from "@/types";

interface ServiceMessageProps {
  communication: Communication;
  onSharePaymentLink?: () => void;
}

export function ServiceMessage({
  communication,
  onSharePaymentLink,
}: ServiceMessageProps) {
  const event = communication.event;
  if (!event) return null;

  let icon: string;
  let line1: string;
  let line2: string | null = null;
  let showOpenBooking = false;
  let showSharePaymentLink = false;

  switch (event.type) {
    case "booking_created":
      icon = "📋";
      line1 = "Booking created";
      line2 = [event.title, event.bookingId].filter(Boolean).join(" · ");
      showOpenBooking = true;
      break;
    case "booking_status_changed":
      icon = "📋";
      line1 = event.toStatus
        ? `Status → ${BOOKING_STATUS_LABELS[event.toStatus]}`
        : "Status changed";
      line2 = [event.title, event.bookingId].filter(Boolean).join(" · ");
      showOpenBooking = true;
      break;
    case "invoice_created":
      icon = "🧾";
      line1 = `Invoice created${event.invoiceTotal != null ? ` · ${formatCurrency(event.invoiceTotal)}` : ""}`;
      line2 = event.invoiceId ?? null;
      showSharePaymentLink = true;
      break;
    case "invoice_sent":
      icon = "📨";
      line1 = `Invoice sent${event.invoiceTotal != null ? ` · ${formatCurrency(event.invoiceTotal)}` : ""}`;
      line2 = event.invoiceId ?? null;
      showSharePaymentLink = true;
      break;
    case "payment_confirmed":
      icon = "✅";
      line1 = `Payment confirmed${event.paymentAmount != null ? ` · ${formatCurrency(event.paymentAmount)}` : ""}`;
      line2 = [
        event.paymentMethod ? PAYMENT_METHOD_LABELS[event.paymentMethod] : null,
        event.invoiceId,
      ]
        .filter(Boolean)
        .join(" · ");
      break;
    default:
      return null;
  }

  return (
    <div className="flex justify-center py-2">
      <div className="mx-auto max-w-[350px] rounded-lg border border-dashed bg-muted/30 px-4 py-2 text-center">
        <p className="text-sm font-medium">
          {icon} {line1}
        </p>
        {line2 && (
          <p className="text-xs text-muted-foreground">{line2}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(communication.createdAt)}
        </p>
        {(showOpenBooking || showSharePaymentLink) && (
          <div className="mt-1 flex items-center justify-center gap-3">
            {showOpenBooking && event.bookingId && (
              <Link
                to={`/bookings/${event.bookingId}`}
                state={{
                  from: "conversation",
                  conversationId: communication.conversationId,
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Open booking <ArrowRight className="size-3" />
              </Link>
            )}
            {showSharePaymentLink && (
              <button
                type="button"
                onClick={() => onSharePaymentLink?.()}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <LinkIcon className="size-3" /> Share payment link
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

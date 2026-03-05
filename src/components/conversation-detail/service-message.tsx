import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Globe,
  LinkIcon,
  ClipboardList,
  FileText,
  Send,
  CircleCheck,
} from "lucide-react";
import { formatRelativeTime, formatCurrency } from "@/lib/format";
import { BOOKING_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import type { Communication } from "@/types";

interface ServiceMessageProps {
  communication: Communication;
  onSharePaymentLink?: () => void;
  onCreateInvoice?: () => void;
}

export function ServiceMessage({
  communication,
  onSharePaymentLink,
  onCreateInvoice,
}: ServiceMessageProps) {
  const event = communication.event;
  if (!event) return null;

  let icon: ReactNode;
  let line1: string;
  let line2: string | null = null;
  let refId: string | null = null;
  let showOpenBooking = false;
  let showSharePaymentLink = false;
  let showCreateInvoice = false;

  switch (event.type) {
    case "web_form_submitted":
      icon = <Globe className="size-4 text-muted-foreground" />;
      line1 = "Received from website";
      line2 = event.title ?? null;
      break;
    case "booking_created":
      icon = <ClipboardList className="size-4 text-muted-foreground" />;
      line1 = "Booking created";
      line2 = event.title ?? null;
      refId = event.bookingId ?? null;
      showOpenBooking = true;
      showCreateInvoice = true;
      break;
    case "booking_status_changed":
      icon = <ClipboardList className="size-4 text-muted-foreground" />;
      line1 = event.toStatus
        ? `Status → ${BOOKING_STATUS_LABELS[event.toStatus]}`
        : "Status changed";
      line2 = event.title ?? null;
      refId = event.bookingId ?? null;
      showOpenBooking = true;
      break;
    case "invoice_created":
      icon = <FileText className="size-4 text-muted-foreground" />;
      line1 = `Invoice created${event.invoiceTotal != null ? ` · ${formatCurrency(event.invoiceTotal)}` : ""}`;
      refId = event.invoiceId ?? null;
      showSharePaymentLink = !!onSharePaymentLink;
      break;
    case "invoice_sent":
      icon = <Send className="size-4 text-muted-foreground" />;
      line1 = `Invoice sent${event.invoiceTotal != null ? ` · ${formatCurrency(event.invoiceTotal)}` : ""}`;
      refId = event.invoiceId ?? null;
      break;
    case "payment_confirmed":
      icon = <CircleCheck className="size-4 text-muted-foreground" />;
      line1 = `Payment confirmed${event.paymentAmount != null ? ` · ${formatCurrency(event.paymentAmount)}` : ""}`;
      line2 = event.paymentMethod
        ? PAYMENT_METHOD_LABELS[event.paymentMethod]
        : null;
      refId = event.invoiceId ?? null;
      showOpenBooking = true;
      break;
    default:
      return null;
  }

  return (
    <div className="flex justify-center py-2">
      <div className="w-[340px] rounded-lg border border-dashed bg-muted/30 px-4 py-2 text-center">
        <p className="flex items-center justify-center gap-1.5 text-sm font-medium">
          {icon} {line1}
        </p>
        {line2 && (
          <p className="mt-1 text-xs text-muted-foreground">{line2}</p>
        )}
        {refId && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">{refId}</p>
        )}
        {(showOpenBooking || showSharePaymentLink || showCreateInvoice) && (
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
                <Calendar className="size-3" /> Open booking
              </Link>
            )}
            {showCreateInvoice && (
              <button
                type="button"
                onClick={onCreateInvoice ? () => onCreateInvoice() : undefined}
                disabled={!onCreateInvoice}
                className={`inline-flex items-center gap-1 text-xs font-medium ${onCreateInvoice ? "text-primary hover:underline" : "text-muted-foreground/50 cursor-not-allowed"}`}
              >
                <FileText className="size-3" /> Create Invoice
              </button>
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
        <p className="mt-2 text-xs text-muted-foreground">
          {formatRelativeTime(communication.createdAt)}
        </p>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  CONVERSATION_STATUS_COLORS,
  CONVERSATION_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import type { ConversationStatus, BookingStatus, InvoiceStatus, PaymentStatus } from "@/types";
import { cn } from "@/lib/utils";

type StatusBadgeProps =
  | { type: "conversation"; status: ConversationStatus }
  | { type: "booking"; status: BookingStatus }
  | { type: "invoice"; status: InvoiceStatus }
  | { type: "payment"; status: PaymentStatus };

const colorMaps = {
  conversation: CONVERSATION_STATUS_COLORS,
  booking: BOOKING_STATUS_COLORS,
  invoice: INVOICE_STATUS_COLORS,
  payment: PAYMENT_STATUS_COLORS,
} as const;

const labelMaps = {
  conversation: CONVERSATION_STATUS_LABELS,
  booking: BOOKING_STATUS_LABELS,
  invoice: INVOICE_STATUS_LABELS,
  payment: PAYMENT_STATUS_LABELS,
} as const;

export function StatusBadge({ type, status }: StatusBadgeProps) {
  const colors = colorMaps[type] as Record<string, string>;
  const labels = labelMaps[type] as Record<string, string>;
  const colorClass = colors[status] ?? "";
  const label = labels[status] ?? status;

  return (
    <Badge variant="outline" className={cn("gap-1.5", colorClass)}>
      <span
        className="size-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {label}
    </Badge>
  );
}

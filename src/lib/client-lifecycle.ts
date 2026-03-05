import type { Booking, Invoice, Payment, Client, LifecycleStatus } from "@/types";

const PAID_BOOKING_STATUSES: Booking["status"][] = [
  "paid",
  "scheduled",
  "in_progress",
  "completed",
];

const PAID_PAYMENT_STATUSES: Payment["status"][] = ["succeeded", "refunded"];

export function hasPaidEvidenceForBooking(
  booking: Booking,
  invoices: Invoice[],
  payments: Payment[],
): boolean {
  if (PAID_BOOKING_STATUSES.includes(booking.status)) return true;

  const bookingInvoiceIds = new Set(
    invoices.filter((i) => i.bookingId === booking.id).map((i) => i.id),
  );

  if (invoices.some((i) => i.bookingId === booking.id && i.status === "paid")) {
    return true;
  }

  if (
    payments.some(
      (p) =>
        bookingInvoiceIds.has(p.invoiceId) &&
        PAID_PAYMENT_STATUSES.includes(p.status),
    )
  ) {
    return true;
  }

  return false;
}

export function getClientIdsWithPaidBookings(
  bookings: Booking[],
  invoices: Invoice[],
  payments: Payment[],
): Set<string> {
  const ids = new Set<string>();
  for (const booking of bookings) {
    if (hasPaidEvidenceForBooking(booking, invoices, payments)) {
      ids.add(booking.clientId);
    }
  }
  return ids;
}

export function resolveLifecycleStatus(
  client: Client,
  paidClientIds: Set<string>,
): LifecycleStatus {
  if (client.lifecycleStatus === "client") return "client";
  if (paidClientIds.has(client.id)) return "client";
  return "lead";
}

export function promoteClientToClient(client: Client): void {
  client.lifecycleStatus = "client";
}

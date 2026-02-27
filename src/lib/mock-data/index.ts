import type { ConversationWithRelations, BookingWithRelations, InvoiceWithRelations, PaymentWithRelations } from "@/types";

export { users } from "./users";
export { clients } from "./clients";
export { conversations } from "./conversations";
export { bookings } from "./bookings";
export { communications } from "./communications";
export { internalNotes } from "./internal-notes";
export { invoices } from "./invoices";
export { payments } from "./payments";

import { users } from "./users";
import { clients } from "./clients";
import { conversations } from "./conversations";
import { bookings } from "./bookings";
import { communications } from "./communications";
import { internalNotes } from "./internal-notes";
import { invoices } from "./invoices";
import { payments } from "./payments";

function computeSlaState(status: string, slaDueAt: string): "on_track" | "at_risk" | "breached" {
  if (status === "converted" || status === "closed") {
    return "on_track";
  }

  const now = new Date();
  const dueDate = new Date(slaDueAt);
  const twoHoursMs = 2 * 60 * 60 * 1000;

  if (dueDate.getTime() < now.getTime()) {
    return "breached";
  }

  if (dueDate.getTime() - now.getTime() <= twoHoursMs) {
    return "at_risk";
  }

  return "on_track";
}

export function getConversationWithRelations(conversationId: string): ConversationWithRelations | null {
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) return null;

  const client = clients.find((c) => c.id === conversation.clientId) ?? null;
  const assignee = conversation.assigneeId ? (users.find((u) => u.id === conversation.assigneeId) ?? null) : null;
  const convCommunications = communications.filter((c) => c.conversationId === conversationId);
  const convNotes = internalNotes.filter((n) => n.conversationId === conversationId);
  const convBookings = bookings.filter((b) => b.conversationId === conversationId);
  const convBookingIds = new Set(convBookings.map((b) => b.id));
  const convInvoices = invoices.filter((i) => convBookingIds.has(i.bookingId));
  const convPayments = payments.filter((p) =>
    convInvoices.some((i) => i.id === p.invoiceId)
  );
  const slaState = computeSlaState(conversation.status, conversation.slaDueAt);

  return {
    ...conversation,
    client: client!,
    assignee,
    communications: convCommunications,
    internalNotes: convNotes,
    invoices: convInvoices,
    payments: convPayments,
    slaState,
  };
}

export function getBookingWithRelations(bookingId: string): BookingWithRelations | null {
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return null;

  const client = clients.find((c) => c.id === booking.clientId) ?? null;
  const assignee = booking.assigneeId ? (users.find((u) => u.id === booking.assigneeId) ?? null) : null;
  const conversation = conversations.find((c) => c.id === booking.conversationId) ?? null;
  const bookingInvoices = invoices.filter((i) => i.bookingId === bookingId);
  const bookingPayments = payments.filter((p) =>
    bookingInvoices.some((i) => i.id === p.invoiceId)
  );

  return {
    ...booking,
    client: client!,
    assignee,
    conversation: conversation!,
    invoices: bookingInvoices,
    payments: bookingPayments,
  };
}

export function getInvoiceWithRelations(invoiceId: string): InvoiceWithRelations | null {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return null;

  const client = clients.find((c) => c.id === invoice.clientId) ?? null;
  const booking = bookings.find((b) => b.id === invoice.bookingId) ?? null;
  const invoicePayments = payments.filter((p) => p.invoiceId === invoiceId);

  return {
    ...invoice,
    client: client!,
    booking: booking!,
    payments: invoicePayments,
  };
}

export function getPaymentWithRelations(paymentId: string): PaymentWithRelations | null {
  const payment = payments.find((p) => p.id === paymentId);
  if (!payment) return null;

  const invoice = invoices.find((i) => i.id === payment.invoiceId) ?? null;
  const client = clients.find((c) => c.id === payment.clientId) ?? null;
  const booking = invoice ? (bookings.find((b) => b.id === invoice.bookingId) ?? null) : null;

  return {
    ...payment,
    invoice: invoice!,
    client: client!,
    booking: booking!,
  };
}

export function getAllConversationsWithRelations(): ConversationWithRelations[] {
  return conversations
    .map((c) => getConversationWithRelations(c.id))
    .filter((c): c is ConversationWithRelations => c !== null);
}

export function getAllBookingsWithRelations(): BookingWithRelations[] {
  return bookings
    .map((b) => getBookingWithRelations(b.id))
    .filter((b): b is BookingWithRelations => b !== null);
}

export function getAllInvoicesWithRelations(): InvoiceWithRelations[] {
  return invoices
    .map((i) => getInvoiceWithRelations(i.id))
    .filter((i): i is InvoiceWithRelations => i !== null);
}

export function getAllPaymentsWithRelations(): PaymentWithRelations[] {
  return payments
    .map((p) => getPaymentWithRelations(p.id))
    .filter((p): p is PaymentWithRelations => p !== null);
}

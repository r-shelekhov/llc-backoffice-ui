import type { ConversationWithRelations, BookingWithRelations, InvoiceWithRelations, PaymentWithRelations, StatementWithRelations } from "@/types";
import { computeSlaState } from "@/lib/sla";
import { getClientIdsWithPaidBookings, resolveLifecycleStatus } from "@/lib/client-lifecycle";

export { users } from "./users";
export { clients } from "./clients";
export { conversations } from "./conversations";
export { bookings } from "./bookings";
export { communications } from "./communications";
export { internalNotes } from "./internal-notes";
export { invoices } from "./invoices";
export { payments } from "./payments";
export { statements } from "./statements";

import { users } from "./users";
import { clients } from "./clients";
import { conversations } from "./conversations";
import { bookings } from "./bookings";
import { communications } from "./communications";
import { internalNotes } from "./internal-notes";
import { invoices } from "./invoices";
import { payments } from "./payments";
import { statements } from "./statements";

export function getConversationWithRelations(conversationId: string): ConversationWithRelations | null {
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) return null;

  const client = clients.find((c) => c.id === conversation.clientId) ?? null;
  const managers = conversation.managerIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is typeof users[number] => u != null);
  const convCommunications = communications.filter((c) => c.conversationId === conversationId);
  const convNotes = internalNotes.filter((n) => n.conversationId === conversationId);
  const convBookings = bookings.filter((b) => b.conversationId === conversationId);
  const convBookingIds = new Set(convBookings.map((b) => b.id));
  const convInvoices = invoices.filter((i) => convBookingIds.has(i.bookingId));
  const convPayments = payments.filter((p) =>
    convInvoices.some((i) => i.id === p.invoiceId)
  );
  const slaState = computeSlaState(conversation.slaDueAt);
  const paidClientIds = getClientIdsWithPaidBookings(bookings, invoices, payments);
  const lifecycleStatus = resolveLifecycleStatus(client!, paidClientIds);

  return {
    ...conversation,
    client: client!,
    managers,
    communications: convCommunications,
    internalNotes: convNotes,
    bookings: convBookings,
    invoices: convInvoices,
    payments: convPayments,
    slaState,
    lifecycleStatus,
  };
}

export function getBookingWithRelations(bookingId: string): BookingWithRelations | null {
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return null;

  const client = clients.find((c) => c.id === booking.clientId) ?? null;
  const managers = booking.managerIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is typeof users[number] => u != null);
  const conversation = conversations.find((c) => c.id === booking.conversationId) ?? null;
  const bookingInvoices = invoices.filter((i) => i.bookingId === bookingId);
  const bookingPayments = payments.filter((p) =>
    bookingInvoices.some((i) => i.id === p.invoiceId)
  );

  return {
    ...booking,
    client: client!,
    managers,
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

export function getStatementWithRelations(statementId: string): StatementWithRelations | null {
  const statement = statements.find((s) => s.id === statementId);
  if (!statement) return null;

  const client = clients.find((c) => c.id === statement.clientId) ?? null;
  const statementInvoices = statement.invoiceIds
    .map((invId) => getInvoiceWithRelations(invId))
    .filter((i): i is InvoiceWithRelations => i !== null);

  return {
    ...statement,
    client: client!,
    invoices: statementInvoices,
  };
}

export function getAllStatementsWithRelations(): StatementWithRelations[] {
  return statements
    .map((s) => getStatementWithRelations(s.id))
    .filter((s): s is StatementWithRelations => s !== null);
}

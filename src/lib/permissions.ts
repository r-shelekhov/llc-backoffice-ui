import type { User, Conversation, ConversationWithRelations, Booking, BookingWithRelations, Invoice, InvoiceWithRelations, Payment, PaymentWithRelations } from "@/types";
import { clients } from "@/lib/mock-data";

function isVipClient(clientId: string): boolean {
  return clients.some((c) => c.id === clientId && c.isVip);
}

export function canAccessRoute(role: User["role"], path: string): boolean {
  if (role === "admin") return true;
  if (path.startsWith("/admin")) return false;
  return true;
}

export function canViewConversation(user: User, conversation: Conversation): boolean {
  if (user.role === "admin" || user.role === "vip_manager") return true;
  if (isVipClient(conversation.clientId)) return false;
  return conversation.assigneeId === user.id;
}

export function canViewBooking(user: User, booking: Booking): boolean {
  if (user.role === "admin" || user.role === "vip_manager") return true;
  if (isVipClient(booking.clientId)) return false;
  return booking.assigneeId === user.id;
}

export function canViewClient(user: User, clientId: string, conversations: Conversation[]): boolean {
  if (user.role === "admin" || user.role === "vip_manager") return true;
  if (isVipClient(clientId)) return false;
  return conversations.some((c) => c.clientId === clientId && c.assigneeId === user.id);
}

export function canViewInvoice(user: User, invoice: InvoiceWithRelations): boolean {
  if (user.role === "admin" || user.role === "vip_manager") return true;
  if (invoice.client.isVip) return false;
  return invoice.booking.assigneeId === user.id;
}

export function filterVipConversations<T extends ConversationWithRelations>(user: User, conversations: T[]): T[] {
  if (user.role === "admin" || user.role === "vip_manager") return conversations;
  return conversations.filter((c) => !c.client.isVip);
}

export function filterConversationsByPermission<T extends Conversation>(user: User, conversations: T[]): T[] {
  if (user.role === "admin" || user.role === "vip_manager") return conversations;
  return conversations.filter((c) => c.assigneeId === user.id);
}

export function filterBookingsByPermission<T extends Booking>(user: User, bookings: T[]): T[] {
  if (user.role === "admin" || user.role === "vip_manager") return bookings;
  return bookings.filter((b) => b.assigneeId === user.id);
}

export function filterInvoicesByPermission<T extends Invoice>(
  user: User,
  invoices: T[],
  bookings: Booking[]
): T[] {
  if (user.role === "admin" || user.role === "vip_manager") return invoices;
  const allowedBookingIds = new Set(
    bookings.filter((b) => b.assigneeId === user.id).map((b) => b.id)
  );
  return invoices.filter((i) => allowedBookingIds.has(i.bookingId));
}

export function filterPaymentsByPermission<T extends Payment>(
  user: User,
  payments: T[],
  invoices: Invoice[],
  bookings: Booking[]
): T[] {
  if (user.role === "admin" || user.role === "vip_manager") return payments;
  const allowedBookingIds = new Set(
    bookings.filter((b) => b.assigneeId === user.id).map((b) => b.id)
  );
  const allowedInvoiceIds = new Set(
    invoices.filter((i) => allowedBookingIds.has(i.bookingId)).map((i) => i.id)
  );
  return payments.filter((p) => allowedInvoiceIds.has(p.invoiceId));
}

export function filterVipBookings<T extends BookingWithRelations>(user: User, bookings: T[]): T[] {
  if (user.role === "admin" || user.role === "vip_manager") return bookings;
  return bookings.filter((b) => !b.client.isVip);
}

export function filterVipInvoices<T extends InvoiceWithRelations>(user: User, invoices: T[]): T[] {
  if (user.role === "admin" || user.role === "vip_manager") return invoices;
  return invoices.filter((i) => !i.client.isVip);
}

export function filterVipPayments<T extends PaymentWithRelations>(user: User, payments: T[]): T[] {
  if (user.role === "admin" || user.role === "vip_manager") return payments;
  return payments.filter((p) => !p.client.isVip);
}

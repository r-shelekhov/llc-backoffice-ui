import type { User, Conversation, ConversationWithRelations, Booking, Invoice, Payment } from "@/types";

export function canAccessRoute(role: User["role"], path: string): boolean {
  if (role === "admin") return true;
  if (path.startsWith("/admin")) return false;
  return true;
}

export function canViewConversation(user: User, conversation: Conversation): boolean {
  if (user.role === "admin" || user.role === "vip_manager") return true;
  return conversation.assigneeId === user.id;
}

export function canViewBooking(user: User, booking: Booking): boolean {
  if (user.role === "admin" || user.role === "vip_manager") return true;
  return booking.assigneeId === user.id;
}

export function canViewClient(user: User, clientId: string, conversations: Conversation[]): boolean {
  if (user.role === "admin" || user.role === "vip_manager") return true;
  return conversations.some((c) => c.clientId === clientId && c.assigneeId === user.id);
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

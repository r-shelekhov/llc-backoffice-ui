import type { ConversationFilterState, BookingFilterState, InvoiceFilterState, PaymentFilterState, ClientFilterState, ConversationWithRelations, BookingWithRelations, InvoiceWithRelations, PaymentWithRelations, ClientRow } from "@/types";

export type ActionReason = "unread" | "sla_risk" | "unassigned" | "draft_booking" | "awaiting_payment" | "needs_scheduling" | "overdue_invoice";

export function getConversationActionReasons(
  conversation: ConversationWithRelations,
  lastReadAt?: string
): ActionReason[] {
  const reasons: ActionReason[] = [];

  // Unread: has client messages after lastReadAt
  const latestClientMsg = conversation.communications
    .filter(c => c.sender === "client")
    .reduce<string | null>((max, c) => (!max || c.createdAt > max ? c.createdAt : max), null);
  if (latestClientMsg && (!lastReadAt || latestClientMsg > lastReadAt)) {
    reasons.push("unread");
  }

  // SLA Risk
  if (conversation.slaState === "at_risk" || conversation.slaState === "breached") {
    reasons.push("sla_risk");
  }

  // Unassigned
  if (conversation.managerId === null) {
    reasons.push("unassigned");
  }

  // Draft Booking
  if (conversation.bookings.some(b => b.status === "draft")) {
    reasons.push("draft_booking");
  }

  // Awaiting Payment
  if (conversation.bookings.some(b => b.status === "awaiting_payment")) {
    reasons.push("awaiting_payment");
  }

  // Needs Scheduling: paid but not yet scheduled
  if (conversation.bookings.some(b => b.status === "paid")) {
    reasons.push("needs_scheduling");
  }

  // Overdue Invoice
  if (conversation.invoices.some(i => i.status === "overdue")) {
    reasons.push("overdue_invoice");
  }

  return reasons;
}

export function applyConversationFilters(
  conversations: ConversationWithRelations[],
  filters: ConversationFilterState
): ConversationWithRelations[] {
  return conversations.filter((r) => {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.client.name.toLowerCase().includes(q) ||
        r.pickupLocation.toLowerCase().includes(q) ||
        r.dropoffLocation.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Channel
    if (filters.channels.length > 0 && !filters.channels.includes(r.channel)) {
      return false;
    }

    // Manager
    if (filters.managerIds.length > 0) {
      if (!r.managerId || !filters.managerIds.includes(r.managerId)) {
        return false;
      }
    }

    // VIP only
    if (filters.vipOnly && !r.client.isVip) {
      return false;
    }

    // SLA state
    if (filters.slaStates.length > 0 && !filters.slaStates.includes(r.slaState)) {
      return false;
    }

    // Date range
    if (filters.dateFrom) {
      if (new Date(r.createdAt) < filters.dateFrom) return false;
    }
    if (filters.dateTo) {
      if (new Date(r.createdAt) > filters.dateTo) return false;
    }

    return true;
  });
}

export function applyBookingFilters(
  bookings: BookingWithRelations[],
  filters: BookingFilterState
): BookingWithRelations[] {
  return bookings.filter((b) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        b.id.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.client.name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (filters.clientId && b.clientId !== filters.clientId) return false;

    if (filters.statuses.length > 0 && !filters.statuses.includes(b.status)) {
      return false;
    }

    if (filters.dateFrom && new Date(b.createdAt) < filters.dateFrom) return false;
    if (filters.dateTo && new Date(b.createdAt) > filters.dateTo) return false;

    return true;
  });
}

export function applyInvoiceFilters(
  invoices: InvoiceWithRelations[],
  filters: InvoiceFilterState
): InvoiceWithRelations[] {
  return invoices.filter((i) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        i.id.toLowerCase().includes(q) ||
        i.client.name.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(i.status)) {
      return false;
    }

    if (filters.dateFrom && new Date(i.createdAt) < filters.dateFrom) return false;
    if (filters.dateTo && new Date(i.createdAt) > filters.dateTo) return false;

    return true;
  });
}

export function applyPaymentFilters(
  payments: PaymentWithRelations[],
  filters: PaymentFilterState
): PaymentWithRelations[] {
  return payments.filter((p) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        p.id.toLowerCase().includes(q) ||
        p.client.name.toLowerCase().includes(q) ||
        p.invoiceId.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(p.status)) {
      return false;
    }

    if (filters.dateFrom && new Date(p.createdAt) < filters.dateFrom) return false;
    if (filters.dateTo && new Date(p.createdAt) > filters.dateTo) return false;

    return true;
  });
}

export function applyClientFilters(
  clients: ClientRow[],
  filters: ClientFilterState
): ClientRow[] {
  return clients.filter((c) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (filters.vipOnly && !c.isVip) return false;

    if (filters.activeOnly && !c.isActive) return false;

    if (filters.hasBookingsOnly && !c.hasBookings) return false;

    return true;
  });
}

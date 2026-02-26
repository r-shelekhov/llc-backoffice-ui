import type { FilterState, InvoiceFilterState, PaymentFilterState, RequestWithRelations, InvoiceWithRelations, PaymentWithRelations } from "@/types";

export function applyRequestFilters(
  requests: RequestWithRelations[],
  filters: FilterState
): RequestWithRelations[] {
  return requests.filter((r) => {
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

    // Status
    if (filters.statuses.length > 0 && !filters.statuses.includes(r.status)) {
      return false;
    }

    // Channel
    if (filters.channels.length > 0 && !filters.channels.includes(r.channel)) {
      return false;
    }

    // Assignee
    if (filters.assigneeIds.length > 0) {
      if (!r.assigneeId || !filters.assigneeIds.includes(r.assigneeId)) {
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

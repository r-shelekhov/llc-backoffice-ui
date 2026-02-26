import type { RequestWithRelations, InvoiceWithRelations, PaymentWithRelations } from "@/types";

export { users } from "./users";
export { clients } from "./clients";
export { requests } from "./requests";
export { communications } from "./communications";
export { internalNotes } from "./internal-notes";
export { invoices } from "./invoices";
export { payments } from "./payments";

import { users } from "./users";
import { clients } from "./clients";
import { requests } from "./requests";
import { communications } from "./communications";
import { internalNotes } from "./internal-notes";
import { invoices } from "./invoices";
import { payments } from "./payments";

function computeSlaState(status: string, slaDueAt: string): "on_track" | "at_risk" | "breached" {
  if (status === "completed" || status === "cancelled") {
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

export function getRequestWithRelations(requestId: string): RequestWithRelations | null {
  const request = requests.find((r) => r.id === requestId);
  if (!request) return null;

  const client = clients.find((c) => c.id === request.clientId) ?? null;
  const assignee = request.assigneeId ? (users.find((u) => u.id === request.assigneeId) ?? null) : null;
  const requestCommunications = communications.filter((c) => c.requestId === requestId);
  const requestNotes = internalNotes.filter((n) => n.requestId === requestId);
  const requestInvoices = invoices.filter((i) => i.requestId === requestId);
  const requestPayments = payments.filter((p) =>
    requestInvoices.some((i) => i.id === p.invoiceId)
  );
  const slaState = computeSlaState(request.status, request.slaDueAt);

  return {
    ...request,
    client: client!,
    assignee,
    communications: requestCommunications,
    internalNotes: requestNotes,
    invoices: requestInvoices,
    payments: requestPayments,
    slaState,
  };
}

export function getInvoiceWithRelations(invoiceId: string): InvoiceWithRelations | null {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return null;

  const client = clients.find((c) => c.id === invoice.clientId) ?? null;
  const request = requests.find((r) => r.id === invoice.requestId) ?? null;
  const invoicePayments = payments.filter((p) => p.invoiceId === invoiceId);

  return {
    ...invoice,
    client: client!,
    request: request!,
    payments: invoicePayments,
  };
}

export function getPaymentWithRelations(paymentId: string): PaymentWithRelations | null {
  const payment = payments.find((p) => p.id === paymentId);
  if (!payment) return null;

  const invoice = invoices.find((i) => i.id === payment.invoiceId) ?? null;
  const client = clients.find((c) => c.id === payment.clientId) ?? null;
  const request = invoice ? (requests.find((r) => r.id === invoice.requestId) ?? null) : null;

  return {
    ...payment,
    invoice: invoice!,
    client: client!,
    request: request!,
  };
}

export function getAllRequestsWithRelations(): RequestWithRelations[] {
  return requests
    .map((r) => getRequestWithRelations(r.id))
    .filter((r): r is RequestWithRelations => r !== null);
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

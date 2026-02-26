import type { User, Request, Invoice, Payment } from "@/types";

export function canAccessRoute(role: User["role"], path: string): boolean {
  if (role === "admin") return true;
  if (path.startsWith("/admin")) return false;
  return true;
}

export function canViewRequest(user: User, request: Request): boolean {
  if (user.role === "admin" || user.role === "vip_manager") return true;
  return request.assigneeId === user.id;
}

export function canViewClient(user: User, clientId: string, requests: Request[]): boolean {
  if (user.role === "admin" || user.role === "vip_manager") return true;
  return requests.some((r) => r.clientId === clientId && r.assigneeId === user.id);
}

export function filterRequestsByPermission(user: User, requests: Request[]): Request[] {
  if (user.role === "admin" || user.role === "vip_manager") return requests;
  return requests.filter((r) => r.assigneeId === user.id);
}

export function filterInvoicesByPermission(
  user: User,
  invoices: Invoice[],
  requests: Request[]
): Invoice[] {
  if (user.role === "admin" || user.role === "vip_manager") return invoices;
  const allowedRequestIds = new Set(
    requests.filter((r) => r.assigneeId === user.id).map((r) => r.id)
  );
  return invoices.filter((i) => allowedRequestIds.has(i.requestId));
}

export function filterPaymentsByPermission(
  user: User,
  payments: Payment[],
  invoices: Invoice[],
  requests: Request[]
): Payment[] {
  if (user.role === "admin" || user.role === "vip_manager") return payments;
  const allowedRequestIds = new Set(
    requests.filter((r) => r.assigneeId === user.id).map((r) => r.id)
  );
  const allowedInvoiceIds = new Set(
    invoices.filter((i) => allowedRequestIds.has(i.requestId)).map((i) => i.id)
  );
  return payments.filter((p) => allowedInvoiceIds.has(p.invoiceId));
}

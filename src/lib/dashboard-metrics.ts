import type {
  User,
  Conversation,
  Booking,
  Invoice,
  Payment,
  Client,
  Priority,
  InvoiceStatus,
  PaymentMethod,
} from "@/types";
import { computeSlaState } from "@/lib/sla";
import {
  filterConversationsByPermission,
  filterBookingsByPermission,
  filterInvoicesByPermission,
  filterPaymentsByPermission,
} from "@/lib/permissions";

// ── Input / Output types ──

export interface DashboardInput {
  user: User;
  conversations: Conversation[];
  bookings: Booking[];
  invoices: Invoice[];
  payments: Payment[];
  clients: Client[];
  now: Date;
}

export interface KpiStripData {
  activeConversations: number;
  slaBreached: number;
  accountsReceivable: number;
  pendingPayments: number;
  upcoming7d: number;
}

export interface ActionQueueItem {
  id: string;
  title: string;
  priority: Priority;
  age: string;
  link: string;
}

export interface ActionQueueFailedPayment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  link: string;
}

export interface ActionQueueData {
  slaBreached: ActionQueueItem[];
  newUnassignedOver24h: ActionQueueItem[];
  awaitingClientStaleOver48h: ActionQueueItem[];
  failedPayments: ActionQueueFailedPayment[];
}

export interface CashRiskInvoice {
  id: string;
  clientName: string;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
}

export interface CashRiskData {
  paidRevenue: number;
  accountsReceivable: number;
  overdueAmount: number;
  pendingAmount: number;
  failedAmount: number;
  refundedAmount: number;
  topRiskyInvoices: CashRiskInvoice[];
}

export interface ExecutionRadarItem {
  id: string;
  title: string;
  executionAt: string;
  assigneeName: string | null;
  paymentRisk: boolean;
  assignmentRisk: boolean;
  slaRisk: boolean;
  link: string;
}

export interface DashboardMetrics {
  kpiStrip: KpiStripData;
  actionQueue: ActionQueueData;
  cashRisk: CashRiskData;
  executionRadar: ExecutionRadarItem[];
}

// ── Helpers ──

const ACTIVE_STATUSES: import("@/types").ConversationStatus[] = ["new", "in_review", "awaiting_client"];

function isActive(status: import("@/types").ConversationStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

function ageLabel(createdAt: string, now: Date): string {
  const diffMs = now.getTime() - new Date(createdAt).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function hoursAgo(dateStr: string, now: Date): number {
  return (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
}

// ── Main computation ──

export function computeDashboardMetrics(input: DashboardInput): DashboardMetrics {
  const { user, clients, now } = input;
  const isManager = user.role === "manager";

  const vipClientIds = new Set(clients.filter((c) => c.isVip).map((c) => c.id));
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  // Strip VIP from manager's view, then apply permission filters
  const preConversations = isManager
    ? input.conversations.filter((c) => !vipClientIds.has(c.clientId))
    : input.conversations;
  const preBookings = isManager
    ? input.bookings.filter((b) => !vipClientIds.has(b.clientId))
    : input.bookings;
  const preInvoices = isManager
    ? input.invoices.filter((i) => !vipClientIds.has(i.clientId))
    : input.invoices;
  const prePayments = isManager
    ? input.payments.filter((p) => !vipClientIds.has(p.clientId))
    : input.payments;

  const conversations = filterConversationsByPermission(user, preConversations);
  const bookings = filterBookingsByPermission(user, preBookings);
  const invoices = filterInvoicesByPermission(user, preInvoices, bookings);
  const payments = filterPaymentsByPermission(user, prePayments, invoices, bookings);

  // ── KPI Strip ──
  const activeConvs = conversations.filter((c) => isActive(c.status));

  const slaBreachedConvs = activeConvs.filter(
    (c) => computeSlaState(c.status, c.slaDueAt) === "breached"
  );

  const ar = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.total, 0);

  const pendingPaymentsAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcoming7dBookings = bookings.filter((b) => {
    const exec = new Date(b.executionAt);
    return exec >= now && exec <= sevenDaysFromNow && b.status !== "completed" && b.status !== "cancelled";
  });

  const kpiStrip: KpiStripData = {
    activeConversations: activeConvs.length,
    slaBreached: slaBreachedConvs.length,
    accountsReceivable: ar,
    pendingPayments: pendingPaymentsAmount,
    upcoming7d: upcoming7dBookings.length,
  };

  // ── Action Queue ──
  const slaBreachedItems: ActionQueueItem[] = slaBreachedConvs.map((c) => ({
    id: c.id,
    title: c.title,
    priority: c.priority,
    age: ageLabel(c.slaDueAt, now),
    link: `/inbox?id=${c.id}`,
  }));

  const newUnassignedOver24h: ActionQueueItem[] = conversations
    .filter(
      (c) =>
        c.status === "new" &&
        c.assigneeId === null &&
        hoursAgo(c.createdAt, now) > 24
    )
    .map((c) => ({
      id: c.id,
      title: c.title,
      priority: c.priority,
      age: ageLabel(c.createdAt, now),
      link: `/inbox?id=${c.id}`,
    }));

  const awaitingClientStale: ActionQueueItem[] = conversations
    .filter(
      (c) =>
        c.status === "awaiting_client" &&
        hoursAgo(c.updatedAt, now) > 48
    )
    .map((c) => ({
      id: c.id,
      title: c.title,
      priority: c.priority,
      age: ageLabel(c.updatedAt, now),
      link: `/inbox?id=${c.id}`,
    }));

  const failedPaymentItems: ActionQueueFailedPayment[] = payments
    .filter((p) => p.status === "failed")
    .map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      amount: p.amount,
      method: p.method,
      link: `/payments?status=failed`,
    }));

  const actionQueue: ActionQueueData = {
    slaBreached: slaBreachedItems,
    newUnassignedOver24h,
    awaitingClientStaleOver48h: awaitingClientStale,
    failedPayments: failedPaymentItems,
  };

  // ── Cash Risk ──
  const paidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const overdueAmount = invoices
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + i.total, 0);

  const failedAmount = payments
    .filter((p) => p.status === "failed")
    .reduce((sum, p) => sum + p.amount, 0);

  const refundedAmount = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  const riskyInvoices = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      clientName: clientMap.get(i.clientId)?.name ?? "Unknown",
      total: i.total,
      status: i.status,
      dueDate: i.dueDate,
    }));

  const cashRisk: CashRiskData = {
    paidRevenue,
    accountsReceivable: ar,
    overdueAmount,
    pendingAmount: pendingPaymentsAmount,
    failedAmount,
    refundedAmount,
    topRiskyInvoices: riskyInvoices,
  };

  // ── Execution Radar ──
  const invoiceByBookingId = new Map<string, Invoice[]>();
  for (const inv of invoices) {
    const existing = invoiceByBookingId.get(inv.bookingId) ?? [];
    existing.push(inv);
    invoiceByBookingId.set(inv.bookingId, existing);
  }

  const convMap = new Map(input.conversations.map((c) => [c.id, c]));

  const executionRadar: ExecutionRadarItem[] = upcoming7dBookings
    .sort((a, b) => new Date(a.executionAt).getTime() - new Date(b.executionAt).getTime())
    .map((b) => {
      const bookingInvoices = invoiceByBookingId.get(b.id) ?? [];
      const hasUnpaidInvoice = bookingInvoices.length === 0 || bookingInvoices.some((i) => i.status !== "paid");
      const paymentRisk = b.status === "awaiting_payment" || hasUnpaidInvoice;
      const assignmentRisk = b.assigneeId === null;
      const linkedConv = convMap.get(b.conversationId);
      const slaRisk = linkedConv
        ? computeSlaState(linkedConv.status, linkedConv.slaDueAt) === "breached"
        : false;

      return {
        id: b.id,
        title: b.title,
        executionAt: b.executionAt,
        assigneeName: b.assigneeId,
        paymentRisk,
        assignmentRisk,
        slaRisk,
        link: `/bookings/${b.id}`,
      };
    });

  return {
    kpiStrip,
    actionQueue,
    cashRisk,
    executionRadar,
  };
}

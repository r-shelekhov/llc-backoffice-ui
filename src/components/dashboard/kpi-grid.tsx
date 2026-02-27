import {
  Activity,
  AlertTriangle,
  AlertCircle,
  PoundSterling,
  Clock,
  FileWarning,
  Crown,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { conversations, invoices, payments, clients, bookings } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { KpiCard } from "./kpi-card";

export function KpiGrid() {
  const { currentUser } = useAuth();
  const now = new Date();

  const isPrivileged = currentUser.role === "admin" || currentUser.role === "vip_manager";
  const vipClientIds = new Set(clients.filter((c) => c.isVip).map((c) => c.id));

  const filteredConversations = isPrivileged
    ? conversations
    : conversations.filter(
        (c) => !vipClientIds.has(c.clientId) && c.assigneeId === currentUser.id
      );

  const allowedBookingIds = new Set(
    isPrivileged
      ? bookings.map((b) => b.id)
      : bookings
          .filter((b) => !vipClientIds.has(b.clientId) && b.assigneeId === currentUser.id)
          .map((b) => b.id)
  );

  const filteredInvoices = isPrivileged
    ? invoices
    : invoices.filter((i) => allowedBookingIds.has(i.bookingId));

  const allowedInvoiceIds = new Set(filteredInvoices.map((i) => i.id));

  const filteredPayments = isPrivileged
    ? payments
    : payments.filter((p) => allowedInvoiceIds.has(p.invoiceId));

  const activeConversations = filteredConversations.filter(
    (c) => c.status !== "converted" && c.status !== "closed"
  );

  const activeConversationCount = activeConversations.length;

  const awaitingClientCount = filteredConversations.filter(
    (c) => c.status === "awaiting_client"
  ).length;

  const slaBreachedCount = activeConversations.filter((c) => {
    const dueDate = new Date(c.slaDueAt);
    return dueDate.getTime() < now.getTime();
  }).length;

  const revenue = filteredInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const pendingPayments = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueInvoiceCount = filteredInvoices.filter(
    (i) => i.status === "overdue"
  ).length;

  const vipActiveCount = isPrivileged
    ? clients.filter((c) => c.isVip).length
    : 0;

  const totalClientCount = isPrivileged
    ? clients.length
    : new Set(filteredConversations.map((c) => c.clientId)).size;

  return (
    <div className="grid grid-cols-4 gap-4">
      <KpiCard
        label="Active Conversations"
        value={activeConversationCount}
        icon={Activity}
      />
      <KpiCard
        label="Awaiting Client"
        value={awaitingClientCount}
        icon={AlertTriangle}
      />
      <KpiCard
        label="SLA Breached"
        value={slaBreachedCount}
        icon={AlertCircle}
      />
      <KpiCard
        label="Revenue"
        value={formatCurrency(revenue)}
        icon={PoundSterling}
      />
      <KpiCard
        label="Pending Payments"
        value={formatCurrency(pendingPayments)}
        icon={Clock}
      />
      <KpiCard
        label="Overdue Invoices"
        value={overdueInvoiceCount}
        icon={FileWarning}
      />
      <KpiCard
        label="VIP Active"
        value={vipActiveCount}
        icon={Crown}
      />
      <KpiCard
        label="Total Clients"
        value={totalClientCount}
        icon={Users}
      />
    </div>
  );
}

import {
  Activity,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  Clock,
  FileWarning,
  Crown,
  Users,
} from "lucide-react";
import { conversations, invoices, payments, clients } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { KpiCard } from "./kpi-card";

export function KpiGrid() {
  const now = new Date();

  const activeConversations = conversations.filter(
    (c) => c.status !== "converted" && c.status !== "closed"
  );

  const activeConversationCount = activeConversations.length;

  const awaitingClientCount = conversations.filter(
    (c) => c.status === "awaiting_client"
  ).length;

  const slaBreachedCount = activeConversations.filter((c) => {
    const dueDate = new Date(c.slaDueAt);
    return dueDate.getTime() < now.getTime();
  }).length;

  const revenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const pendingPayments = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueInvoiceCount = invoices.filter(
    (i) => i.status === "overdue"
  ).length;

  const vipActiveCount = clients.filter((c) => c.isVip).length;

  const totalClientCount = clients.length;

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
        icon={DollarSign}
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

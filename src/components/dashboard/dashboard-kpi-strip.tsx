import {
  Activity,
  AlertCircle,
  PoundSterling,
  Clock,
  Calendar,
} from "lucide-react";
import { KpiCard } from "./kpi-card";
import { formatCurrency } from "@/lib/format";
import type { KpiStripData } from "@/lib/dashboard-metrics";

interface DashboardKpiStripProps {
  data: KpiStripData;
}

export function DashboardKpiStrip({ data }: DashboardKpiStripProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <KpiCard
        label="Active Conversations"
        value={data.activeConversations}
        icon={Activity}
      />
      <KpiCard
        label="SLA Breached"
        value={data.slaBreached}
        icon={AlertCircle}
      />
      <KpiCard
        label="Accounts Receivable"
        value={formatCurrency(data.accountsReceivable)}
        icon={PoundSterling}
      />
      <KpiCard
        label="Pending Payments"
        value={formatCurrency(data.pendingPayments)}
        icon={Clock}
      />
      <KpiCard
        label="Upcoming 7d"
        value={data.upcoming7d}
        icon={Calendar}
      />
    </div>
  );
}

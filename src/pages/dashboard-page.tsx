import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { conversations, bookings, invoices, payments, clients } from "@/lib/mock-data";
import { computeDashboardMetrics } from "@/lib/dashboard-metrics";
import { DashboardKpiStrip } from "@/components/dashboard/dashboard-kpi-strip";
import { DashboardActionQueue } from "@/components/dashboard/dashboard-action-queue";
import { DashboardCashRisk } from "@/components/dashboard/dashboard-cash-risk";
import { DashboardExecutionRadar } from "@/components/dashboard/dashboard-execution-radar";


export function DashboardPage() {
  const { currentUser } = useAuth();

  const metrics = useMemo(
    () =>
      computeDashboardMetrics({
        user: currentUser,
        conversations,
        bookings,
        invoices,
        payments,
        clients,
        now: new Date(),
      }),
    [currentUser]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <DashboardKpiStrip data={metrics.kpiStrip} />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <DashboardActionQueue data={metrics.actionQueue} />
          <DashboardExecutionRadar data={metrics.executionRadar} />
        </div>
        <div className="col-span-4">
          <DashboardCashRisk data={metrics.cashRisk} />
        </div>
      </div>
    </div>
  );
}

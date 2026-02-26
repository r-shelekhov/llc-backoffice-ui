import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { requests } from "@/lib/mock-data";
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from "@/lib/constants";
import type { RequestStatus } from "@/types";

export function DashboardPage() {
  const statusCounts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const allStatuses = Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <KpiGrid />
      <div className="grid grid-cols-2 gap-6">
        <RecentActivity />
        <Card>
          <CardHeader>
            <CardTitle>Request Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allStatuses.map((status) => {
              const colorClass = REQUEST_STATUS_COLORS[status];
              const label = REQUEST_STATUS_LABELS[status];
              const count = statusCounts[status] || 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2.5 rounded-full ${colorClass.split(" ")[0]}`}
                    />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import type { ExecutionRadarItem } from "@/lib/dashboard-metrics";

interface DashboardExecutionRadarProps {
  data: ExecutionRadarItem[];
}

export function DashboardExecutionRadar({ data }: DashboardExecutionRadarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Radar (7d)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title="No upcoming bookings" description="Nothing scheduled in the next 7 days" />
        ) : (
          <div className="space-y-2">
            {data.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-start justify-between rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(item.executionAt)}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  {item.paymentRisk && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 text-[10px] px-1.5">
                      Payment
                    </Badge>
                  )}
                  {item.assignmentRisk && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 text-[10px] px-1.5">
                      Assignee
                    </Badge>
                  )}
                  {item.slaRisk && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 text-[10px] px-1.5">
                      SLA
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

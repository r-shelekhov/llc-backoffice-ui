import { Link } from "react-router-dom";
import { AlertCircle, Clock, MessageSquare, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/format";
import type { ActionQueueData } from "@/lib/dashboard-metrics";

const MAX_ITEMS = 3;

interface DashboardActionQueueProps {
  data: ActionQueueData;
}

export function DashboardActionQueue({ data }: DashboardActionQueueProps) {
  const totalItems =
    data.slaBreached.length +
    data.newUnassignedOver24h.length +
    data.awaitingClientStaleOver48h.length +
    data.failedPayments.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Action Queue</span>
          {totalItems > 0 && (
            <Badge variant="destructive">{totalItems}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {totalItems === 0 ? (
          <EmptyState title="All clear" description="No urgent actions required" />
        ) : (
          <>
            {data.slaBreached.length > 0 && (
              <Section icon={AlertCircle} title="SLA Breached" color="text-red-600">
                {data.slaBreached.slice(0, MAX_ITEMS).map((item) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm truncate">{item.title}</span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {item.age} overdue
                    </span>
                  </Link>
                ))}
                {data.slaBreached.length > MAX_ITEMS && (
                  <ViewAllLink to="/conversations" count={data.slaBreached.length} />
                )}
              </Section>
            )}

            {data.newUnassignedOver24h.length > 0 && (
              <Section icon={Clock} title="New Unassigned >24h" color="text-amber-600">
                {data.newUnassignedOver24h.slice(0, MAX_ITEMS).map((item) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm truncate">{item.title}</span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {item.age}
                    </span>
                  </Link>
                ))}
                {data.newUnassignedOver24h.length > MAX_ITEMS && (
                  <ViewAllLink to="/conversations" count={data.newUnassignedOver24h.length} />
                )}
              </Section>
            )}

            {data.awaitingClientStaleOver48h.length > 0 && (
              <Section icon={MessageSquare} title="Awaiting Client >48h" color="text-amber-600">
                {data.awaitingClientStaleOver48h.slice(0, MAX_ITEMS).map((item) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm truncate">{item.title}</span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {item.age} stale
                    </span>
                  </Link>
                ))}
                {data.awaitingClientStaleOver48h.length > MAX_ITEMS && (
                  <ViewAllLink to="/conversations" count={data.awaitingClientStaleOver48h.length} />
                )}
              </Section>
            )}

            {data.failedPayments.length > 0 && (
              <Section icon={CreditCard} title="Failed Payments" color="text-red-600">
                {data.failedPayments.slice(0, MAX_ITEMS).map((item) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm truncate">
                        {item.id} → {item.invoiceId}
                      </span>
                    </div>
                    <span className="text-sm font-medium shrink-0 ml-2">
                      {formatCurrency(item.amount)}
                    </span>
                  </Link>
                ))}
                {data.failedPayments.length > MAX_ITEMS && (
                  <ViewAllLink to="/payments?status=failed" count={data.failedPayments.length} />
                )}
              </Section>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`size-4 ${color}`} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ViewAllLink({ to, count }: { to: string; count: number }) {
  return (
    <Link
      to={to}
      className="block text-xs text-muted-foreground hover:text-foreground px-2 py-1"
    >
      View all {count} →
    </Link>
  );
}

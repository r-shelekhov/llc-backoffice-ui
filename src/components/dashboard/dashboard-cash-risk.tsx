import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CashRiskData } from "@/lib/dashboard-metrics";

const MAX_RISKY_INVOICES = 3;

interface DashboardCashRiskProps {
  data: CashRiskData;
}

export function DashboardCashRisk({ data }: DashboardCashRiskProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash &amp; Risk</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary metrics */}
        <div className="grid grid-cols-2 gap-3">
          <MetricBox label="Paid Revenue" value={formatCurrency(data.paidRevenue)} color="text-tone-success" />
          <MetricBox label="Accounts Receivable" value={formatCurrency(data.accountsReceivable)} color="text-tone-info" />
          <Link to="/invoices?status=overdue" className="hover:bg-muted rounded-md transition-colors">
            <MetricBox label="Overdue" value={formatCurrency(data.overdueAmount)} color="text-tone-danger" />
          </Link>
          <Link to="/payments?status=pending" className="hover:bg-muted rounded-md transition-colors">
            <MetricBox label="Pending" value={formatCurrency(data.pendingAmount)} color="text-tone-warning" />
          </Link>
        </div>

        {/* Compact sub-row for Failed + Refunded */}
        <div className="grid grid-cols-2 gap-3 border-t pt-3">
          <MetricBox label="Failed" value={formatCurrency(data.failedAmount)} color="text-tone-danger" compact />
          <MetricBox label="Refunded" value={formatCurrency(data.refundedAmount)} color="text-tone-purple" compact />
        </div>

        {data.topRiskyInvoices.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-muted-foreground">Top Risky Invoices</span>
            {data.topRiskyInvoices.slice(0, MAX_RISKY_INVOICES).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between text-sm py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{inv.clientName}</span>
                  <StatusBadge type="invoice" status={inv.status} />
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs text-muted-foreground">
                    Due {formatDate(inv.dueDate)}
                  </span>
                  <span className="font-medium">{formatCurrency(inv.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricBox({
  label,
  value,
  color,
  compact,
}: {
  label: string;
  value: string;
  color: string;
  compact?: boolean;
}) {
  return (
    <div className="p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`${compact ? "text-sm" : "text-lg"} font-bold ${color}`}>{value}</div>
    </div>
  );
}

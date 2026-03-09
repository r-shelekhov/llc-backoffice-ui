import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getStatementWithRelations, statements } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { formatCurrency, formatDate, formatPeriod } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotFoundPage } from "@/pages/not-found-page";
import { DetailShell } from "@/components/detail/detail-shell";
import { DetailTopBar } from "@/components/detail/detail-topbar";
import { DetailSection } from "@/components/detail/detail-section";
import { DetailKv } from "@/components/detail/detail-kv";
import { DetailRailCard } from "@/components/detail/detail-rail-card";

export function StatementDetailPage() {
  const { id } = useParams<{ id: string }>();
  useAuth();
  const [, forceUpdate] = useState(0);
  const statement = id ? getStatementWithRelations(id) : null;

  if (!statement) {
    return <NotFoundPage />;
  }

  const outstanding = statement.total - statement.paidAmount;

  function handleConfirmPayment() {
    const stmtRef = statements.find((s) => s.id === id);
    if (!stmtRef) return;
    stmtRef.paidAmount = stmtRef.total;
    stmtRef.status = "paid";
    stmtRef.paidAt = new Date().toISOString();
    stmtRef.updatedAt = new Date().toISOString();
    forceUpdate((n) => n + 1);
  }

  return (
    <DetailShell
      topBar={
        <DetailTopBar
          backTo="/billing?tab=statements"
          backLabel="Back to Statements"
          title={`Statement — ${formatPeriod(statement.period)}`}
          subtitle={statement.client.name}
          statusBadge={<StatusBadge type="statement" status={statement.status} />}
          actions={
            <div className="flex items-center gap-3 text-sm">
              {(statement.status === "open" || statement.status === "closed" || statement.status === "overdue") && (
                <Button size="sm" onClick={handleConfirmPayment}>
                  Confirm Payment
                </Button>
              )}
              <span className="text-muted-foreground">Due {formatDate(statement.dueDate)}</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="font-semibold">{formatCurrency(statement.total)}</span>
            </div>
          }
        />
      }
      rail={
        <div className="space-y-4">
          <DetailRailCard title="Financial Summary">
            <dl className="space-y-2">
              <DetailKv label="Subtotal" value={formatCurrency(statement.subtotal)} />
              <DetailKv label="Tax" value={formatCurrency(statement.taxAmount)} />
              <Separator />
              <DetailKv
                label="Total"
                value={
                  <span className="text-base font-semibold">
                    {formatCurrency(statement.total)}
                  </span>
                }
              />
              <DetailKv label="Paid" value={formatCurrency(statement.paidAmount)} />
              {outstanding > 0 && (
                <DetailKv
                  label="Outstanding"
                  value={
                    <span className="text-tone-danger-foreground font-semibold">
                      {formatCurrency(outstanding)}
                    </span>
                  }
                />
              )}
              <DetailKv label="Due Date" value={formatDate(statement.dueDate)} />
              {statement.paidAt && (
                <DetailKv label="Paid Date" value={formatDate(statement.paidAt)} />
              )}
            </dl>
          </DetailRailCard>

          <DetailRailCard title="Client">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{statement.client.name}</span>
                {statement.client.isVip && <VipIndicator />}
              </div>
              {statement.client.company && (
                <p className="text-xs text-muted-foreground">{statement.client.company}</p>
              )}
              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                <Link to={`/clients/${statement.client.id}`}>View Profile</Link>
              </Button>
            </div>
          </DetailRailCard>
        </div>
      }
    >
      <DetailSection title="Invoices">
        {statement.invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices in this statement yet.</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statement.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        to={`/billing/${invoice.id}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {invoice.id}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <Link
                        to={`/bookings/${invoice.booking.id}`}
                        className="hover:underline"
                      >
                        {invoice.booking.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="invoice" status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DetailSection>
    </DetailShell>
  );
}

import { Link, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getInvoiceWithRelations } from "@/lib/mock-data";
import { canViewInvoice } from "@/lib/permissions";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { SERVICE_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatCurrency, formatDateTime, formatDate, formatRelativeTime } from "@/lib/format";
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
import { PermissionDenied } from "@/components/shared/permission-denied";
import { DetailShell } from "@/components/detail/detail-shell";
import { DetailTopBar } from "@/components/detail/detail-topbar";
import { DetailSection } from "@/components/detail/detail-section";
import { DetailKv } from "@/components/detail/detail-kv";
import { DetailRailCard } from "@/components/detail/detail-rail-card";

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();
  const invoice = id ? getInvoiceWithRelations(id) : null;

  if (!invoice) {
    return <NotFoundPage />;
  }

  if (!canViewInvoice(currentUser, invoice)) {
    return <PermissionDenied />;
  }

  const from = (location.state as { from?: string })?.from;
  const backTo = from === "booking"
    ? `/bookings/${invoice.booking.id}`
    : from === "payment"
      ? "/payments"
      : "/invoices";
  const backLabel = from === "booking"
    ? "Back to Booking"
    : from === "payment"
      ? "Back to Payments"
      : "Back to Invoices";

  const latestPayment = invoice.payments.length > 0
    ? invoice.payments[invoice.payments.length - 1]
    : null;

  const isOverdue = invoice.status === "overdue";

  return (
    <>
      <DetailShell
        topBar={
          <DetailTopBar
            backTo={backTo}
            backLabel={backLabel}
            title={<span className="font-mono">{invoice.id}</span>}
            subtitle={invoice.client.name}
            statusBadge={<StatusBadge type="invoice" status={invoice.status} />}
            actions={
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Due {formatDate(invoice.dueDate)}</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="font-semibold">{formatCurrency(invoice.total)}</span>
              </div>
            }
          />
        }
        rail={
          <div className="space-y-4">
            {/* Financial Summary */}
            <DetailRailCard title="Financial Summary">
              <dl className="space-y-2">
                <DetailKv label="Subtotal" value={formatCurrency(invoice.subtotal)} />
                <DetailKv
                  label={`Tax (${invoice.taxRate}%)`}
                  value={formatCurrency(invoice.taxAmount)}
                />
                <Separator />
                <DetailKv
                  label="Total"
                  value={
                    <span className="text-base font-semibold">
                      {formatCurrency(invoice.total)}
                    </span>
                  }
                />
                <DetailKv label="Due Date" value={formatDate(invoice.dueDate)} />
                {invoice.paidAt && (
                  <DetailKv label="Paid Date" value={formatDate(invoice.paidAt)} />
                )}
              </dl>
            </DetailRailCard>

            {/* Client Snapshot */}
            <DetailRailCard title="Client">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{invoice.client.name}</span>
                  {invoice.client.isVip && <VipIndicator />}
                </div>
                {invoice.client.company && (
                  <p className="text-xs text-muted-foreground">{invoice.client.company}</p>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                  <Link to={`/clients/${invoice.client.id}`}>View Profile</Link>
                </Button>
              </div>
            </DetailRailCard>

            {/* Collection Status */}
            <DetailRailCard title="Collection Status">
              <dl className="space-y-2">
                <DetailKv
                  label="Payment Attempts"
                  value={invoice.payments.length}
                />
                {latestPayment && (
                  <>
                    <DetailKv
                      label="Latest Method"
                      value={PAYMENT_METHOD_LABELS[latestPayment.method]}
                    />
                    <DetailKv
                      label="Latest Status"
                      value={<StatusBadge type="payment" status={latestPayment.status} />}
                    />
                  </>
                )}
                {isOverdue && (
                  <div className="rounded-md bg-tone-danger-light px-2 py-1 text-xs font-medium text-tone-danger-foreground">
                    Overdue
                  </div>
                )}
              </dl>
            </DetailRailCard>
          </div>
        }
      >
        {/* Linked Booking */}
        <DetailSection title="Linked Booking">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <StatusBadge type="booking" status={invoice.booking.status} />
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <ServiceTypeIcon serviceType={invoice.booking.category} />
                {SERVICE_TYPE_LABELS[invoice.booking.category]}
              </span>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Execution</span>
              <span>{formatDateTime(invoice.booking.executionAt)}</span>
              <span className="text-muted-foreground">Location</span>
              <span>{invoice.booking.location}</span>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link to={`/bookings/${invoice.booking.id}`} state={{ from: "invoice", invoiceId: invoice.id }}>
                {invoice.booking.title} &rarr;
              </Link>
            </Button>
          </div>
        </DetailSection>

        {/* Line Items */}
        <DetailSection title="Line Items">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DetailSection>

        {/* Payment History */}
        <DetailSection title="Payment History">
          {invoice.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <StatusBadge type="payment" status={payment.status} />
                    <p className="text-sm">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {PAYMENT_METHOD_LABELS[payment.method]}
                    </p>
                    {payment.refundReason && (
                      <p className="text-xs text-muted-foreground italic">
                        {payment.refundReason}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {payment.processedAt
                      ? formatRelativeTime(payment.processedAt)
                      : "Pending"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailSection>
      </DetailShell>
    </>
  );
}

import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getInvoiceWithRelations } from "@/lib/mock-data";
import { canViewInvoice } from "@/lib/permissions";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { SERVICE_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <Button variant="ghost" size="sm" asChild>
        <Link to={backTo}>
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      </Button>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="font-mono text-xl">{invoice.id}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {invoice.client.name}
              </p>
            </div>
            <StatusBadge type="invoice" status={invoice.status} />
          </div>
        </CardHeader>
      </Card>

      {/* Booking */}
      <Card>
        <CardHeader>
          <CardTitle>Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
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

          {/* Summary */}
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tax ({invoice.taxRate}%)
              </span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-medium">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <StatusBadge type="payment" status={payment.status} />
                    <p className="text-sm">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.method}
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
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import type { BookingStatus, PaymentMethod } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { getBookingWithRelations, payments, invoices, bookings, users } from "@/lib/mock-data";
import { canViewBooking } from "@/lib/permissions";
import { computeSlaState } from "@/lib/sla";
import { BOOKING_STATUS_TRANSITIONS, BOOKING_STATUS_ACTION_LABELS, PAYMENT_METHOD_LABELS, SERVICE_TYPE_LABELS, CHANNEL_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { SlaBadge } from "@/components/shared/sla-badge";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmPaymentDialog } from "@/components/bookings/confirm-payment-dialog";
import { NotFoundPage } from "@/pages/not-found-page";
import { PermissionDenied } from "@/components/shared/permission-denied";

type BillingState =
  | "no_invoice"
  | "invoice_draft"
  | "awaiting_payment"
  | "payment_processing"
  | "paid"
  | "overdue";

const BILLING_STATE_CONFIG: Record<BillingState, { label: string; className: string }> = {
  no_invoice: { label: "No Invoice", className: "bg-gray-100 text-gray-600" },
  invoice_draft: { label: "Invoice Draft", className: "bg-gray-100 text-gray-600" },
  awaiting_payment: { label: "Awaiting Payment", className: "bg-amber-100 text-amber-700" },
  payment_processing: { label: "Payment Processing", className: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", className: "bg-green-100 text-green-700" },
  overdue: { label: "Overdue", className: "bg-red-100 text-red-700" },
};

function confirmPayment(
  bookingId: string,
  invoiceId: string,
  amount: number,
  method: PaymentMethod,
) {
  const now = new Date().toISOString();

  payments.push({
    id: `pay-${payments.length + 1}`,
    invoiceId,
    clientId: bookings.find((b) => b.id === bookingId)!.clientId,
    amount,
    method,
    status: "succeeded",
    processedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  const invoiceRef = invoices.find((i) => i.id === invoiceId);
  if (invoiceRef) {
    invoiceRef.status = "paid";
    invoiceRef.paidAt = now;
    invoiceRef.updatedAt = now;
  }

  const bookingRef = bookings.find((b) => b.id === bookingId);
  if (bookingRef) {
    bookingRef.status = "paid";
    bookingRef.updatedAt = now;
    if (bookingRef.assigneeId !== null && bookingRef.executionAt !== "") {
      bookingRef.status = "scheduled";
    }
  }
}

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [, forceUpdate] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const booking = id ? getBookingWithRelations(id) : null;

  if (!booking) {
    return <NotFoundPage />;
  }

  if (!canViewBooking(currentUser, booking)) {
    return <PermissionDenied />;
  }

  const state = location.state as { from?: string; invoiceId?: string } | null;
  const fromInvoice = state?.from === "invoice";
  const fromPayment = state?.from === "payment";
  const backTo = fromInvoice
    ? `/invoices/${state.invoiceId}`
    : fromPayment
      ? "/payments"
      : "/bookings";
  const backLabel = fromInvoice
    ? "Back to Invoice"
    : fromPayment
      ? "Back to Payments"
      : "Back to Bookings";

  const transitions = BOOKING_STATUS_TRANSITIONS[booking.status];
  const isAutoScheduled =
    booking.status === "paid" &&
    booking.assigneeId !== null &&
    booking.executionAt !== "";

  // Derive billing state
  const billingState = deriveBillingState();
  const billingConfig = BILLING_STATE_CONFIG[billingState];

  // Find first sent invoice for payment confirmation
  const sentInvoice = booking.invoices.find((i) => i.status === "sent");
  const hasSentInvoice = booking.invoices.some((i) => i.status === "sent");
  const isEditable = !["completed", "cancelled"].includes(booking.status);

  function checkAutoSchedule(bookingRef: typeof bookings[number]) {
    if (
      bookingRef.status === "paid" &&
      bookingRef.assigneeId !== null &&
      bookingRef.executionAt !== ""
    ) {
      bookingRef.status = "scheduled";
    }
  }

  function deriveBillingState(): BillingState {
    if (booking!.invoices.length === 0) return "no_invoice";

    const hasOverdue = booking!.invoices.some((i) => i.status === "overdue");
    if (hasOverdue) return "overdue";

    const hasPaid = booking!.invoices.some((i) => i.status === "paid");
    if (hasPaid) return "paid";

    const hasSent = booking!.invoices.some((i) => i.status === "sent");
    if (hasSent) {
      const hasPending = booking!.payments.some((p) => p.status === "pending");
      return hasPending ? "payment_processing" : "awaiting_payment";
    }

    return "invoice_draft";
  }

  function handleStatusChange(newStatus: BookingStatus) {
    const bookingRef = bookings.find((b) => b.id === id);
    if (!bookingRef) return;

    const allowed = BOOKING_STATUS_TRANSITIONS[bookingRef.status];
    if (!allowed.includes(newStatus)) return;

    // For draft → awaiting_payment, require a sent invoice
    if (bookingRef.status === "draft" && newStatus === "awaiting_payment" && !hasSentInvoice) return;

    // For awaiting_payment → paid, open dialog instead
    if (bookingRef.status === "awaiting_payment" && newStatus === "paid") {
      setPaymentDialogOpen(true);
      return;
    }

    bookingRef.status = newStatus;
    bookingRef.updatedAt = new Date().toISOString();
    checkAutoSchedule(bookingRef);

    forceUpdate((n) => n + 1);
  }

  function handleConfirmPayment(method: PaymentMethod) {
    const invoice = sentInvoice ?? booking!.invoices[0];
    if (!invoice) return;

    confirmPayment(id!, invoice.id, invoice.total, method);

    setPaymentDialogOpen(false);
    forceUpdate((n) => n + 1);
  }

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
              <CardTitle className="text-xl">{booking.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {booking.client.name}
              </p>
            </div>
            <StatusBadge type="booking" status={booking.status} />
          </div>
        </CardHeader>
        <CardContent>
          {isAutoScheduled && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
              <Zap className="size-4" />
              <span>Will auto-transition to Scheduled (assignee &amp; execution date set)</span>
            </div>
          )}

          {transitions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {transitions.map((nextStatus) => {
                // Disable "Send for Payment" if no sent invoice
                const disabled =
                  booking.status === "draft" &&
                  nextStatus === "awaiting_payment" &&
                  !hasSentInvoice;

                const label =
                  booking.status === "awaiting_payment" && nextStatus === "paid"
                    ? "Confirm Payment"
                    : BOOKING_STATUS_ACTION_LABELS[nextStatus];

                return (
                  <Button
                    key={nextStatus}
                    variant={nextStatus === "cancelled" ? "outline" : "default"}
                    size="sm"
                    disabled={disabled}
                    title={disabled ? "Send an invoice first" : undefined}
                    onClick={() => handleStatusChange(nextStatus)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="flex items-center gap-1.5 font-medium">
                <ServiceTypeIcon serviceType={booking.category} />
                {SERVICE_TYPE_LABELS[booking.category]}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-medium">{formatCurrency(booking.price)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{booking.location}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Execution Date</p>
              {isEditable ? (
                <Input
                  type="datetime-local"
                  className="mt-1"
                  value={booking.executionAt ? booking.executionAt.slice(0, 16) : ""}
                  onChange={(e) => {
                    const bookingRef = bookings.find((b) => b.id === id);
                    if (bookingRef) {
                      bookingRef.executionAt = e.target.value ? new Date(e.target.value).toISOString() : "";
                      bookingRef.updatedAt = new Date().toISOString();
                      checkAutoSchedule(bookingRef);
                      forceUpdate((n) => n + 1);
                    }
                  }}
                />
              ) : (
                <p className="font-medium">{formatDateTime(booking.executionAt)}</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Assignee</p>
              {isEditable ? (
                <Select
                  value={booking.assigneeId ?? "unassigned"}
                  onValueChange={(val) => {
                    const bookingRef = bookings.find((b) => b.id === id);
                    if (bookingRef) {
                      bookingRef.assigneeId = val === "unassigned" ? null : val;
                      bookingRef.updatedAt = new Date().toISOString();
                      checkAutoSchedule(bookingRef);
                      forceUpdate((n) => n + 1);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="font-medium">{booking.assignee?.name ?? "Unassigned"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Billing</CardTitle>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${billingConfig.className}`}>
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {billingConfig.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Billing actions */}
          {billingState === "no_invoice" && (
            <Button
              size="sm"
              onClick={() => {
                const subtotal = booking.price;
                const taxRate = 10;
                const taxAmount = Math.round(subtotal * taxRate) / 100;
                const total = subtotal + taxAmount;
                invoices.push({
                  id: `inv-${Date.now()}`,
                  bookingId: booking.id,
                  clientId: booking.clientId,
                  status: "draft",
                  lineItems: [{ description: booking.title, quantity: 1, unitPrice: subtotal }],
                  subtotal,
                  taxRate,
                  taxAmount,
                  total,
                  dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
                forceUpdate((n) => n + 1);
              }}
            >
              Create Invoice
            </Button>
          )}
          {billingState === "invoice_draft" && (
            <Button
              size="sm"
              onClick={() => {
                const draftInvoice = invoices.find(
                  (i) => i.bookingId === booking.id && i.status === "draft"
                );
                if (draftInvoice) {
                  draftInvoice.status = "sent";
                  draftInvoice.updatedAt = new Date().toISOString();
                  forceUpdate((n) => n + 1);
                }
              }}
            >
              Send Invoice
            </Button>
          )}

          {/* Invoice summary */}
          {booking.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {booking.invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  to={`/invoices/${invoice.id}`}
                  state={{ from: "booking" }}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-mono text-sm">{invoice.id}</p>
                    <StatusBadge type="invoice" status={invoice.status} />
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(invoice.total)}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {/* Payment summary */}
          {booking.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="space-y-2">
              {booking.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge type="payment" status={payment.status} />
                    <span className="text-xs text-muted-foreground">
                      {PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS] ?? payment.method}
                    </span>
                    {payment.processedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(payment.processedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge type="conversation" status={booking.conversation.status} />
            <PriorityBadge priority={booking.conversation.priority} />
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <ChannelIcon channel={booking.conversation.channel} />
              {CHANNEL_LABELS[booking.conversation.channel]}
            </span>
            <SlaBadge state={computeSlaState(booking.conversation.status, booking.conversation.slaDueAt)} />
          </div>

          {booking.conversation.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {booking.conversation.description}
            </p>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link to={`/inbox?id=${booking.conversationId}`}>
              View Conversation
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Payment confirmation dialog */}
      {sentInvoice && (
        <ConfirmPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          invoiceTotal={sentInvoice.total}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
}

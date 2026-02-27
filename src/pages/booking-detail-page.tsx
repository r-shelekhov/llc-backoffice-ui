import { useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import type { BookingStatus } from "@/types";
import { getBookingWithRelations } from "@/lib/mock-data";
import { computeSlaState } from "@/lib/sla";
import { BOOKING_STATUS_TRANSITIONS, BOOKING_STATUS_ACTION_LABELS, SERVICE_TYPE_LABELS, CHANNEL_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { SlaBadge } from "@/components/shared/sla-badge";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotFoundPage } from "@/pages/not-found-page";

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [, forceUpdate] = useState(0);

  const booking = id ? getBookingWithRelations(id) : null;

  if (!booking) {
    return <NotFoundPage />;
  }

  const state = location.state as { from?: string; invoiceId?: string } | null;
  const fromInvoice = state?.from === "invoice";
  const backTo = fromInvoice ? `/invoices/${state.invoiceId}` : "/bookings";
  const backLabel = fromInvoice ? "Back to Invoice" : "Back to Bookings";

  const transitions = BOOKING_STATUS_TRANSITIONS[booking.status];
  const isAutoScheduled =
    booking.status === "paid" &&
    booking.assigneeId !== null &&
    booking.executionAt !== "";

  function handleStatusChange(newStatus: BookingStatus) {
    const allowed = BOOKING_STATUS_TRANSITIONS[booking!.status];
    if (!allowed.includes(newStatus)) return;

    booking!.status = newStatus;
    booking!.updatedAt = new Date().toISOString();

    // Auto-schedule: if paid + assignee + executionAt → scheduled
    if (
      newStatus === "paid" &&
      booking!.assigneeId !== null &&
      booking!.executionAt !== ""
    ) {
      booking!.status = "scheduled";
    }

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
              {transitions.map((nextStatus) => (
                <Button
                  key={nextStatus}
                  variant={nextStatus === "cancelled" ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleStatusChange(nextStatus)}
                >
                  {BOOKING_STATUS_ACTION_LABELS[nextStatus]}
                </Button>
              ))}
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
              <p className="text-muted-foreground">Execution</p>
              <p className="font-medium">{formatDateTime(booking.executionAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Assignee</p>
              <p className="font-medium">{booking.assignee?.name ?? "Unassigned"}</p>
            </div>
          </div>
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
            <Link to={`/conversations/${booking.conversationId}`}>
              View Conversation
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {booking.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="space-y-2">
              {booking.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <StatusBadge type="payment" status={payment.status} />
                    <p className="text-xs text-muted-foreground">
                      {payment.method}
                    </p>
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
    </div>
  );
}

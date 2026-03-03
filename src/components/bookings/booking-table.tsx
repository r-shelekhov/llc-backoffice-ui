import { differenceInDays } from "date-fns";
import { AlertCircle, Clock, FileText } from "lucide-react";
import type { BookingStatus, BookingWithRelations } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { formatCurrency, formatDate } from "@/lib/format";
import { SERVICE_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BookingTableProps {
  bookings: BookingWithRelations[];
  onSelect: (booking: BookingWithRelations) => void;
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
  onConfirmPayment: (booking: BookingWithRelations) => void;
  onCreateInvoice: (booking: BookingWithRelations) => void;
  onSendInvoice: (booking: BookingWithRelations) => void;
}

interface Warning {
  icon: typeof AlertCircle;
  message: string;
  className: string;
}

const TERMINAL_STATUSES: BookingStatus[] = ["completed", "cancelled"];

function getBookingWarnings(booking: BookingWithRelations): Warning[] {
  const warnings: Warning[] = [];

  // No manager (non-terminal bookings only)
  if (!booking.managerId && !TERMINAL_STATUSES.includes(booking.status)) {
    warnings.push({
      icon: AlertCircle,
      message: "No manager",
      className: "text-orange-500",
    });
  }

  // Execution soon (scheduled or in_progress, ≤3 days)
  if (
    (booking.status === "scheduled" || booking.status === "in_progress") &&
    booking.executionAt
  ) {
    const daysUntil = differenceInDays(new Date(booking.executionAt), new Date());
    if (daysUntil <= 3) {
      warnings.push({
        icon: Clock,
        message: `Execution in ${daysUntil <= 0 ? "< 1" : daysUntil} day${daysUntil === 1 ? "" : "s"}`,
        className: "text-orange-500",
      });
    }
  }

  // No invoice (draft only)
  if (booking.status === "draft" && booking.invoices.length === 0) {
    warnings.push({
      icon: FileText,
      message: "No invoice created",
      className: "text-muted-foreground",
    });
  }

  return warnings;
}

export function BookingTable({ bookings, onSelect, onStatusChange, onConfirmPayment, onCreateInvoice, onSendInvoice }: BookingTableProps) {
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Execution Date</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const warnings = getBookingWarnings(booking);

            return (
              <TableRow
                key={booking.id}
                onClick={() => onSelect(booking)}
                className="hover:bg-muted/50 cursor-pointer"
              >
                <TableCell className="max-w-[250px]">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{booking.title}</span>
                    {warnings.map((w, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <w.icon className={cn("size-4 shrink-0", w.className)} />
                        </TooltipTrigger>
                        <TooltipContent>{w.message}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{booking.client.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ServiceTypeIcon serviceType={booking.category} />
                    <span>{SERVICE_TYPE_LABELS[booking.category]}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge type="booking" status={booking.status} />
                </TableCell>
                <TableCell>
                  {booking.manager ? (
                    <span className="text-sm">{booking.manager.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(booking.price)}</TableCell>
                <TableCell>{formatDate(booking.executionAt)}</TableCell>
                <TableCell>
                  <QuickAction
                    booking={booking}
                    onStatusChange={onStatusChange}
                    onConfirmPayment={onConfirmPayment}
                    onCreateInvoice={onCreateInvoice}
                    onSendInvoice={onSendInvoice}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}

function QuickAction({
  booking,
  onStatusChange,
  onConfirmPayment,
  onCreateInvoice,
  onSendInvoice,
}: {
  booking: BookingWithRelations;
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
  onConfirmPayment: (booking: BookingWithRelations) => void;
  onCreateInvoice: (booking: BookingWithRelations) => void;
  onSendInvoice: (booking: BookingWithRelations) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  if (booking.status === "draft") {
    const hasDraftInvoice = booking.invoices.some((i) => i.status === "draft");

    if (!hasDraftInvoice) {
      return (
        <Button
          variant="outline"
          size="xs"
          onClick={(e) => { stop(e); onCreateInvoice(booking); }}
        >
          Create Invoice
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        size="xs"
        onClick={(e) => { stop(e); onSendInvoice(booking); }}
      >
        Send Invoice
      </Button>
    );
  }

  switch (booking.status) {
    case "awaiting_payment":
      return (
        <Button
          size="xs"
          onClick={(e) => { stop(e); onConfirmPayment(booking); }}
        >
          Confirm Payment
        </Button>
      );
    case "scheduled": {
      const isPaid = booking.invoices.some((i) => i.status === "paid");
      if (!isPaid) return null;
      return (
        <Button
          variant="outline"
          size="xs"
          onClick={(e) => { stop(e); onStatusChange(booking.id, "in_progress"); }}
        >
          Start
        </Button>
      );
    }
    case "in_progress":
      return (
        <Button
          variant="outline"
          size="xs"
          onClick={(e) => { stop(e); onStatusChange(booking.id, "completed"); }}
        >
          Complete
        </Button>
      );
    default:
      return null;
  }
}

import { Link } from "react-router-dom";
import type { PaymentWithRelations } from "@/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaymentTableProps {
  payments: PaymentWithRelations[];
  onSelect?: (payment: PaymentWithRelations) => void;
}

export function PaymentTable({ payments, onSelect }: PaymentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Payment ID</TableHead>
          <TableHead>Invoice ID</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Booking</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Processed At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow
            key={payment.id}
            onClick={() => onSelect?.(payment)}
            className={onSelect ? "hover:bg-muted/50 cursor-pointer" : undefined}
          >
            <TableCell>
              <StatusBadge type="payment" status={payment.status} />
            </TableCell>
            <TableCell className="font-mono text-sm">{payment.id}</TableCell>
            <TableCell className="font-mono text-sm text-muted-foreground">
              {payment.invoiceId}
            </TableCell>
            <TableCell>{payment.client.name}</TableCell>
            <TableCell className="max-w-[200px] truncate">
              {payment.booking ? (
                <Link
                  to={`/bookings/${payment.booking.id}`}
                  state={{ from: "payment" }}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline"
                >
                  {payment.booking.title}
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <div>
                <span>{formatCurrency(payment.amount)}</span>
                {payment.refundReason && (
                  <p className="text-xs text-muted-foreground italic">
                    {payment.refundReason}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
            <TableCell>
              {payment.processedAt
                ? formatRelativeTime(payment.processedAt)
                : "Pending"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

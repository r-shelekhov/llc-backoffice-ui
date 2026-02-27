import { Link } from "react-router-dom";
import type { InvoiceWithRelations } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceTableProps {
  invoices: InvoiceWithRelations[];
  onSelect: (invoice: InvoiceWithRelations) => void;
}

export function InvoiceTable({ invoices, onSelect }: InvoiceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Invoice ID</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Booking</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Paid At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow
            key={invoice.id}
            onClick={() => onSelect(invoice)}
            className="hover:bg-muted/50 cursor-pointer"
          >
            <TableCell>
              <StatusBadge type="invoice" status={invoice.status} />
            </TableCell>
            <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
            <TableCell>{invoice.client.name}</TableCell>
            <TableCell className="max-w-[200px] truncate">
              <Link
                to={`/bookings/${invoice.booking.id}`}
                state={{ from: "invoice", invoiceId: invoice.id }}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline"
              >
                {invoice.booking.title}
              </Link>
            </TableCell>
            <TableCell>{formatCurrency(invoice.total)}</TableCell>
            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
            <TableCell>
              {invoice.paidAt ? formatDate(invoice.paidAt) : "\u2014"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

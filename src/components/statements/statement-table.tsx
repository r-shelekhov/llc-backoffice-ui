import type { StatementWithRelations } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatPeriod } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StatementTableProps {
  statements: StatementWithRelations[];
  onSelect: (statement: StatementWithRelations) => void;
}

export function StatementTable({ statements, onSelect }: StatementTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Invoices</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {statements.map((statement) => (
          <TableRow
            key={statement.id}
            onClick={() => onSelect(statement)}
            className="hover:bg-muted/50 cursor-pointer"
          >
            <TableCell>{statement.client.name}</TableCell>
            <TableCell>{formatPeriod(statement.period)}</TableCell>
            <TableCell>{statement.invoiceIds.length}</TableCell>
            <TableCell>{formatCurrency(statement.total)}</TableCell>
            <TableCell>{formatCurrency(statement.paidAmount)}</TableCell>
            <TableCell>
              <StatusBadge type="statement" status={statement.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

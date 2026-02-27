import type { BookingWithRelations } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { formatCurrency, formatDate } from "@/lib/format";
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
}

export function BookingTable({ bookings, onSelect }: BookingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Execution Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow
            key={booking.id}
            onClick={() => onSelect(booking)}
            className="hover:bg-muted/50 cursor-pointer"
          >
            <TableCell>
              <StatusBadge type="booking" status={booking.status} />
            </TableCell>
            <TableCell className="max-w-[250px] truncate font-medium">
              {booking.title}
            </TableCell>
            <TableCell>{booking.client.name}</TableCell>
            <TableCell>
              <ServiceTypeIcon serviceType={booking.category} />
            </TableCell>
            <TableCell>{formatCurrency(booking.price)}</TableCell>
            <TableCell>{formatDate(booking.executionAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

import { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import type { ClientRow } from "@/types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { formatCurrency, formatRelativeTime, formatDate } from "@/lib/format";

interface ClientTableProps {
  clients: ClientRow[];
  onSelect: (client: ClientRow) => void;
}

type SortColumn = "name" | "totalSpend" | "lastActivityAt" | "createdAt";
type SortDirection = "asc" | "desc";

function compareSortValues(
  a: ClientRow,
  b: ClientRow,
  column: SortColumn,
  direction: SortDirection
): number {
  let result = 0;

  switch (column) {
    case "name":
      result = a.name.localeCompare(b.name);
      break;
    case "totalSpend":
      result = a.totalSpend - b.totalSpend;
      break;
    case "lastActivityAt":
      result =
        new Date(a.lastActivityAt).getTime() -
        new Date(b.lastActivityAt).getTime();
      break;
    case "createdAt":
      result =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      break;
  }

  return direction === "desc" ? -result : result;
}

export function ClientTable({ clients, onSelect }: ClientTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("lastActivityAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) =>
      compareSortValues(a, b, sortColumn, sortDirection)
    );
  }, [clients, sortColumn, sortDirection]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleSort("name")}
            >
              Client
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleSort("totalSpend")}
            >
              Total Spend
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </TableHead>
          <TableHead>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleSort("lastActivityAt")}
            >
              Last Activity
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </TableHead>
          <TableHead>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleSort("createdAt")}
            >
              Member Since
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedClients.map((client) => (
          <TableRow
            key={client.id}
            className="cursor-pointer"
            onClick={() => onSelect(client)}
          >
            <TableCell>
              <div className="flex items-center gap-2">
                <img
                  src={client.avatarUrl}
                  alt={client.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">{client.name}</span>
                {client.isVip && <VipIndicator />}
              </div>
            </TableCell>
            <TableCell className="text-sm">
              {client.company || (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm">{client.email}</div>
              <div className="text-xs text-muted-foreground">
                {client.phone}
              </div>
            </TableCell>
            <TableCell className="text-sm">
              {formatCurrency(client.totalSpend)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatRelativeTime(client.lastActivityAt)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(client.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

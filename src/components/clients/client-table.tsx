import { useState, useMemo } from "react";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ClientRow, Role } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  onEdit?: (client: ClientRow) => void;
  onDelete?: (client: ClientRow) => void;
  currentUserRole?: Role;
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

export function ClientTable({
  clients,
  onSelect,
  onEdit,
  onDelete,
  currentUserRole,
}: ClientTableProps) {
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
          <TableHead className="min-w-[220px]">
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
          {onEdit && <TableHead className="w-12" />}
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
              <div className="flex items-center gap-2 whitespace-nowrap">
                <img
                  src={client.avatarUrl}
                  alt={client.name}
                  className="w-8 h-8 shrink-0 rounded-full"
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
              {client.email && <div className="text-sm">{client.email}</div>}
              {client.phone && (
                <div className="text-xs text-muted-foreground">
                  {client.phone}
                </div>
              )}
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
            {onEdit && (
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(client); }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {currentUserRole === "admin" && onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => { e.stopPropagation(); onDelete(client); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

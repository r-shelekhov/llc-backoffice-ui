import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown } from "lucide-react";
import type { RequestWithRelations } from "@/types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RequestTableProps {
  requests: RequestWithRelations[];
}

type SortColumn = "status" | "priority" | "createdAt" | "title" | "client";
type SortDirection = "asc" | "desc";

const STATUS_ORDER = [
  "action_required",
  "new",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
] as const;

const PRIORITY_ORDER = ["critical", "high", "medium", "low"] as const;

function compareSortValues(
  a: RequestWithRelations,
  b: RequestWithRelations,
  column: SortColumn,
  direction: SortDirection
): number {
  let result = 0;

  switch (column) {
    case "status": {
      const aIdx = STATUS_ORDER.indexOf(a.status as (typeof STATUS_ORDER)[number]);
      const bIdx = STATUS_ORDER.indexOf(b.status as (typeof STATUS_ORDER)[number]);
      result = aIdx - bIdx;
      break;
    }
    case "priority": {
      const aIdx = PRIORITY_ORDER.indexOf(a.priority as (typeof PRIORITY_ORDER)[number]);
      const bIdx = PRIORITY_ORDER.indexOf(b.priority as (typeof PRIORITY_ORDER)[number]);
      result = aIdx - bIdx;
      break;
    }
    case "createdAt": {
      result =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      break;
    }
    case "title": {
      result = a.title.localeCompare(b.title);
      break;
    }
    case "client": {
      result = a.client.name.localeCompare(b.client.name);
      break;
    }
  }

  return direction === "desc" ? -result : result;
}

export function RequestTable({ requests }: RequestTableProps) {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<SortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) =>
      compareSortValues(a, b, sortColumn, sortDirection)
    );
  }, [requests, sortColumn, sortDirection]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleSort("status")}
            >
              Status
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </TableHead>
          <TableHead>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleSort("priority")}
            >
              Priority
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </TableHead>
          <TableHead>SLA</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleSort("title")}
            >
              Title
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </TableHead>
          <TableHead>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleSort("client")}
            >
              Client
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleSort("createdAt")}
            >
              Created
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedRequests.map((request) => (
          <TableRow
            key={request.id}
            className={cn(
              "cursor-pointer",
              request.status === "action_required" &&
                "border-l-2 border-l-red-400"
            )}
            onClick={() => navigate(`/requests/${request.id}`)}
          >
            <TableCell>
              <StatusBadge type="request" status={request.status} />
            </TableCell>
            <TableCell>
              <PriorityBadge priority={request.priority} />
            </TableCell>
            <TableCell>
              <SlaBadge state={request.slaState} />
            </TableCell>
            <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[100px]">
              {request.id}
            </TableCell>
            <TableCell>
              <span className="block truncate max-w-[250px] text-sm font-medium">
                {request.title}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{request.client.name}</span>
                {request.client.isVip && <VipIndicator />}
              </div>
            </TableCell>
            <TableCell>
              <ServiceTypeIcon serviceType={request.serviceType} />
            </TableCell>
            <TableCell>
              <ChannelIcon channel={request.channel} />
            </TableCell>
            <TableCell>
              {request.assignee ? (
                <div className="flex items-center gap-2">
                  <img
                    src={request.assignee.avatarUrl}
                    alt={request.assignee.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{request.assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Unassigned
                </span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatRelativeTime(request.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

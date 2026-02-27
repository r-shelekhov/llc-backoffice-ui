import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown } from "lucide-react";
import type { ConversationWithRelations } from "@/types";
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

interface ConversationTableProps {
  conversations: ConversationWithRelations[];
}

type SortColumn = "status" | "priority" | "createdAt" | "title" | "client";
type SortDirection = "asc" | "desc";

const STATUS_ORDER = [
  "awaiting_client",
  "new",
  "in_review",
  "converted",
  "closed",
] as const;

const PRIORITY_ORDER = ["critical", "high", "medium", "low"] as const;

function compareSortValues(
  a: ConversationWithRelations,
  b: ConversationWithRelations,
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

export function ConversationTable({ conversations }: ConversationTableProps) {
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

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) =>
      compareSortValues(a, b, sortColumn, sortDirection)
    );
  }, [conversations, sortColumn, sortDirection]);

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
        {sortedConversations.map((conversation) => (
          <TableRow
            key={conversation.id}
            className={cn(
              "cursor-pointer",
              conversation.status === "awaiting_client" &&
                "border-l-2 border-l-red-400"
            )}
            onClick={() => navigate(`/conversations/${conversation.id}`)}
          >
            <TableCell>
              <StatusBadge type="conversation" status={conversation.status} />
            </TableCell>
            <TableCell>
              <PriorityBadge priority={conversation.priority} />
            </TableCell>
            <TableCell>
              <SlaBadge state={conversation.slaState} />
            </TableCell>
            <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[100px]">
              {conversation.id}
            </TableCell>
            <TableCell>
              <span className="block truncate max-w-[250px] text-sm font-medium">
                {conversation.title}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{conversation.client.name}</span>
                {conversation.client.isVip && <VipIndicator />}
              </div>
            </TableCell>
            <TableCell>
              <ServiceTypeIcon serviceType={conversation.serviceType} />
            </TableCell>
            <TableCell>
              <ChannelIcon channel={conversation.channel} />
            </TableCell>
            <TableCell>
              {conversation.assignee ? (
                <div className="flex items-center gap-2">
                  <img
                    src={conversation.assignee.avatarUrl}
                    alt={conversation.assignee.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{conversation.assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Unassigned
                </span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatRelativeTime(conversation.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

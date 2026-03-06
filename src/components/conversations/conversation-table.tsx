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
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { formatRelativeTime } from "@/lib/format";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface ConversationTableProps {
  conversations: ConversationWithRelations[];
}

type SortColumn = "priority" | "createdAt" | "title" | "client";
type SortDirection = "asc" | "desc";

const PRIORITY_ORDER = ["critical", "high", "medium", "low"] as const;

function compareSortValues(
  a: ConversationWithRelations,
  b: ConversationWithRelations,
  column: SortColumn,
  direction: SortDirection
): number {
  let result = 0;

  switch (column) {
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
    <TooltipProvider>
    <Table>
      <TableHeader>
        <TableRow>
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
          <TableHead>Managers</TableHead>
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
            className="cursor-pointer"
            onClick={() => navigate(`/inbox?id=${conversation.id}`)}
          >
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
              {conversation.managers.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  Unassigned
                </span>
              ) : conversation.managers.length === 1 ? (
                <div className="flex items-center gap-2">
                  <img
                    src={conversation.managers[0].avatarUrl}
                    alt={conversation.managers[0].name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{conversation.managers[0].name}</span>
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <AvatarGroup>
                        {conversation.managers.slice(0, 2).map((m) => (
                          <Avatar key={m.id} size="sm">
                            <AvatarImage src={m.avatarUrl} alt={m.name} />
                            <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {conversation.managers.length > 2 && (
                          <AvatarGroupCount className="text-xs">
                            +{conversation.managers.length - 2}
                          </AvatarGroupCount>
                        )}
                      </AvatarGroup>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {conversation.managers.map((m) => m.name).join(", ")}
                  </TooltipContent>
                </Tooltip>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatRelativeTime(conversation.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </TooltipProvider>
  );
}

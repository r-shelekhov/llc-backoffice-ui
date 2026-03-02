import { ArrowDownNarrowWide, ArrowUpNarrowWide, Search } from "lucide-react";
import type { Channel, ConversationWithRelations, InboxStatusTab, SortField, SortDirection } from "@/types";
import { CHANNEL_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConversationItem } from "./conversation-item";
import { cn } from "@/lib/utils";

const SORT_FIELD_LABELS: Record<SortField, string> = {
  last_activity: "Last Activity",
  date_started: "Date Started",
  priority: "Priority",
  waiting_since: "Waiting Since",
  sla_due: "SLA Due",
};

const STATUS_OPTIONS: { value: InboxStatusTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "awaiting", label: "Awaiting" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
  { value: "snoozed", label: "Snoozed" },
];

const channelTabs: { value: Channel | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "whatsapp", label: CHANNEL_LABELS.whatsapp },
  { value: "email", label: CHANNEL_LABELS.email },
  { value: "phone", label: CHANNEL_LABELS.phone },
  { value: "web", label: CHANNEL_LABELS.web },
];

interface ConversationListProps {
  conversations: ConversationWithRelations[];
  unreadConversationIds: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeStatusTab: InboxStatusTab;
  onStatusTabChange: (tab: InboxStatusTab) => void;
  tabCounts: Record<InboxStatusTab, number>;
  activeChannel: Channel | "all";
  onChannelChange: (channel: Channel | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSortByChange: (field: SortField) => void;
  onSortDirectionChange: () => void;
}

export function ConversationList({
  conversations,
  unreadConversationIds,
  selectedId,
  onSelect,
  activeStatusTab,
  onStatusTabChange,
  tabCounts,
  activeChannel,
  onChannelChange,
  search,
  onSearchChange,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 space-y-3 border-b p-4">
        <h2 className="text-lg font-semibold">Inbox</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {channelTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChannelChange(tab.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors",
                activeChannel === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Select value={activeStatusTab} onValueChange={(v) => onStatusTabChange(v as InboxStatusTab)}>
            <SelectTrigger size="sm" className="w-[140px] text-xs">
              <SelectValue>
                {STATUS_OPTIONS.find((o) => o.value === activeStatusTab)?.label}
                {tabCounts[activeStatusTab] > 0 && ` (${tabCounts[activeStatusTab]})`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}{tabCounts[opt.value] > 0 ? ` (${tabCounts[opt.value]})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Select value={sortBy} onValueChange={(v) => onSortByChange(v as SortField)}>
            <SelectTrigger size="sm" className="flex-1 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(SORT_FIELD_LABELS) as [SortField, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onSortDirectionChange}
            aria-label={sortDirection === "asc" ? "Sort ascending" : "Sort descending"}
          >
            {sortDirection === "asc" ? <ArrowUpNarrowWide className="size-4" /> : <ArrowDownNarrowWide className="size-4" />}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No conversations found
          </p>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isUnread={unreadConversationIds.has(conversation.id)}
              isSelected={conversation.id === selectedId}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

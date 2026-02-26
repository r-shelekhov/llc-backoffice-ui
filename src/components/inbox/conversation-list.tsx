import { Search } from "lucide-react";
import type { Channel, RequestWithRelations } from "@/types";
import { CHANNEL_LABELS } from "@/lib/constants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationItem } from "./conversation-item";

interface ConversationListProps {
  requests: RequestWithRelations[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeChannel: Channel | "all";
  onChannelChange: (channel: Channel | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const channelTabs: { value: Channel | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "whatsapp", label: CHANNEL_LABELS.whatsapp },
  { value: "email", label: CHANNEL_LABELS.email },
  { value: "phone", label: CHANNEL_LABELS.phone },
  { value: "web", label: CHANNEL_LABELS.web },
];

export function ConversationList({
  requests,
  selectedId,
  onSelect,
  activeChannel,
  onChannelChange,
  search,
  onSearchChange,
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
        <Tabs
          value={activeChannel}
          onValueChange={(v) => onChannelChange(v as Channel | "all")}
        >
          <TabsList variant="line" className="w-full">
            {channelTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No conversations found
          </p>
        ) : (
          requests.map((request) => (
            <ConversationItem
              key={request.id}
              request={request}
              isSelected={request.id === selectedId}
              onClick={() => onSelect(request.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

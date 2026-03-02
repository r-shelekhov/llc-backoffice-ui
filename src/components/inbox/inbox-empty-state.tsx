import { MessageSquare, Inbox, Clock, BarChart3 } from "lucide-react";
import type { InboxStatusTab } from "@/types";

interface InboxEmptyStateProps {
  stats: {
    openCount: number;
    awaitingCount: number;
    avgResponseTime: string;
    todayCount: number;
  };
  onStatusTabChange?: (tab: InboxStatusTab) => void;
}

export function InboxEmptyState({ stats, onStatusTabChange }: InboxEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      <div className="max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="size-8 text-primary" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Welcome to your Inbox</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a conversation from the left to get started.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onStatusTabChange?.("open")}
            className="rounded-lg border p-3 text-left transition-colors hover:bg-accent/30 cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Inbox className="size-3.5" />
              <span>Open</span>
            </div>
            <p className="mt-1 text-xl font-semibold">{stats.openCount}</p>
          </button>
          <button
            type="button"
            onClick={() => onStatusTabChange?.("awaiting")}
            className="rounded-lg border p-3 text-left transition-colors hover:bg-accent/30 cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span>Awaiting</span>
            </div>
            <p className="mt-1 text-xl font-semibold">{stats.awaitingCount}</p>
          </button>
          <div className="rounded-lg border p-3 text-left">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="size-3.5" />
              <span>Avg Response</span>
            </div>
            <p className="mt-1 text-xl font-semibold">{stats.avgResponseTime}</p>
          </div>
          <div className="rounded-lg border p-3 text-left">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="size-3.5" />
              <span>Today</span>
            </div>
            <p className="mt-1 text-xl font-semibold">{stats.todayCount}</p>
          </div>
        </div>

        {/* Quick tips */}
        <div className="rounded-lg border bg-muted/20 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Tips</p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <li>Use status tabs to filter by workflow stage</li>
            <li>Snooze conversations to revisit them later</li>
            <li>Use canned responses for faster replies</li>
            <li>Add internal notes to share context with your team</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

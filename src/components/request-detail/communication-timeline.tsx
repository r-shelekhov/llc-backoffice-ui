import { useMemo } from "react";
import { format } from "date-fns";
import { CommunicationMessage } from "./communication-message";
import type { Communication } from "@/types";

interface CommunicationTimelineProps {
  communications: Communication[];
}

export function CommunicationTimeline({
  communications,
}: CommunicationTimelineProps) {
  const sortedCommunications = useMemo(
    () =>
      [...communications].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [communications]
  );

  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: Communication[] }[] = [];
    let currentDate = "";

    for (const comm of sortedCommunications) {
      const dateKey = format(new Date(comm.createdAt), "yyyy-MM-dd");
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({
          date: format(new Date(comm.createdAt), "MMMM d, yyyy"),
          items: [comm],
        });
      } else {
        groups[groups.length - 1].items.push(comm);
      }
    }

    return groups;
  }, [sortedCommunications]);

  if (communications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No communications yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groupedByDate.map((group) => (
        <div key={group.date} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground font-medium">
              {group.date}
            </span>
            <div className="flex-1 border-t border-border" />
          </div>

          {group.items.map((comm) => (
            <CommunicationMessage key={comm.id} communication={comm} />
          ))}
        </div>
      ))}
    </div>
  );
}

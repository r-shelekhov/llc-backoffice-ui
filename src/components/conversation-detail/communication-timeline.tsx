import { useMemo } from "react";
import { format } from "date-fns";
import { CommunicationMessage } from "./communication-message";
import type { PaymentLinkData } from "./service-message";
import type { Communication } from "@/types";

interface CommunicationTimelineProps {
  communications: Communication[];
  getSharePaymentLinkHandler?: (comm: Communication) => (() => void) | undefined;
  getPaymentLinkData?: (comm: Communication) => PaymentLinkData | undefined;
  getCreateInvoiceHandler?: (comm: Communication) => (() => void) | undefined;
  lastReadAtOnOpen?: string | null;
  newMessagesDividerRef?: React.RefObject<HTMLDivElement | null>;
}

export function CommunicationTimeline({
  communications,
  getSharePaymentLinkHandler,
  getPaymentLinkData,
  getCreateInvoiceHandler,
  lastReadAtOnOpen,
  newMessagesDividerRef,
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

  const { firstUnreadId, unreadCount } = useMemo(() => {
    if (!lastReadAtOnOpen) return { firstUnreadId: null, unreadCount: 0 };
    const lastReadMs = new Date(lastReadAtOnOpen).getTime();
    if (!Number.isFinite(lastReadMs)) return { firstUnreadId: null, unreadCount: 0 };

    let firstId: string | null = null;
    let count = 0;
    for (const comm of sortedCommunications) {
      if (comm.sender === "agent" || comm.sender === "system") continue;
      const createdMs = new Date(comm.createdAt).getTime();
      if (createdMs > lastReadMs) {
        if (!firstId) firstId = comm.id;
        count++;
      }
    }
    return { firstUnreadId: firstId, unreadCount: count };
  }, [sortedCommunications, lastReadAtOnOpen]);

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
            <div key={comm.id}>
              {comm.id === firstUnreadId && (
                <div ref={newMessagesDividerRef} className="flex items-center gap-3 py-2">
                  <div className="flex-1 border-t border-primary/50" />
                  <span className="text-xs font-medium text-primary">
                    {unreadCount} new {unreadCount === 1 ? "message" : "messages"}
                  </span>
                  <div className="flex-1 border-t border-primary/50" />
                </div>
              )}
              <CommunicationMessage communication={comm} onSharePaymentLink={getSharePaymentLinkHandler?.(comm)} paymentLinkData={getPaymentLinkData?.(comm)} onCreateInvoice={getCreateInvoiceHandler?.(comm)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

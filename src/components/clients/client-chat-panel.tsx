import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Attachment, Channel, Communication, ConversationWithRelations } from "@/types";
import { CommunicationTimeline } from "@/components/conversation-detail/communication-timeline";
import { MessageComposer } from "@/components/inbox/message-composer";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CHANNEL_LABELS } from "@/lib/constants";
import { isConversationUnread } from "@/lib/unread";

const CHANNEL_ORDER: Channel[] = ["whatsapp", "email", "phone", "web", "concierge"];

interface ClientChatPanelProps {
  conversationsByChannel: Map<Channel, ConversationWithRelations>;
  localMessages: Map<string, Communication[]>;
  conversationLastReadAt: Record<string, string>;
  lastReadAtOnOpen: Record<string, string | null>;
  onSend: (conversationId: string, message: string, attachments?: Attachment[]) => void;
  onSharePaymentLink: (conversationId: string, invoiceId: string) => void;
  onMarkRead: (conversationId: string) => void;
}

export function ClientChatPanel({
  conversationsByChannel,
  localMessages,
  conversationLastReadAt,
  lastReadAtOnOpen,
  onSend,
  onSharePaymentLink,
  onMarkRead,
}: ClientChatPanelProps) {
  const availableChannels = useMemo(
    () => CHANNEL_ORDER.filter((ch) => conversationsByChannel.has(ch)),
    [conversationsByChannel]
  );

  const [activeChannel, setActiveChannel] = useState<Channel | null>(
    availableChannels[0] ?? null
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const newMessagesDividerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);

  const activeConversation = activeChannel
    ? conversationsByChannel.get(activeChannel) ?? null
    : null;

  const allMessages = useMemo(() => {
    if (!activeConversation) return [];
    const local = localMessages.get(activeConversation.id) ?? [];
    return [...activeConversation.communications, ...local];
  }, [activeConversation, localMessages]);

  const getSharePaymentLinkHandler = useCallback(
    (comm: Communication) => {
      if (!activeConversation) return undefined;
      const event = comm.event;
      if (!event) return undefined;
      if (
        event.type !== "booking_created" &&
        event.type !== "invoice_created" &&
        event.type !== "invoice_sent"
      )
        return undefined;

      let invoice: (typeof activeConversation.invoices)[number] | undefined;
      if (event.invoiceId) {
        invoice = activeConversation.invoices.find((inv) => inv.id === event.invoiceId);
      } else if (event.bookingId) {
        invoice = activeConversation.invoices.find((inv) => inv.bookingId === event.bookingId);
      }

      if (!invoice || invoice.status === "paid") return undefined;
      const invoiceId = invoice.id;
      const convId = activeConversation.id;
      return () => onSharePaymentLink(convId, invoiceId);
    },
    [activeConversation, onSharePaymentLink]
  );

  // On conversation change: scroll to divider or bottom + mark read
  useEffect(() => {
    if (!activeConversation) return;
    prevMessageCountRef.current = allMessages.length;
    onMarkRead(activeConversation.id);
    requestAnimationFrame(() => {
      if (newMessagesDividerRef.current) {
        newMessagesDividerRef.current.scrollIntoView({ block: "start" });
      } else if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [activeConversation?.id]);

  // On new message: scroll to bottom
  useEffect(() => {
    if (allMessages.length > prevMessageCountRef.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
    prevMessageCountRef.current = allMessages.length;
  }, [allMessages.length]);

  const channelHasUnread = useCallback(
    (ch: Channel) => {
      const conv = conversationsByChannel.get(ch);
      if (!conv) return false;
      return isConversationUnread(conv, conversationLastReadAt);
    },
    [conversationsByChannel, conversationLastReadAt]
  );

  const handleSend = useCallback(
    (message: string, attachments?: Attachment[]) => {
      if (!activeConversation) return;
      onSend(activeConversation.id, message, attachments);
    },
    [activeConversation, onSend]
  );

  if (availableChannels.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p>No conversations with this client yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="shrink-0 border-b">
        <Tabs
          value={activeChannel ?? undefined}
          onValueChange={(v) => setActiveChannel(v as Channel)}
        >
          <TabsList variant="line" className="px-4">
            {availableChannels.map((ch) => (
              <TabsTrigger key={ch} value={ch} className="gap-1.5">
                <ChannelIcon channel={ch} className="size-3.5" />
                {CHANNEL_LABELS[ch]}
                {channelHasUnread(ch) && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {activeConversation && (
          <CommunicationTimeline
            communications={allMessages}
            getSharePaymentLinkHandler={getSharePaymentLinkHandler}
            lastReadAtOnOpen={lastReadAtOnOpen[activeConversation.id]}
            newMessagesDividerRef={newMessagesDividerRef}
          />
        )}
      </div>

      <MessageComposer onSend={handleSend} />
    </div>
  );
}

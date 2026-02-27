import type { ConversationWithRelations } from "@/types";

type ReadMap = Record<string, string>;

function getLatestClientMessageMs(conversation: ConversationWithRelations): number | null {
  const latest = conversation.communications
    .filter((message) => message.sender === "client")
    .reduce<number | null>((max, message) => {
      const createdMs = new Date(message.createdAt).getTime();
      if (!Number.isFinite(createdMs)) return max;
      return max === null || createdMs > max ? createdMs : max;
    }, null);

  return latest;
}

export function isConversationUnread(
  conversation: ConversationWithRelations,
  conversationLastReadAt: ReadMap
): boolean {
  const latestClientMs = getLatestClientMessageMs(conversation);
  if (latestClientMs === null) return false;

  const lastReadAt = conversationLastReadAt[conversation.id];
  if (!lastReadAt) return true;

  const lastReadMs = new Date(lastReadAt).getTime();
  if (!Number.isFinite(lastReadMs)) return true;

  return latestClientMs > lastReadMs;
}


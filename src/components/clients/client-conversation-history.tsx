import type { ConversationWithRelations } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversationTable } from "@/components/conversations/conversation-table";

interface ClientConversationHistoryProps {
  conversations: ConversationWithRelations[];
}

export function ClientConversationHistory({ conversations }: ClientConversationHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation History</CardTitle>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conversations found</p>
        ) : (
          <ConversationTable conversations={conversations} />
        )}
      </CardContent>
    </Card>
  );
}

import type { ConversationWithRelations } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestTable } from "@/components/requests/request-table";

interface ClientRequestHistoryProps {
  conversations: ConversationWithRelations[];
}

export function ClientRequestHistory({ conversations }: ClientRequestHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation History</CardTitle>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conversations found</p>
        ) : (
          <RequestTable conversations={conversations} />
        )}
      </CardContent>
    </Card>
  );
}

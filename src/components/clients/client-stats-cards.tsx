import type { Client } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";

interface ClientStatsCardsProps {
  client: Client;
  conversationCount: number;
}

export function ClientStatsCards({ client, conversationCount }: ClientStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{conversationCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Spend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(client.totalSpend)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Member Since
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatDate(client.createdAt)}</p>
        </CardContent>
      </Card>
    </div>
  );
}

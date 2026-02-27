import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { VipIndicator } from "@/components/shared/vip-indicator";
import type { Client } from "@/types";

interface ClientSummaryCardProps {
  client: Client;
}

export function ClientSummaryCard({ client }: ClientSummaryCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition"
      onClick={() => navigate(`/clients/${client.id}`)}
    >
      <CardContent className="flex items-start gap-3">
        <img
          src={client.avatarUrl}
          alt={client.name}
          className="w-10 h-10 rounded-full shrink-0"
        />
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{client.name}</span>
            {client.isVip && <VipIndicator />}
          </div>
          <p className="text-sm text-muted-foreground">{client.company}</p>
          <p className="text-sm">{client.email}</p>
          <p className="text-sm">{client.phone}</p>
        </div>
      </CardContent>
    </Card>
  );
}

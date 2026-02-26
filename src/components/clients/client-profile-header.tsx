import { Mail, Phone, Calendar } from "lucide-react";
import type { Client } from "@/types";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { formatDate } from "@/lib/format";

interface ClientProfileHeaderProps {
  client: Client;
}

export function ClientProfileHeader({ client }: ClientProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <img
        src={client.avatarUrl}
        alt={client.name}
        className="w-16 h-16 rounded-full"
      />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          {client.isVip && <VipIndicator />}
        </div>
        <p className="text-lg text-muted-foreground">{client.company}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Mail className="size-4" />
            {client.email}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="size-4" />
            {client.phone}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          Member since {formatDate(client.createdAt)}
        </div>
      </div>
    </div>
  );
}

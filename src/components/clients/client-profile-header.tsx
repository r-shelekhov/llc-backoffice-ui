import { Mail, Phone, Calendar } from "lucide-react";
import type { Client } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { LIFECYCLE_AVATAR_COLORS } from "@/lib/constants";
import { formatDate, getInitials } from "@/lib/format";

interface ClientProfileHeaderProps {
  client: Client;
}

export function ClientProfileHeader({ client }: ClientProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar size="lg" shape={client.lifecycleStatus === 'lead' ? 'square' : 'circle'} className="size-16 text-lg">
        <AvatarFallback className={LIFECYCLE_AVATAR_COLORS[client.lifecycleStatus ?? 'client']}>
          {getInitials(client.name)}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          {client.isVip && <VipIndicator />}
        </div>
        <p className="text-lg text-muted-foreground">{client.company}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {client.email && (
            <span className="flex items-center gap-1">
              <Mail className="size-4" />
              {client.email}
            </span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1">
              <Phone className="size-4" />
              {client.phone}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          Member since {formatDate(client.createdAt)}
        </div>
      </div>
    </div>
  );
}

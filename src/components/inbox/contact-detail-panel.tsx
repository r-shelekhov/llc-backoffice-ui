import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, User as UserIcon } from "lucide-react";
import type { RequestWithRelations, User } from "@/types";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import { InternalNotesPanel } from "@/components/request-detail/internal-notes-panel";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { CHANNEL_LABELS, SERVICE_TYPE_LABELS } from "@/lib/constants";

interface ContactDetailPanelProps {
  request: RequestWithRelations;
  users: User[];
}

export function ContactDetailPanel({ request, users }: ContactDetailPanelProps) {
  const navigate = useNavigate();
  const { client, assignee } = request;

  return (
    <div className="space-y-0">
      {/* Client section */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <img
            src={client.avatarUrl}
            alt={client.name}
            className="size-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold">{client.name}</span>
              {client.isVip && <VipIndicator />}
            </div>
            <p className="truncate text-xs text-muted-foreground">{client.company}</p>
          </div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>{client.email}</p>
          <p>{client.phone}</p>
          <div className="flex gap-4 pt-1">
            <span>
              <span className="font-medium text-foreground">{client.totalRequests}</span> requests
            </span>
            <span>
              <span className="font-medium text-foreground">{formatCurrency(client.totalSpend)}</span> spent
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => navigate(`/clients/${client.id}`)}
        >
          View Profile
        </Button>
      </div>

      {/* Request section */}
      <div className="border-b p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Request Details
        </h4>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <ServiceTypeIcon serviceType={request.serviceType} className="size-4 text-muted-foreground" />
            <span>{SERVICE_TYPE_LABELS[request.serviceType]}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ChannelIcon channel={request.channel} className="size-4 text-muted-foreground" />
            <span>{CHANNEL_LABELS[request.channel]}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge type="request" status={request.status} />
            <PriorityBadge priority={request.priority} />
            <SlaBadge state={request.slaState} />
          </div>
          {request.pickupLocation && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p>{request.pickupLocation}</p>
                {request.dropoffLocation && (
                  <p className="text-muted-foreground">→ {request.dropoffLocation}</p>
                )}
              </div>
            </div>
          )}
          {request.pickupDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span>{formatDateTime(request.pickupDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Assignee section */}
      <div className="border-b p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Assignee
        </h4>
        {assignee ? (
          <div className="flex items-center gap-3">
            <img
              src={assignee.avatarUrl}
              alt={assignee.name}
              className="size-8 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{assignee.name}</p>
              <p className="truncate text-xs text-muted-foreground">{assignee.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="size-4" />
            <span>Unassigned</span>
          </div>
        )}
      </div>

      {/* Internal notes */}
      <div className="p-4">
        <InternalNotesPanel notes={request.internalNotes} users={users} />
      </div>
    </div>
  );
}

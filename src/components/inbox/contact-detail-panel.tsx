import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, User as UserIcon, ChevronDown, CircleDot, Flag, Clock3 } from "lucide-react";
import type { ConversationStatus, ConversationWithRelations, User } from "@/types";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import { InternalNotesPanel } from "@/components/conversation-detail/internal-notes-panel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { CHANNEL_LABELS, SERVICE_TYPE_LABELS, CONVERSATION_STATUS_TRANSITIONS, CONVERSATION_STATUS_LABELS } from "@/lib/constants";

interface ContactDetailPanelProps {
  conversation: ConversationWithRelations;
  users: User[];
  onStatusChange: (conversationId: string, newStatus: ConversationStatus) => void;
}

export function ContactDetailPanel({ conversation, users, onStatusChange }: ContactDetailPanelProps) {
  const navigate = useNavigate();
  const { client, assignee } = conversation;
  const transitions = CONVERSATION_STATUS_TRANSITIONS[conversation.status];

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
              <span className="font-medium text-foreground">{client.totalConversations}</span> conversations
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

      {/* Conversation section */}
      <div className="border-b p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversation Details
        </h4>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <ServiceTypeIcon serviceType={conversation.serviceType} className="mt-0.5 size-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Service</p>
              <p className="text-sm">{SERVICE_TYPE_LABELS[conversation.serviceType]}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ChannelIcon channel={conversation.channel} className="mt-0.5 size-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Channel</p>
              <p className="text-sm">{CHANNEL_LABELS[conversation.channel]}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CircleDot className="mt-0.5 size-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Workflow</p>
              <div className="mt-1">
                {transitions.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="inline-flex cursor-pointer items-center gap-1">
                        <StatusBadge type="conversation" status={conversation.status} />
                        <ChevronDown className="size-3 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {transitions.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => onStatusChange(conversation.id, status)}
                        >
                          {CONVERSATION_STATUS_LABELS[status]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <StatusBadge type="conversation" status={conversation.status} />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Flag className="mt-0.5 size-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Priority</p>
              <div className="mt-1">
                <PriorityBadge priority={conversation.priority} />
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 size-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">SLA</p>
              <div className="mt-1">
                <SlaBadge state={conversation.slaState} />
              </div>
            </div>
          </div>
          {conversation.pickupLocation && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Route</p>
                <p className="text-sm leading-snug">{conversation.pickupLocation}</p>
                {conversation.dropoffLocation && (
                  <p className="text-sm text-muted-foreground leading-snug">→ {conversation.dropoffLocation}</p>
                )}
              </div>
            </div>
          )}
          {conversation.pickupDate && (
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Pickup Time</p>
                <p className="text-sm">{formatDateTime(conversation.pickupDate)}</p>
              </div>
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
        <InternalNotesPanel notes={conversation.internalNotes} users={users} />
      </div>
    </div>
  );
}

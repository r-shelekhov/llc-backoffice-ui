import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, User as UserIcon, ChevronDown } from "lucide-react";
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
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <ServiceTypeIcon serviceType={conversation.serviceType} className="size-4 text-muted-foreground" />
            <span>{SERVICE_TYPE_LABELS[conversation.serviceType]}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ChannelIcon channel={conversation.channel} className="size-4 text-muted-foreground" />
            <span>{CHANNEL_LABELS[conversation.channel]}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CONVERSATION_STATUS_TRANSITIONS[conversation.status].length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex cursor-pointer items-center gap-1">
                    <StatusBadge type="conversation" status={conversation.status} />
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {CONVERSATION_STATUS_TRANSITIONS[conversation.status].map((status) => (
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
            <PriorityBadge priority={conversation.priority} />
            <SlaBadge state={conversation.slaState} />
          </div>
          {conversation.pickupLocation && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p>{conversation.pickupLocation}</p>
                {conversation.dropoffLocation && (
                  <p className="text-muted-foreground">→ {conversation.dropoffLocation}</p>
                )}
              </div>
            </div>
          )}
          {conversation.pickupDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span>{formatDateTime(conversation.pickupDate)}</span>
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

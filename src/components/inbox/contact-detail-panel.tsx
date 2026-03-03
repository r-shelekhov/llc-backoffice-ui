import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, User as UserIcon, Flag, Clock3 } from "lucide-react";
import type { ConversationWithRelations, User } from "@/types";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import { InternalNotesPanel } from "@/components/conversation-detail/internal-notes-panel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { CHANNEL_LABELS } from "@/lib/constants";
import { getAssignableManagers } from "@/lib/permissions";

interface ContactDetailPanelProps {
  conversation: ConversationWithRelations;
  users: User[];
  onManagerChange: (conversationId: string, managerId: string | null) => void;
  currentUserId?: string;
  currentUserRole?: string;
  onAddNote?: (content: string) => void;
  onEditNote?: (noteId: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
}

export function ContactDetailPanel({
  conversation,
  users,
  onManagerChange,
  currentUserId,
  currentUserRole,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: ContactDetailPanelProps) {
  const navigate = useNavigate();
  const { client, manager } = conversation;
  const assignableUsers = getAssignableManagers(client, users);

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
          onClick={() => navigate(`/clients/${client.id}`, { state: { from: "conversation", conversationId: conversation.id } })}
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
            <ChannelIcon channel={conversation.channel} className="mt-0.5 size-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Channel</p>
              <p className="text-sm">{CHANNEL_LABELS[conversation.channel]}</p>
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

      {/* Manager section */}
      <div className="border-b p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Manager
        </h4>
        <Select
          value={manager?.id ?? "unassigned"}
          onValueChange={(v) => onManagerChange(conversation.id, v === "unassigned" ? null : v)}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">
              <div className="flex items-center gap-2">
                <UserIcon className="size-4 text-muted-foreground" />
                <span>Unassigned</span>
              </div>
            </SelectItem>
            {assignableUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center gap-2">
                  <img src={user.avatarUrl} alt={user.name} className="size-5 rounded-full object-cover" />
                  <span>{user.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Internal notes */}
      <div className="p-4">
        <InternalNotesPanel
          notes={conversation.internalNotes}
          users={users}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      </div>
    </div>
  );
}

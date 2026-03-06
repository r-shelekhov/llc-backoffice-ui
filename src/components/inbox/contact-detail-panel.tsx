import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Flag, Clock3, X, Plus, AlertCircle } from "lucide-react";
import type { ConversationWithRelations, User } from "@/types";
import { VipIndicator } from "@/components/shared/vip-indicator";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import { InternalNotesPanel } from "@/components/conversation-detail/internal-notes-panel";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CHANNEL_LABELS } from "@/lib/constants";
import { getAssignableManagers } from "@/lib/permissions";
import { ClientBookingsSummary } from "@/components/clients/client-bookings-summary";

interface ContactDetailPanelProps {
  conversation: ConversationWithRelations;
  users: User[];
  onManagersChange: (conversationId: string, managerIds: string[]) => void;
  currentUserId?: string;
  currentUserRole?: string;
  onAddNote?: (content: string) => void;
  onEditNote?: (noteId: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
}

export function ContactDetailPanel({
  conversation,
  users,
  onManagersChange,
  currentUserId,
  currentUserRole,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: ContactDetailPanelProps) {
  const navigate = useNavigate();
  const { client, managers } = conversation;
  const assignableUsers = getAssignableManagers(client, users);
  const [addManagerOpen, setAddManagerOpen] = useState(false);

  // Users not yet assigned
  const availableManagers = assignableUsers.filter(
    (u) => !conversation.managerIds.includes(u.id)
  );

  function handleAddManager(userId: string) {
    onManagersChange(conversation.id, [...conversation.managerIds, userId]);
    setAddManagerOpen(false);
  }

  function handleRemoveManager(userId: string) {
    onManagersChange(
      conversation.id,
      conversation.managerIds.filter((id) => id !== userId)
    );
  }

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
        <div className="mt-3 space-y-1 text-xs">
          <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Mail className="size-3.5" />
            <span className="truncate">{client.email}</span>
          </a>
          <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Phone className="size-3.5" />
            <span>{client.phone}</span>
          </a>
        </div>
        {conversation.lifecycleStatus === "client" && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => navigate(`/clients/${client.id}`, { state: { from: "conversation", conversationId: conversation.id } })}
          >
            View Profile
          </Button>
        )}
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
        </div>
      </div>

      {/* Managers section */}
      <div className="border-b p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Managers
        </h4>
        <div className="space-y-2">
          {managers.length === 0 && (
            <div className="flex items-center gap-2 rounded-md bg-tone-warning-light px-3 py-2 text-sm text-tone-warning-foreground">
              <AlertCircle className="size-4 shrink-0" />
              <span>Unassigned</span>
            </div>
          )}
          {managers.map((manager) => (
            <div
              key={manager.id}
              className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={manager.avatarUrl}
                  alt={manager.name}
                  className="size-5 shrink-0 rounded-full object-cover"
                />
                <span className="truncate text-sm">{manager.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveManager(manager.id)}
                className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          <Popover open={addManagerOpen} onOpenChange={setAddManagerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Add manager
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search managers..." />
                <CommandList>
                  <CommandEmpty>No managers available.</CommandEmpty>
                  <CommandGroup>
                    {availableManagers.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.name}
                        onSelect={() => handleAddManager(user.id)}
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="size-5 rounded-full object-cover"
                        />
                        {user.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Bookings */}
      <div className="border-b p-4">
        <ClientBookingsSummary bookings={conversation.bookings} clientId={client.id} conversationId={conversation.id} />
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

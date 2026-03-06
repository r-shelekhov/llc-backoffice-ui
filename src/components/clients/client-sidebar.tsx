import { Mail, Phone } from "lucide-react";
import type { Booking, Client, InternalNote, User } from "@/types";
import { formatDate, formatCurrency } from "@/lib/format";
import { InternalNotesPanel } from "@/components/conversation-detail/internal-notes-panel";
import { ClientBookingsSummary } from "./client-bookings-summary";

interface ClientSidebarProps {
  client: Client;
  bookings: Booking[];
  notes: InternalNote[];
  users: User[];
  currentUserId?: string;
  currentUserRole?: string;
  onAddNote: (content: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export function ClientSidebar({
  client,
  bookings,
  notes,
  users,
  currentUserId,
  currentUserRole,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: ClientSidebarProps) {
  return (
    <div className="space-y-0">
      {/* Contact Details */}
      <div className="border-b p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Contact Details
        </h4>
        <div className="space-y-2 text-sm">
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Mail className="size-3.5" />
              <span className="truncate">{client.email}</span>
            </a>
          )}
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Phone className="size-3.5" />
              <span>{client.phone}</span>
            </a>
          )}
          <div className="flex gap-4 pt-1 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">{formatDate(client.createdAt)}</span>
              <p>Member since</p>
            </div>
            <div>
              <span className="font-medium text-foreground">{formatCurrency(client.totalSpend)}</span>
              <p>Total spend</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings */}
      <div className="border-b p-4">
        <ClientBookingsSummary bookings={bookings} clientId={client.id} />
      </div>

      {/* Internal Notes */}
      <div className="p-4">
        <InternalNotesPanel
          notes={notes}
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

import type { Booking, Client, InternalNote, User, RelationshipType } from "@/types";
import { formatDate, formatCurrency } from "@/lib/format";
import { InternalNotesPanel } from "@/components/conversation-detail/internal-notes-panel";
import { ClientBookingsSummary } from "./client-bookings-summary";
import { RelatedClientsSection } from "./related-clients-section";

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
  onAddRelation: (relatedClientId: string, type: RelationshipType) => void;
  onRemoveRelation: (relationId: string) => void;
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
  onAddRelation,
  onRemoveRelation,
}: ClientSidebarProps) {
  return (
    <div className="space-y-0">
      {/* Contacts */}
      {(client.email || client.phone) && (
        <div className="border-b p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contacts
          </h4>
          <div className="space-y-3 text-sm">
            {client.email && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <a
                  href={`mailto:${client.email}`}
                  className="truncate text-foreground hover:text-foreground/80"
                >
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <a
                  href={`tel:${client.phone}`}
                  className="text-foreground hover:text-foreground/80"
                >
                  {client.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Client Details */}
      <div className="border-b p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Client Details
        </h4>
        <div className="space-y-3 text-sm">
          {client.isAccountHolder && (
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-tone-info-light px-2.5 py-0.5 text-xs font-medium text-tone-info-foreground">
                <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                Account Holder
              </span>
            </div>
          )}
          {client.birthday && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Birthday
              </p>
              <p className="text-foreground">{formatDate(client.birthday)}</p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Member Since
            </p>
            <p className="text-foreground">{formatDate(client.createdAt)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Total Spend
            </p>
            <p className="text-base font-semibold text-foreground">{formatCurrency(client.totalSpend)}</p>
          </div>
        </div>
      </div>

      {/* Related Clients */}
      <RelatedClientsSection
        clientId={client.id}
        onAddRelation={onAddRelation}
        onRemoveRelation={onRemoveRelation}
      />

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

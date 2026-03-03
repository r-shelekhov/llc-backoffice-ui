import { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { clients, conversations, getAllConversationsWithRelations, internalNotes } from "@/lib/mock-data";
import { canViewClient, filterConversationsByPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { ErrorState } from "@/components/shared/error-state";
import { ClientProfileHeader } from "@/components/clients/client-profile-header";
import { ClientStatsCards } from "@/components/clients/client-stats-cards";
import { ClientConversationHistory } from "@/components/clients/client-conversation-history";
import { InternalNotesPanel } from "@/components/conversation-detail/internal-notes-panel";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, allUsers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [, forceUpdate] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [deletingOpen, setDeletingOpen] = useState(false);

  const fromConversation = location.state?.from === "conversation"
    ? (location.state.conversationId as string)
    : null;

  if (!id || !canViewClient(currentUser, id, conversations)) {
    return <PermissionDenied />;
  }

  const client = clients.find((c) => c.id === id);

  if (!client) {
    return <ErrorState message="Client not found" />;
  }

  const allConversations = getAllConversationsWithRelations();
  const clientAllConversations = allConversations.filter((c) => c.clientId === client.id);
  const clientConversations = filterConversationsByPermission(currentUser, clientAllConversations);

  const clientNotes = internalNotes.filter((n) => n.clientId === client.id);

  const handleAddNote = (content: string) => {
    const note = {
      id: `note-client-${Date.now()}`,
      conversationId: clientConversations[0]?.id ?? "",
      clientId: client.id,
      authorId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    internalNotes.push(note);
    forceUpdate((n) => n + 1);
  };

  const handleEditNote = (noteId: string, content: string) => {
    const note = internalNotes.find((n) => n.id === noteId);
    if (note) {
      note.content = content;
      note.updatedAt = new Date().toISOString();
    }
    forceUpdate((n) => n + 1);
  };

  const handleDeleteNote = (noteId: string) => {
    const idx = internalNotes.findIndex((n) => n.id === noteId);
    if (idx !== -1) internalNotes.splice(idx, 1);
    forceUpdate((n) => n + 1);
  };

  const handleSaveClient = (data: {
    name: string;
    email: string;
    phone: string;
    company: string;
    isVip: boolean;
  }) => {
    const idx = clients.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      clients[idx] = {
        ...clients[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }
    setFormOpen(false);
    forceUpdate((n) => n + 1);
  };

  const handleConfirmDelete = () => {
    const idx = clients.findIndex((c) => c.id === client.id);
    if (idx !== -1) clients.splice(idx, 1);
    setDeletingOpen(false);
    navigate("/clients");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="-ml-2 h-7 text-xs" asChild>
          <Link to={fromConversation ? `/inbox?id=${fromConversation}` : "/clients"}>
            <ArrowLeft className="size-3.5" />
            {fromConversation ? "Back to Conversation" : "Back to Clients"}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Pencil className="mr-1.5 size-3.5" />
            Edit
          </Button>
          {currentUser.role === "admin" && (
            <Button variant="destructive" size="sm" onClick={() => setDeletingOpen(true)}>
              <Trash2 className="mr-1.5 size-3.5" />
              Delete
            </Button>
          )}
        </div>
      </div>
      <ClientProfileHeader client={client} />
      <ClientStatsCards client={client} conversationCount={clientConversations.length} />
      <ClientConversationHistory conversations={clientConversations} />
      <div className="rounded-lg border p-4">
        <InternalNotesPanel
          notes={clientNotes}
          users={allUsers}
          currentUserId={currentUser.id}
          currentUserRole={currentUser.role}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      </div>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={client}
        onSave={handleSaveClient}
      />

      {deletingOpen && (
        <DeleteClientDialog
          open={deletingOpen}
          onOpenChange={setDeletingOpen}
          client={client}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

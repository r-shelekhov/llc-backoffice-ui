import { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, allUsers } = useAuth();
  const location = useLocation();
  const [, forceUpdate] = useState(0);

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

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 h-7 text-xs" asChild>
        <Link to={fromConversation ? `/inbox?id=${fromConversation}` : "/clients"}>
          <ArrowLeft className="size-3.5" />
          {fromConversation ? "Back to Conversation" : "Back to Clients"}
        </Link>
      </Button>
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
    </div>
  );
}

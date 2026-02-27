import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { clients, conversations, getAllConversationsWithRelations } from "@/lib/mock-data";
import { canViewClient, filterConversationsByPermission } from "@/lib/permissions";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { ErrorState } from "@/components/shared/error-state";
import { ClientProfileHeader } from "@/components/clients/client-profile-header";
import { ClientStatsCards } from "@/components/clients/client-stats-cards";
import { ClientConversationHistory } from "@/components/clients/client-conversation-history";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();

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

  return (
    <div className="space-y-6">
      <ClientProfileHeader client={client} />
      <ClientStatsCards client={client} conversationCount={clientConversations.length} />
      <ClientConversationHistory conversations={clientConversations} />
    </div>
  );
}

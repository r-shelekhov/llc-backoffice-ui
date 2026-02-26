import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { clients, requests, getAllRequestsWithRelations } from "@/lib/mock-data";
import { canViewClient, filterRequestsByPermission } from "@/lib/permissions";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { ErrorState } from "@/components/shared/error-state";
import { ClientProfileHeader } from "@/components/clients/client-profile-header";
import { ClientStatsCards } from "@/components/clients/client-stats-cards";
import { ClientRequestHistory } from "@/components/clients/client-request-history";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();

  if (!id || !canViewClient(currentUser, id, requests)) {
    return <PermissionDenied />;
  }

  const client = clients.find((c) => c.id === id);

  if (!client) {
    return <ErrorState message="Client not found" />;
  }

  const allRequests = getAllRequestsWithRelations();
  const clientAllRequests = allRequests.filter((r) => r.clientId === client.id);
  const clientRequests = filterRequestsByPermission(currentUser, clientAllRequests);

  return (
    <div className="space-y-6">
      <ClientProfileHeader client={client} />
      <ClientStatsCards client={client} requestCount={clientRequests.length} />
      <ClientRequestHistory requests={clientRequests} />
    </div>
  );
}

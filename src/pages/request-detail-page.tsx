import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getRequestWithRelations, users } from "@/lib/mock-data";
import { canViewRequest } from "@/lib/permissions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { RequestDetailHeader } from "@/components/request-detail/request-detail-header";
import { RequestInfoPanel } from "@/components/request-detail/request-info-panel";
import { CommunicationTimeline } from "@/components/request-detail/communication-timeline";
import { ClientSummaryCard } from "@/components/request-detail/client-summary-card";
import { InternalNotesPanel } from "@/components/request-detail/internal-notes-panel";
import { InvoicePaymentCard } from "@/components/request-detail/invoice-payment-card";

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();

  const request = id ? getRequestWithRelations(id) : null;

  if (!request) {
    return <ErrorState message="Request not found" />;
  }

  if (!canViewRequest(currentUser, request)) {
    return <PermissionDenied />;
  }

  return (
    <div className="space-y-6">
      <RequestDetailHeader request={request} />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <RequestInfoPanel request={request} />
          <Card>
            <CardHeader>
              <CardTitle>Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <CommunicationTimeline
                communications={request.communications}
              />
            </CardContent>
          </Card>
        </div>
        <div className="w-80 shrink-0 space-y-6">
          <ClientSummaryCard client={request.client} />
          <InternalNotesPanel notes={request.internalNotes} users={users} />
          <InvoicePaymentCard
            invoices={request.invoices}
            payments={request.payments}
          />
        </div>
      </div>
    </div>
  );
}

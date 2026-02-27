import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getConversationWithRelations, users } from "@/lib/mock-data";
import { canViewConversation } from "@/lib/permissions";
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

  const conversation = id ? getConversationWithRelations(id) : null;

  if (!conversation) {
    return <ErrorState message="Conversation not found" />;
  }

  if (!canViewConversation(currentUser, conversation)) {
    return <PermissionDenied />;
  }

  return (
    <div className="space-y-6">
      <RequestDetailHeader conversation={conversation} />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <RequestInfoPanel conversation={conversation} />
          <Card>
            <CardHeader>
              <CardTitle>Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <CommunicationTimeline
                communications={conversation.communications}
              />
            </CardContent>
          </Card>
        </div>
        <div className="w-80 shrink-0 space-y-6">
          <ClientSummaryCard client={conversation.client} />
          <InternalNotesPanel notes={conversation.internalNotes} users={users} />
          <InvoicePaymentCard
            invoices={conversation.invoices}
            payments={conversation.payments}
          />
        </div>
      </div>
    </div>
  );
}

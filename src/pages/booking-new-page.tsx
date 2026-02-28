import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getConversationWithRelations } from "@/lib/mock-data";
import { canViewConversation } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { BookingCreateForm } from "@/components/bookings/booking-create-form";

export function BookingNewPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const conversation = conversationId
    ? getConversationWithRelations(conversationId)
    : null;

  // Guard: must have a valid conversation
  if (!conversationId || !conversation) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/inbox">
            <ArrowLeft className="size-4" />
            Back to Inbox
          </Link>
        </Button>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              No valid conversation. Please create a booking from the Inbox.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Guard: permission check
  if (!canViewConversation(currentUser, conversation)) {
    return <PermissionDenied />;
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to={`/inbox?id=${conversationId}`}>
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </Button>

      <h1 className="mb-6 text-2xl font-bold">Create Booking</h1>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingCreateForm
            conversation={conversation}
            onSubmit={(booking) => navigate(`/bookings/${booking.id}`)}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

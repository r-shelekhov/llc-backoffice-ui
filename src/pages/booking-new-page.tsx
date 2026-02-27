import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getConversationWithRelations } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export function BookingNewPage() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const conversation = conversationId
    ? getConversationWithRelations(conversationId)
    : null;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/inbox">
          <ArrowLeft className="size-4" />
          Back to Inbox
        </Link>
      </Button>

      <h1 className="text-2xl font-bold">Create Booking</h1>

      {conversation && (
        <div className="mt-4 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">From conversation</p>
          <p className="mt-1 text-sm text-muted-foreground">{conversation.title}</p>
          <p className="text-sm text-muted-foreground">
            Client: {conversation.client.name}
          </p>
        </div>
      )}

      <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          Booking creation form coming in M3.
        </p>
      </div>
    </div>
  );
}

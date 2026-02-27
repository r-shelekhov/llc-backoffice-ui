import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ServiceType } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { getConversationWithRelations, bookings, conversations } from "@/lib/mock-data";
import { canViewConversation } from "@/lib/permissions";
import { SERVICE_TYPE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionDenied } from "@/components/shared/permission-denied";

export function BookingNewPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const conversation = conversationId
    ? getConversationWithRelations(conversationId)
    : null;

  const [title, setTitle] = useState(conversation?.title ?? "");
  const [category, setCategory] = useState<ServiceType>(
    conversation?.serviceType ?? "car"
  );
  const [executionAt, setExecutionAt] = useState(
    conversation?.pickupDate
      ? conversation.pickupDate.slice(0, 16) // format for datetime-local
      : ""
  );
  const [location, setLocation] = useState(
    conversation
      ? `${conversation.pickupLocation} → ${conversation.dropoffLocation}`
      : ""
  );
  const [price, setPrice] = useState("");

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newId = `bk-${Date.now()}`;
    bookings.push({
      id: newId,
      conversationId: conversationId!,
      clientId: conversation!.clientId,
      assigneeId: conversation!.assigneeId ?? null,
      status: "draft",
      title,
      category,
      executionAt: executionAt ? new Date(executionAt).toISOString() : "",
      location,
      price: Number(price) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Mark conversation as converted
    const sourceConv = conversations.find((c) => c.id === conversationId);
    if (sourceConv) {
      sourceConv.status = "converted";
      sourceConv.updatedAt = new Date().toISOString();
    }

    navigate(`/bookings/${newId}`);
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

      <div className="mb-6 rounded-lg border bg-muted/30 p-4">
        <p className="text-sm font-medium">From conversation</p>
        <p className="mt-1 text-sm text-muted-foreground">{conversation.title}</p>
        <p className="text-sm text-muted-foreground">
          Client: {conversation.client.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-sm font-medium">Title</span>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Booking title"
                required
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium">Category</span>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as ServiceType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium">Execution Date &amp; Time</span>
              <Input
                type="datetime-local"
                value={executionAt}
                onChange={(e) => setExecutionAt(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium">Location</span>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Pickup → Dropoff"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium">Price (GBP)</span>
              <Input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit">Create Booking</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

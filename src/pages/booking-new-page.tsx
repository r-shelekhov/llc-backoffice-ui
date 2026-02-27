import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ServiceType } from "@/types";
import { getConversationWithRelations, bookings } from "@/lib/mock-data";
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

export function BookingNewPage() {
  const navigate = useNavigate();
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newId = `bk-${Date.now()}`;
    bookings.push({
      id: newId,
      conversationId: conversationId ?? "",
      clientId: conversation?.clientId ?? "",
      assigneeId: conversation?.assigneeId ?? null,
      status: "draft",
      title,
      category,
      executionAt: executionAt ? new Date(executionAt).toISOString() : "",
      location,
      price: Number(price) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    navigate(`/bookings/${newId}`);
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to={conversationId ? `/conversations/${conversationId}` : "/bookings"}>
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </Button>

      <h1 className="mb-6 text-2xl font-bold">Create Booking</h1>

      {conversation && (
        <div className="mb-6 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">From conversation</p>
          <p className="mt-1 text-sm text-muted-foreground">{conversation.title}</p>
          <p className="text-sm text-muted-foreground">
            Client: {conversation.client.name}
          </p>
        </div>
      )}

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
              <span className="text-sm font-medium">Price (USD)</span>
              <Input
                type="number"
                min="0"
                step="0.01"
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

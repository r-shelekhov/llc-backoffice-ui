import { useState } from "react";
import type { Booking, ConversationWithRelations, ServiceType } from "@/types";
import { bookings, conversations } from "@/lib/mock-data";
import { SERVICE_TYPE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingCreateFormProps {
  conversation: ConversationWithRelations;
  onSubmit: (booking: Booking) => void;
  onCancel: () => void;
}

export function BookingCreateForm({
  conversation,
  onSubmit,
  onCancel,
}: BookingCreateFormProps) {
  const [title, setTitle] = useState(conversation.title ?? "");
  const [category, setCategory] = useState<ServiceType>(
    conversation.serviceType ?? "car"
  );
  const [executionAt, setExecutionAt] = useState(
    conversation.pickupDate
      ? conversation.pickupDate.slice(0, 16)
      : ""
  );
  const [location, setLocation] = useState(
    `${conversation.pickupLocation} → ${conversation.dropoffLocation}`
  );
  const [price, setPrice] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newId = `bk-${Date.now()}`;
    const newBooking: Booking = {
      id: newId,
      conversationId: conversation.id,
      clientId: conversation.clientId,
      assigneeId: conversation.assigneeId ?? null,
      status: "draft",
      title,
      category,
      executionAt: executionAt ? new Date(executionAt).toISOString() : "",
      location,
      price: Number(price) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bookings.push(newBooking);

    // Mark conversation as converted
    const sourceConv = conversations.find((c) => c.id === conversation.id);
    if (sourceConv) {
      sourceConv.status = "converted";
      sourceConv.updatedAt = new Date().toISOString();
    }

    onSubmit(newBooking);
  }

  return (
    <>
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm font-medium">From conversation</p>
        <p className="mt-1 text-sm text-muted-foreground">{conversation.title}</p>
        <p className="text-sm text-muted-foreground">
          Client: {conversation.client.name}
        </p>
      </div>

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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}

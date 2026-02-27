import { MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { SERVICE_TYPE_LABELS, CHANNEL_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { ConversationWithRelations } from "@/types";

interface ConversationInfoPanelProps {
  conversation: ConversationWithRelations;
}

export function ConversationInfoPanel({ conversation }: ConversationInfoPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Pickup Location
          </span>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm">{conversation.pickupLocation}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Dropoff Location
          </span>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm">{conversation.dropoffLocation}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Pickup Date
          </span>
          <p className="text-sm">{formatDateTime(conversation.pickupDate)}</p>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Service Type
          </span>
          <div className="flex items-center gap-2">
            <ServiceTypeIcon serviceType={conversation.serviceType} />
            <span className="text-sm">
              {SERVICE_TYPE_LABELS[conversation.serviceType]}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Channel
          </span>
          <div className="flex items-center gap-2">
            <ChannelIcon channel={conversation.channel} />
            <span className="text-sm">{CHANNEL_LABELS[conversation.channel]}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Description
          </span>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {conversation.description}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Created
          </span>
          <p className="text-sm">{formatDateTime(conversation.createdAt)}</p>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Updated
          </span>
          <p className="text-sm">{formatDateTime(conversation.updatedAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

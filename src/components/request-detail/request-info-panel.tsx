import { MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ServiceTypeIcon } from "@/components/shared/service-type-icon";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { SERVICE_TYPE_LABELS, CHANNEL_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { RequestWithRelations } from "@/types";

interface RequestInfoPanelProps {
  request: RequestWithRelations;
}

export function RequestInfoPanel({ request }: RequestInfoPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Pickup Location
          </span>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm">{request.pickupLocation}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Dropoff Location
          </span>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm">{request.dropoffLocation}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Pickup Date
          </span>
          <p className="text-sm">{formatDateTime(request.pickupDate)}</p>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Service Type
          </span>
          <div className="flex items-center gap-2">
            <ServiceTypeIcon serviceType={request.serviceType} />
            <span className="text-sm">
              {SERVICE_TYPE_LABELS[request.serviceType]}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Channel
          </span>
          <div className="flex items-center gap-2">
            <ChannelIcon channel={request.channel} />
            <span className="text-sm">{CHANNEL_LABELS[request.channel]}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Description
          </span>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {request.description}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Created
          </span>
          <p className="text-sm">{formatDateTime(request.createdAt)}</p>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Updated
          </span>
          <p className="text-sm">{formatDateTime(request.updatedAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

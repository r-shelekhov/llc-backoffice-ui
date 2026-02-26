import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import type { RequestWithRelations } from "@/types";

interface RequestDetailHeaderProps {
  request: RequestWithRelations;
}

export function RequestDetailHeader({ request }: RequestDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">{request.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge type="request" status={request.status} />
            <PriorityBadge priority={request.priority} />
            <SlaBadge state={request.slaState} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {request.assignee ? (
            <div className="flex items-center gap-2">
              <img
                src={request.assignee.avatarUrl}
                alt={request.assignee.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm">{request.assignee.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground font-mono">{request.id}</p>
    </div>
  );
}

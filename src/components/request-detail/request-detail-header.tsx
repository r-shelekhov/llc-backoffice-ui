import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SlaBadge } from "@/components/shared/sla-badge";
import type { ConversationWithRelations } from "@/types";

interface RequestDetailHeaderProps {
  conversation: ConversationWithRelations;
}

export function RequestDetailHeader({ conversation }: RequestDetailHeaderProps) {
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
          <h1 className="text-xl font-semibold">{conversation.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge type="conversation" status={conversation.status} />
            <PriorityBadge priority={conversation.priority} />
            <SlaBadge state={conversation.slaState} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {conversation.assignee ? (
            <div className="flex items-center gap-2">
              <img
                src={conversation.assignee.avatarUrl}
                alt={conversation.assignee.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm">{conversation.assignee.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground font-mono">{conversation.id}</p>
    </div>
  );
}

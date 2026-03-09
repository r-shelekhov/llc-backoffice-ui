import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LIFECYCLE_AVATAR_COLORS, RELATIONSHIP_TYPE_LABELS } from "@/lib/constants";
import { getInitials } from "@/lib/format";
import { getRelatedClients, clients as allClients } from "@/lib/mock-data";
import { AddRelatedClientDialog } from "./add-related-client-dialog";
import type { RelationshipType } from "@/types";

interface RelatedClientsSectionProps {
  clientId: string;
  onAddRelation: (relatedClientId: string, type: RelationshipType) => void;
  onRemoveRelation: (relationId: string) => void;
}

export function RelatedClientsSection({
  clientId,
  onAddRelation,
  onRemoveRelation,
}: RelatedClientsSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const related = getRelatedClients(clientId);
  const excludeIds = [clientId, ...related.map((r) => r.relatedClient.id)];

  return (
    <div className="border-b p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Related Clients
        </h4>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {related.length === 0 ? (
        <p className="text-sm text-muted-foreground">No related clients</p>
      ) : (
        <div className="space-y-2">
          {related.map(({ relation, relatedClient, type }) => (
            <div
              key={relation.id}
              className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
            >
              <Link
                to={`/clients/${relatedClient.id}`}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <Avatar className="size-6 shrink-0">
                  <AvatarFallback className={`text-[10px] ${LIFECYCLE_AVATAR_COLORS.client}`}>
                    {getInitials(relatedClient.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm">{relatedClient.name}</span>
              </Link>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {RELATIONSHIP_TYPE_LABELS[type]}
              </span>
              <button
                type="button"
                onClick={() => onRemoveRelation(relation.id)}
                className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AddRelatedClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clients={allClients}
        excludeClientIds={excludeIds}
        onAdd={onAddRelation}
      />
    </div>
  );
}

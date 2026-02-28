import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import type { ClientFilterState, ClientRow, ConversationStatus } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import {
  getAllConversationsWithRelations,
  clients,
} from "@/lib/mock-data";
import {
  filterConversationsByPermission,
  filterVipConversations,
} from "@/lib/permissions";
import { applyClientFilters } from "@/lib/filters";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchInput } from "@/components/filters/search-input";
import { ClientTable } from "@/components/clients/client-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Checkbox } from "@/components/ui/checkbox";

const ACTIVE_STATUSES: ConversationStatus[] = [
  "new",
  "in_review",
  "awaiting_client",
];

const initialFilters: ClientFilterState = {
  search: "",
  vipOnly: false,
  activeOnly: false,
};

export function ClientsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ClientFilterState>(initialFilters);

  const clientRows = useMemo(() => {
    const allConversations = getAllConversationsWithRelations();
    const permitted = filterVipConversations(
      currentUser,
      filterConversationsByPermission(currentUser, allConversations)
    );

    const visibleClientIds = new Set(permitted.map((c) => c.clientId));

    const isAdminOrVip =
      currentUser.role === "admin" || currentUser.role === "vip_manager";

    const visibleClients = isAdminOrVip
      ? clients
      : clients.filter((c) => visibleClientIds.has(c.id));

    return visibleClients.map((client): ClientRow => {
      const clientConversations = permitted.filter(
        (c) => c.clientId === client.id
      );

      const maxCommDate = clientConversations.reduce<string | null>(
        (max, conv) => {
          for (const comm of conv.communications) {
            if (!max || comm.createdAt > max) max = comm.createdAt;
          }
          return max;
        },
        null
      );

      const maxConvDate = clientConversations.reduce<string | null>(
        (max, conv) => {
          if (!max || conv.updatedAt > max) return conv.updatedAt;
          return max;
        },
        null
      );

      const lastActivityAt = maxCommDate ?? maxConvDate ?? client.updatedAt;

      const isActive = clientConversations.some((c) =>
        ACTIVE_STATUSES.includes(c.status)
      );

      return {
        ...client,
        visibleConversationCount: clientConversations.length,
        lastActivityAt,
        isActive,
      };
    });
  }, [currentUser]);

  const filteredClients = applyClientFilters(clientRows, filters);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.vipOnly ? 1 : 0) +
    (filters.activeOnly ? 1 : 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clients</h1>

      <FilterBar
        onReset={() => setFilters(initialFilters)}
        activeCount={activeFilterCount}
      >
        <SearchInput
          value={filters.search}
          onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          placeholder="Search clients..."
        />
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={filters.vipOnly}
            onCheckedChange={(checked) =>
              setFilters((prev) => ({ ...prev, vipOnly: checked === true }))
            }
          />
          VIP only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={filters.activeOnly}
            onCheckedChange={(checked) =>
              setFilters((prev) => ({ ...prev, activeOnly: checked === true }))
            }
          />
          Active only
        </label>
      </FilterBar>

      {filteredClients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <ClientTable
          clients={filteredClients}
          onSelect={(client) => navigate(`/clients/${client.id}`)}
        />
      )}
    </div>
  );
}

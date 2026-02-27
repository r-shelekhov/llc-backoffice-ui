import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Crown, Activity, PoundSterling } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchInput } from "@/components/filters/search-input";
import { StatusFilter } from "@/components/filters/status-filter";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { ClientTable } from "@/components/clients/client-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACTIVE_STATUSES: ConversationStatus[] = [
  "new",
  "in_review",
  "awaiting_client",
];

const vipOptions = [
  { value: "vip", label: "VIP" },
  { value: "non_vip", label: "Non-VIP" },
];

const initialFilters: ClientFilterState = {
  search: "",
  vipStatuses: [],
  dateFrom: null,
  dateTo: null,
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
    filters.vipStatuses.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.activeOnly ? 1 : 0);

  const totalSpend = clientRows.reduce((sum, c) => sum + c.totalSpend, 0);
  const vipCount = clientRows.filter((c) => c.isVip).length;
  const activeCount = clientRows.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clients</h1>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Clients"
          value={clientRows.length}
          icon={Users}
        />
        <KpiCard label="VIP Clients" value={vipCount} icon={Crown} />
        <KpiCard label="Active Clients" value={activeCount} icon={Activity} />
        <KpiCard
          label="Total Spend"
          value={formatCurrency(totalSpend)}
          icon={PoundSterling}
        />
      </div>

      <FilterBar
        onReset={() => setFilters(initialFilters)}
        activeCount={activeFilterCount}
      >
        <SearchInput
          value={filters.search}
          onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          placeholder="Search clients..."
        />
        <StatusFilter
          values={filters.vipStatuses}
          onChange={(vipStatuses) =>
            setFilters((prev) => ({ ...prev, vipStatuses }))
          }
          options={vipOptions}
        />
        <DateRangePicker
          from={filters.dateFrom ?? undefined}
          to={filters.dateTo ?? undefined}
          onSelect={(range) =>
            setFilters((prev) => ({
              ...prev,
              dateFrom: range.from ?? null,
              dateTo: range.to ?? null,
            }))
          }
        />
        <Button
          variant="outline"
          size="sm"
          className={cn(
            filters.activeOnly && "bg-accent text-accent-foreground"
          )}
          onClick={() =>
            setFilters((prev) => ({ ...prev, activeOnly: !prev.activeOnly }))
          }
        >
          Active only
        </Button>
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

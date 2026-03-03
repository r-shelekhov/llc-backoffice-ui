import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import type { Client, ClientFilterState, ClientRow } from "@/types";
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
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const initialFilters: ClientFilterState = {
  search: "",
  vipOnly: false,
  activeOnly: false,
};

export function ClientsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [updateCounter, forceUpdate] = useState(0);
  const [filters, setFilters] = useState<ClientFilterState>(initialFilters);

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

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

      const isActive = clientConversations.length > 0;

      return {
        ...client,
        visibleConversationCount: clientConversations.length,
        lastActivityAt,
        isActive,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, updateCounter]);

  const filteredClients = applyClientFilters(clientRows, filters);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.vipOnly ? 1 : 0) +
    (filters.activeOnly ? 1 : 0);

  function handleAdd() {
    setEditingClient(undefined);
    setFormOpen(true);
  }

  function handleEdit(client: Client) {
    setEditingClient(client);
    setFormOpen(true);
  }

  function handleSave(data: {
    name: string;
    email: string;
    phone: string;
    company: string;
    isVip: boolean;
  }) {
    if (editingClient) {
      const idx = clients.findIndex((c) => c.id === editingClient.id);
      if (idx !== -1) {
        clients[idx] = {
          ...clients[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      const initials = data.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase();
      const now = new Date().toISOString();
      clients.push({
        id: `cli-${Date.now()}`,
        ...data,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${initials}`,
        totalConversations: 0,
        totalSpend: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
    setFormOpen(false);
    forceUpdate((n) => n + 1);
  }

  function handleDelete(client: Client) {
    setDeletingClient(client);
  }

  function handleConfirmDelete() {
    if (!deletingClient) return;
    const idx = clients.findIndex((c) => c.id === deletingClient.id);
    if (idx !== -1) {
      clients.splice(idx, 1);
    }
    setDeletingClient(null);
    forceUpdate((n) => n + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentUserRole={currentUser.role}
        />
      )}

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
        onSave={handleSave}
      />

      {deletingClient && (
        <DeleteClientDialog
          open={!!deletingClient}
          onOpenChange={(open) => !open && setDeletingClient(null)}
          client={deletingClient}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

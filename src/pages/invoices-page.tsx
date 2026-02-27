import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { InvoiceFilterState, InvoiceStatus } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { getAllInvoicesWithRelations, bookings } from "@/lib/mock-data";
import { filterInvoicesByPermission, filterVipInvoices } from "@/lib/permissions";
import { applyInvoiceFilters } from "@/lib/filters";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchInput } from "@/components/filters/search-input";
import { StatusFilter } from "@/components/filters/status-filter";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

const initialFilters: InvoiceFilterState = {
  search: "",
  statuses: [],
  dateFrom: null,
  dateTo: null,
};

const statusOptions = Object.entries(INVOICE_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

export function InvoicesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<InvoiceFilterState>(() => {
    const status = searchParams.get("status");
    if (status) {
      return { ...initialFilters, statuses: [status as InvoiceStatus] };
    }
    return initialFilters;
  });

  const allInvoices = getAllInvoicesWithRelations();
  const permittedInvoices = filterVipInvoices(
    currentUser,
    filterInvoicesByPermission(currentUser, allInvoices, bookings)
  );
  const filteredInvoices = applyInvoiceFilters(permittedInvoices, filters);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.statuses.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Invoices</h1>

      <FilterBar
        onReset={() => setFilters(initialFilters)}
        activeCount={activeFilterCount}
      >
        <SearchInput
          value={filters.search}
          onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          placeholder="Search invoices..."
        />
        <StatusFilter
          values={filters.statuses}
          onChange={(statuses) =>
            setFilters((prev) => ({
              ...prev,
              statuses: statuses as InvoiceStatus[],
            }))
          }
          options={statusOptions}
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
      </FilterBar>

      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <InvoiceTable
          invoices={filteredInvoices}
          onSelect={(invoice) => navigate(`/invoices/${invoice.id}`)}
        />
      )}
    </div>
  );
}

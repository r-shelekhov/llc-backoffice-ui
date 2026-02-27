import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PaymentFilterState, PaymentStatus } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import {
  getAllPaymentsWithRelations,
  invoices,
  bookings,
} from "@/lib/mock-data";
import { filterPaymentsByPermission } from "@/lib/permissions";
import { applyPaymentFilters } from "@/lib/filters";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchInput } from "@/components/filters/search-input";
import { StatusFilter } from "@/components/filters/status-filter";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { PaymentTable } from "@/components/payments/payment-table";
import { EmptyState } from "@/components/shared/empty-state";
import { CreditCard } from "lucide-react";

const initialFilters: PaymentFilterState = {
  search: "",
  statuses: [],
  dateFrom: null,
  dateTo: null,
};

const statusOptions = Object.entries(PAYMENT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

export function PaymentsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PaymentFilterState>(initialFilters);

  const allPayments = getAllPaymentsWithRelations();
  const permittedPayments = filterPaymentsByPermission(
    currentUser,
    allPayments,
    invoices,
    bookings
  );
  const filteredPayments = applyPaymentFilters(permittedPayments, filters);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.statuses.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Payments</h1>

      <FilterBar
        onReset={() => setFilters(initialFilters)}
        activeCount={activeFilterCount}
      >
        <SearchInput
          value={filters.search}
          onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          placeholder="Search payments..."
        />
        <StatusFilter
          values={filters.statuses}
          onChange={(statuses) =>
            setFilters((prev) => ({
              ...prev,
              statuses: statuses as PaymentStatus[],
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

      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <PaymentTable
          payments={filteredPayments}
          onSelect={(payment) => navigate(`/invoices/${payment.invoiceId}`, { state: { from: "payment" } })}
        />
      )}
    </div>
  );
}

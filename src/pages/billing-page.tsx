import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, AlertTriangle, FileText, PoundSterling } from "lucide-react";
import type { InvoiceFilterState, InvoiceStatus } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { getAllInvoicesWithRelations, bookings } from "@/lib/mock-data";
import { filterInvoicesByPermission, filterVipInvoices } from "@/lib/permissions";
import { applyInvoiceFilters } from "@/lib/filters";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchInput } from "@/components/filters/search-input";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { BillingStatusTabs } from "@/components/billing/billing-status-tabs";

const STATUS_TABS: (InvoiceStatus | null)[] = [
  null, "draft", "sent", "paid", "overdue", "cancelled",
];

const initialFilters: InvoiceFilterState = {
  search: "",
  statuses: [],
  dateFrom: null,
  dateTo: null,
};

export function BillingPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const statusParam = searchParams.get("status");
  const filterParam = searchParams.get("filter");

  const [filters, setFilters] = useState<InvoiceFilterState>(() => {
    if (statusParam) {
      return { ...initialFilters, statuses: [statusParam as InvoiceStatus] };
    }
    return initialFilters;
  });
  const [paymentIssuesOnly, setPaymentIssuesOnly] = useState(
    filterParam === "payment-issues",
  );

  // Data — InvoiceWithRelations includes payments[], so no separate payment fetch needed
  const allInvoices = getAllInvoicesWithRelations();
  const permittedInvoices = filterVipInvoices(
    currentUser,
    filterInvoicesByPermission(currentUser, allInvoices, bookings),
  );

  // Apply payment-issues filter before standard filters
  const baseInvoices = paymentIssuesOnly
    ? permittedInvoices.filter((i) =>
        i.payments.some((p) => p.status === "failed" || p.status === "pending"),
      )
    : permittedInvoices;
  const filteredInvoices = applyInvoiceFilters(baseInvoices, filters);

  const TERMINAL_STATUSES: InvoiceStatus[] = ["paid", "cancelled"];
  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort((a, b) => {
      const aTerminal = TERMINAL_STATUSES.includes(a.status) ? 1 : 0;
      const bTerminal = TERMINAL_STATUSES.includes(b.status) ? 1 : 0;
      return aTerminal - bTerminal;
    });
  }, [filteredInvoices]);

  // KPI stats (computed from full permitted set, before any filters)
  const kpiStats = useMemo(() => {
    const outstanding = permittedInvoices.filter(
      (i) => i.status === "sent" || i.status === "overdue",
    );
    const overdue = permittedInvoices.filter((i) => i.status === "overdue");
    const withIssues = permittedInvoices.filter((i) =>
      i.payments.some((p) => p.status === "failed" || p.status === "pending"),
    );

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const collectedMtd = permittedInvoices
      .flatMap((i) => i.payments)
      .filter(
        (p) =>
          p.status === "succeeded" &&
          p.processedAt &&
          new Date(p.processedAt) >= monthStart,
      )
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      outstandingCount: outstanding.length,
      outstandingTotal: outstanding.reduce((sum, i) => sum + i.total, 0),
      overdueCount: overdue.length,
      overdueTotal: overdue.reduce((sum, i) => sum + i.total, 0),
      issueCount: withIssues.length,
      collectedMtd,
    };
  }, [permittedInvoices]);

  // Status tab derived from filter state
  const activeStatusTab: InvoiceStatus | null =
    filters.statuses.length === 1 ? filters.statuses[0] : null;

  function handleStatusTabChange(status: InvoiceStatus | null) {
    setPaymentIssuesOnly(false);
    setFilters((prev) => ({ ...prev, statuses: status ? [status] : [] }));
  }

  function handleOutstandingClick() {
    setPaymentIssuesOnly(false);
    setFilters((prev) => ({ ...prev, statuses: ["sent", "overdue"] }));
  }

  function handleOverdueClick() {
    setPaymentIssuesOnly(false);
    setFilters((prev) => ({ ...prev, statuses: ["overdue"] }));
  }

  function handlePaymentIssuesClick() {
    setPaymentIssuesOnly(true);
    setFilters((prev) => ({ ...prev, statuses: [] }));
  }

  function handleReset() {
    setPaymentIssuesOnly(false);
    setFilters(initialFilters);
  }

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (paymentIssuesOnly ? 1 : 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Billing</h1>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Outstanding"
          value={`${kpiStats.outstandingCount} · ${formatCurrency(kpiStats.outstandingTotal)}`}
          icon={FileText}
          onClick={handleOutstandingClick}
        />
        <KpiCard
          label="Overdue"
          value={`${kpiStats.overdueCount} · ${formatCurrency(kpiStats.overdueTotal)}`}
          icon={AlertCircle}
          onClick={handleOverdueClick}
        />
        <KpiCard
          label="Payment Issues"
          value={kpiStats.issueCount}
          icon={AlertTriangle}
          onClick={handlePaymentIssuesClick}
        />
        <KpiCard
          label="Collected (MTD)"
          value={formatCurrency(kpiStats.collectedMtd)}
          icon={PoundSterling}
        />
      </div>

      <BillingStatusTabs
        items={permittedInvoices}
        statuses={STATUS_TABS}
        labels={INVOICE_STATUS_LABELS}
        activeStatus={activeStatusTab}
        onStatusChange={handleStatusTabChange}
      />

      <FilterBar onReset={handleReset} activeCount={activeFilterCount}>
        <SearchInput
          value={filters.search}
          onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          placeholder="Search invoices..."
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

      {sortedInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <InvoiceTable
          invoices={sortedInvoices}
          onSelect={(invoice) => navigate(`/billing/${invoice.id}`)}
        />
      )}
    </div>
  );
}

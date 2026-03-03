import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Calendar, PoundSterling, Clock, Check, ChevronDown } from "lucide-react";
import type { BookingFilterState, BookingStatus, PaymentMethod } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { getAllBookingsWithRelations, bookings, invoices, payments, clients } from "@/lib/mock-data";
import { filterBookingsByPermission, filterVipBookings } from "@/lib/permissions";
import { applyBookingFilters } from "@/lib/filters";
import { BOOKING_STATUS_TRANSITIONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchInput } from "@/components/filters/search-input";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { BookingTable } from "@/components/bookings/booking-table";
import { BookingStatusTabs } from "@/components/bookings/booking-status-tabs";
import { ConfirmPaymentDialog } from "@/components/bookings/confirm-payment-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/dashboard/kpi-card";

const TERMINAL_STATUSES: BookingStatus[] = ["completed", "cancelled"];

export function BookingsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialClientId = searchParams.get("clientId");
  const [filters, setFilters] = useState<BookingFilterState>({
    search: "",
    statuses: [],
    clientId: initialClientId,
    dateFrom: null,
    dateTo: null,
  });
  const [clientOpen, setClientOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const [paymentDialogBooking, setPaymentDialogBooking] = useState<{
    bookingId: string;
    invoiceId: string;
    invoiceTotal: number;
  } | null>(null);

  const allBookings = getAllBookingsWithRelations();
  const permittedBookings = filterVipBookings(
    currentUser,
    filterBookingsByPermission(currentUser, allBookings)
  );
  const filteredBookings = applyBookingFilters(permittedBookings, filters);

  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      const aTerminal = TERMINAL_STATUSES.includes(a.status) ? 1 : 0;
      const bTerminal = TERMINAL_STATUSES.includes(b.status) ? 1 : 0;
      return aTerminal - bTerminal;
    });
  }, [filteredBookings]);

  // KPI stats computed from permittedBookings (before filters)
  const kpiStats = useMemo(() => {
    const draft = permittedBookings.filter((b) => b.status === "draft");
    const awaiting = permittedBookings.filter((b) => b.status === "awaiting_payment");
    const awaitingTotal = awaiting.reduce((sum, b) => sum + b.price, 0);
    const scheduled = permittedBookings.filter((b) => b.status === "scheduled");
    const pipelineValue = permittedBookings
      .filter((b) => !TERMINAL_STATUSES.includes(b.status))
      .reduce((sum, b) => sum + b.price, 0);

    return {
      draftCount: draft.length,
      awaitingCount: awaiting.length,
      awaitingTotal,
      scheduledCount: scheduled.length,
      pipelineValue,
    };
  }, [permittedBookings]);

  // Derive active tab from filter state
  const activeStatusTab: BookingStatus | null =
    filters.statuses.length === 1 ? filters.statuses[0] : null;

  function handleTabChange(status: BookingStatus | null) {
    setFilters((prev) => ({
      ...prev,
      statuses: status ? [status] : [],
    }));
  }

  function handleStatusChange(bookingId: string, newStatus: BookingStatus) {
    const bookingRef = bookings.find((b) => b.id === bookingId);
    if (!bookingRef) return;

    const allowed = BOOKING_STATUS_TRANSITIONS[bookingRef.status];
    if (!allowed.includes(newStatus)) return;

    // Guard: draft → awaiting_payment requires sent invoice
    if (bookingRef.status === "draft" && newStatus === "awaiting_payment") {
      const hasSentInvoice = invoices
        .filter((i) => i.bookingId === bookingId)
        .some((i) => i.status === "sent");
      if (!hasSentInvoice) return;
    }

    // awaiting_payment → paid opens payment dialog
    if (bookingRef.status === "awaiting_payment" && newStatus === "paid") {
      const sentInvoice = invoices.find(
        (i) => i.bookingId === bookingId && i.status === "sent"
      );
      const invoice = sentInvoice ?? invoices.find((i) => i.bookingId === bookingId);
      if (!invoice) return;
      setPaymentDialogBooking({
        bookingId,
        invoiceId: invoice.id,
        invoiceTotal: invoice.total,
      });
      return;
    }

    bookingRef.status = newStatus;
    bookingRef.updatedAt = new Date().toISOString();

    // Auto-schedule: paid → scheduled when manager + execution date set
    if (
      bookingRef.status === "paid" &&
      bookingRef.managerId !== null &&
      bookingRef.executionAt !== ""
    ) {
      bookingRef.status = "scheduled";
    }

    forceUpdate((n) => n + 1);
  }

  function handleConfirmPayment(method: PaymentMethod) {
    if (!paymentDialogBooking) return;
    const { bookingId, invoiceId, invoiceTotal } = paymentDialogBooking;
    const now = new Date().toISOString();

    payments.push({
      id: `pay-${payments.length + 1}`,
      invoiceId,
      clientId: bookings.find((b) => b.id === bookingId)!.clientId,
      amount: invoiceTotal,
      method,
      status: "succeeded",
      processedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const invoiceRef = invoices.find((i) => i.id === invoiceId);
    if (invoiceRef) {
      invoiceRef.status = "paid";
      invoiceRef.paidAt = now;
      invoiceRef.updatedAt = now;
    }

    const bookingRef = bookings.find((b) => b.id === bookingId);
    if (bookingRef) {
      bookingRef.status = "paid";
      bookingRef.updatedAt = now;
      if (bookingRef.managerId !== null && bookingRef.executionAt !== "") {
        bookingRef.status = "scheduled";
      }
    }

    setPaymentDialogBooking(null);
    forceUpdate((n) => n + 1);
  }

  function handleCreateInvoice(booking: typeof permittedBookings[number]) {
    const bookingRef = bookings.find((b) => b.id === booking.id);
    if (!bookingRef) return;

    const subtotal = bookingRef.price;
    const taxRate = 10;
    const taxAmount = Math.round(subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    invoices.push({
      id: `inv-${Date.now()}`,
      bookingId: bookingRef.id,
      clientId: bookingRef.clientId,
      status: "draft",
      lineItems: [{ description: booking.title, quantity: 1, unitPrice: subtotal }],
      subtotal,
      taxRate,
      taxAmount,
      total,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    forceUpdate((n) => n + 1);
  }

  function handleSendInvoice(booking: typeof permittedBookings[number]) {
    const draftInvoice = invoices.find(
      (i) => i.bookingId === booking.id && i.status === "draft"
    );
    if (!draftInvoice) return;

    draftInvoice.status = "sent";
    draftInvoice.updatedAt = new Date().toISOString();

    const bookingRef = bookings.find((b) => b.id === booking.id);
    if (bookingRef) {
      bookingRef.status = "awaiting_payment";
      bookingRef.updatedAt = new Date().toISOString();
    }

    forceUpdate((n) => n + 1);
  }

  function handleConfirmPaymentFromTable(booking: typeof permittedBookings[number]) {
    const sentInvoice = booking.invoices.find((i) => i.status === "sent");
    const invoice = sentInvoice ?? booking.invoices[0];
    if (!invoice) return;
    setPaymentDialogBooking({
      bookingId: booking.id,
      invoiceId: invoice.id,
      invoiceTotal: invoice.total,
    });
  }

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));

  function handleClientSelect(id: string | null) {
    setFilters((prev) => ({ ...prev, clientId: id }));
    setSearchParams((prev) => {
      if (id) {
        prev.set("clientId", id);
      } else {
        prev.delete("clientId");
      }
      return prev;
    });
  }

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.clientId ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="space-y-6">
      {filters.clientId && (
        <Button variant="ghost" size="sm" className="-ml-2 h-7 text-xs" asChild>
          <Link to={`/clients/${filters.clientId}`}>
            <ArrowLeft className="size-3.5" />
            Back to {clientOptions.find((c) => c.value === filters.clientId)?.label ?? "Client"}
          </Link>
        </Button>
      )}
      <h1 className="text-2xl font-semibold">Bookings</h1>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Needs Action"
          value={kpiStats.draftCount}
          icon={AlertCircle}
          onClick={() => handleTabChange("draft")}
        />
        <KpiCard
          label="Awaiting Payment"
          value={`${kpiStats.awaitingCount} · ${formatCurrency(kpiStats.awaitingTotal)}`}
          icon={Clock}
          onClick={() => handleTabChange("awaiting_payment")}
        />
        <KpiCard
          label="Scheduled"
          value={kpiStats.scheduledCount}
          icon={Calendar}
          onClick={() => handleTabChange("scheduled")}
        />
        <KpiCard
          label="Pipeline Value"
          value={formatCurrency(kpiStats.pipelineValue)}
          icon={PoundSterling}
        />
      </div>

      <BookingStatusTabs
        bookings={permittedBookings}
        activeStatus={activeStatusTab}
        onStatusChange={handleTabChange}
      />

      <FilterBar
        onReset={() => {
          setFilters({ search: "", statuses: [], clientId: null, dateFrom: null, dateTo: null });
          setSearchParams((prev) => { prev.delete("clientId"); return prev; });
        }}
        activeCount={activeFilterCount}
      >
        <SearchInput
          value={filters.search}
          onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          placeholder="Search bookings..."
        />
        <Popover open={clientOpen} onOpenChange={setClientOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "justify-between font-normal",
                filters.clientId && "border-primary/50 bg-primary/5"
              )}
            >
              {filters.clientId
                ? clientOptions.find((c) => c.value === filters.clientId)?.label ?? "Client"
                : "Client"}
              <ChevronDown className="size-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search clients..." />
              <CommandList>
                <CommandEmpty>No clients found.</CommandEmpty>
                <CommandGroup>
                  {clientOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        handleClientSelect(
                          filters.clientId === option.value ? null : option.value
                        );
                        setClientOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "size-4",
                          filters.clientId === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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

      {sortedBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <BookingTable
          bookings={sortedBookings}
          onSelect={(booking) => navigate(`/bookings/${booking.id}`)}
          onStatusChange={handleStatusChange}
          onConfirmPayment={handleConfirmPaymentFromTable}
          onCreateInvoice={handleCreateInvoice}
          onSendInvoice={handleSendInvoice}
        />
      )}

      {paymentDialogBooking && (
        <ConfirmPaymentDialog
          open={!!paymentDialogBooking}
          onOpenChange={(open) => { if (!open) setPaymentDialogBooking(null); }}
          invoiceTotal={paymentDialogBooking.invoiceTotal}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
}

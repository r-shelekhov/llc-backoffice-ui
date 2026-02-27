import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BookingFilterState, BookingStatus } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { getAllBookingsWithRelations } from "@/lib/mock-data";
import { filterBookingsByPermission, filterVipBookings } from "@/lib/permissions";
import { applyBookingFilters } from "@/lib/filters";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchInput } from "@/components/filters/search-input";
import { StatusFilter } from "@/components/filters/status-filter";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { BookingTable } from "@/components/bookings/booking-table";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarCheck } from "lucide-react";

const initialFilters: BookingFilterState = {
  search: "",
  statuses: [],
  dateFrom: null,
  dateTo: null,
};

const statusOptions = Object.entries(BOOKING_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

export function BookingsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<BookingFilterState>(initialFilters);

  const allBookings = getAllBookingsWithRelations();
  const permittedBookings = filterVipBookings(
    currentUser,
    filterBookingsByPermission(currentUser, allBookings)
  );
  const filteredBookings = applyBookingFilters(permittedBookings, filters);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.statuses.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Bookings</h1>

      <FilterBar
        onReset={() => setFilters(initialFilters)}
        activeCount={activeFilterCount}
      >
        <SearchInput
          value={filters.search}
          onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          placeholder="Search bookings..."
        />
        <StatusFilter
          values={filters.statuses}
          onChange={(statuses) =>
            setFilters((prev) => ({
              ...prev,
              statuses: statuses as BookingStatus[],
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

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <BookingTable
          bookings={filteredBookings}
          onSelect={(booking) => navigate(`/bookings/${booking.id}`)}
        />
      )}
    </div>
  );
}

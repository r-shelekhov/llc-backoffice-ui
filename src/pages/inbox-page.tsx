import { useMemo } from "react";
import { Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFilters } from "@/hooks/use-filters";
import { getAllRequestsWithRelations } from "@/lib/mock-data";
import { filterRequestsByPermission } from "@/lib/permissions";
import { applyRequestFilters } from "@/lib/filters";
import { REQUEST_STATUS_LABELS, CHANNEL_LABELS } from "@/lib/constants";
import type { RequestStatus, Channel } from "@/types";
import { RequestTable } from "@/components/requests/request-table";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchInput } from "@/components/filters/search-input";
import { StatusFilter } from "@/components/filters/status-filter";
import { ChannelFilter } from "@/components/filters/channel-filter";
import { AssigneeFilter } from "@/components/filters/assignee-filter";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusOptions = Object.entries(REQUEST_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

const channelOptions = Object.entries(CHANNEL_LABELS).map(
  ([value, label]) => ({ value, label })
);

export function InboxPage() {
  const { currentUser, allUsers } = useAuth();
  const { filters, dispatch, activeCount } = useFilters();

  const allRequests = useMemo(() => getAllRequestsWithRelations(), []);

  const permittedRequests = useMemo(() => {
    const filtered = filterRequestsByPermission(currentUser, allRequests);
    return allRequests.filter((r) => filtered.some((f) => f.id === r.id));
  }, [currentUser, allRequests]);

  const filteredRequests = useMemo(
    () => applyRequestFilters(permittedRequests, filters),
    [permittedRequests, filters]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inbox</h1>

      <FilterBar
        activeCount={activeCount}
        onReset={() => dispatch({ type: "RESET" })}
      >
        <SearchInput
          value={filters.search}
          onChange={(value) =>
            dispatch({ type: "SET_SEARCH", payload: value })
          }
          placeholder="Search requests..."
        />
        <StatusFilter
          values={filters.statuses}
          onChange={(values) =>
            dispatch({
              type: "SET_STATUSES",
              payload: values as RequestStatus[],
            })
          }
          options={statusOptions}
        />
        <ChannelFilter
          values={filters.channels}
          onChange={(values) =>
            dispatch({
              type: "SET_CHANNELS",
              payload: values as Channel[],
            })
          }
          options={channelOptions}
        />
        <AssigneeFilter
          values={filters.assigneeIds}
          onChange={(values) =>
            dispatch({ type: "SET_ASSIGNEES", payload: values })
          }
          users={allUsers}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            dispatch({ type: "SET_VIP_ONLY", payload: !filters.vipOnly })
          }
          className={cn(
            "gap-1.5",
            filters.vipOnly &&
              "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
          )}
        >
          <Crown className="size-3.5" />
          VIP Only
        </Button>
        <DateRangePicker
          from={filters.dateFrom ?? undefined}
          to={filters.dateTo ?? undefined}
          onSelect={(range) =>
            dispatch({
              type: "SET_DATE_RANGE",
              payload: { from: range.from ?? null, to: range.to ?? null },
            })
          }
        />
      </FilterBar>

      {filteredRequests.length > 0 ? (
        <RequestTable requests={filteredRequests} />
      ) : (
        <EmptyState
          title="No requests found"
          description="Try adjusting your filters"
        />
      )}
    </div>
  );
}

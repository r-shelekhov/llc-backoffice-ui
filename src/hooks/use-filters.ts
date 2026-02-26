import { useReducer, useMemo } from "react";
import type { FilterState, RequestStatus, Channel, SlaState } from "@/types";

type FilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_STATUSES"; payload: RequestStatus[] }
  | { type: "SET_CHANNELS"; payload: Channel[] }
  | { type: "SET_ASSIGNEES"; payload: string[] }
  | { type: "SET_DATE_RANGE"; payload: { from: Date | null; to: Date | null } }
  | { type: "SET_VIP_ONLY"; payload: boolean }
  | { type: "SET_SLA_STATES"; payload: SlaState[] }
  | { type: "RESET" };

const initialState: FilterState = {
  search: "",
  statuses: [],
  channels: [],
  assigneeIds: [],
  dateFrom: null,
  dateTo: null,
  vipOnly: false,
  slaStates: [],
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_STATUSES":
      return { ...state, statuses: action.payload };
    case "SET_CHANNELS":
      return { ...state, channels: action.payload };
    case "SET_ASSIGNEES":
      return { ...state, assigneeIds: action.payload };
    case "SET_DATE_RANGE":
      return { ...state, dateFrom: action.payload.from, dateTo: action.payload.to };
    case "SET_VIP_ONLY":
      return { ...state, vipOnly: action.payload };
    case "SET_SLA_STATES":
      return { ...state, slaStates: action.payload };
    case "RESET":
      return initialState;
  }
}

export function useFilters() {
  const [filters, dispatch] = useReducer(filterReducer, initialState);

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.channels.length > 0) count++;
    if (filters.assigneeIds.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.vipOnly) count++;
    if (filters.slaStates.length > 0) count++;
    return count;
  }, [filters]);

  return { filters, dispatch, activeCount };
}

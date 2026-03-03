import { useReducer, useMemo } from "react";
import type { ConversationFilterState, Channel, SlaState } from "@/types";

type FilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_CHANNELS"; payload: Channel[] }
  | { type: "SET_MANAGERS"; payload: string[] }
  | { type: "SET_DATE_RANGE"; payload: { from: Date | null; to: Date | null } }
  | { type: "SET_VIP_ONLY"; payload: boolean }
  | { type: "SET_SLA_STATES"; payload: SlaState[] }
  | { type: "RESET" };

const initialState: ConversationFilterState = {
  search: "",
  channels: [],
  managerIds: [],
  dateFrom: null,
  dateTo: null,
  vipOnly: false,
  slaStates: [],
};

function filterReducer(state: ConversationFilterState, action: FilterAction): ConversationFilterState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_CHANNELS":
      return { ...state, channels: action.payload };
    case "SET_MANAGERS":
      return { ...state, managerIds: action.payload };
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
    if (filters.channels.length > 0) count++;
    if (filters.managerIds.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.vipOnly) count++;
    if (filters.slaStates.length > 0) count++;
    return count;
  }, [filters]);

  return { filters, dispatch, activeCount };
}

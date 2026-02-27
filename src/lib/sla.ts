import type { SlaState } from "@/types";

export function computeSlaState(status: string, slaDueAt: string): SlaState {
  if (status === "converted" || status === "closed") {
    return "on_track";
  }

  const now = new Date();
  const dueDate = new Date(slaDueAt);
  const twoHoursMs = 2 * 60 * 60 * 1000;

  if (dueDate.getTime() < now.getTime()) {
    return "breached";
  }

  if (dueDate.getTime() - now.getTime() <= twoHoursMs) {
    return "at_risk";
  }

  return "on_track";
}

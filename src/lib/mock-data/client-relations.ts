import type { ClientRelation } from "@/types";

export const clientRelations: ClientRelation[] = [
  {
    id: "rel-1",
    clientIdA: "cli-1",
    clientIdB: "cli-5",
    type: "colleague",
    createdAt: "2025-06-15T10:00:00Z",
  },
  {
    id: "rel-2",
    clientIdA: "cli-2",
    clientIdB: "cli-10",
    type: "family",
    createdAt: "2025-08-01T12:00:00Z",
  },
  {
    id: "rel-3",
    clientIdA: "cli-3",
    clientIdB: "cli-6",
    type: "pa_assistant",
    createdAt: "2025-09-10T09:00:00Z",
  },
];

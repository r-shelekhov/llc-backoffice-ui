import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useAuth } from "@/hooks/use-auth";
import { conversations, clients } from "@/lib/mock-data";
import { CONVERSATION_STATUS_LABELS, CONVERSATION_STATUS_COLORS } from "@/lib/constants";
import type { ConversationStatus } from "@/types";

export function DashboardPage() {
  const { currentUser } = useAuth();

  const isPrivileged = currentUser.role === "admin" || currentUser.role === "vip_manager";
  const vipClientIds = new Set(clients.filter((c) => c.isVip).map((c) => c.id));

  const filteredConversations = isPrivileged
    ? conversations
    : conversations.filter(
        (c) => !vipClientIds.has(c.clientId) && c.assigneeId === currentUser.id
      );

  const statusCounts = filteredConversations.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const allStatuses = Object.keys(CONVERSATION_STATUS_LABELS) as ConversationStatus[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <KpiGrid />
      <div className="grid grid-cols-2 gap-6">
        <RecentActivity />
        <Card>
          <CardHeader>
            <CardTitle>Conversation Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allStatuses.map((status) => {
              const colorClass = CONVERSATION_STATUS_COLORS[status];
              const label = CONVERSATION_STATUS_LABELS[status];
              const count = statusCounts[status] || 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2.5 rounded-full ${colorClass.split(" ")[0]}`}
                    />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

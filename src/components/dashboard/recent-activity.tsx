import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { communications, conversations, clients } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/format";

const BORDER_COLORS: Record<string, string> = {
  client: "border-l-blue-500",
  agent: "border-l-purple-500",
  system: "border-l-gray-400",
};

export function RecentActivity() {
  const { currentUser } = useAuth();

  const isPrivileged = currentUser.role === "admin" || currentUser.role === "vip_manager";
  const vipClientIds = new Set(clients.filter((c) => c.isVip).map((c) => c.id));

  const permittedConversationIds = new Set(
    isPrivileged
      ? conversations.map((c) => c.id)
      : conversations
          .filter((c) => !vipClientIds.has(c.clientId) && c.assigneeId === currentUser.id)
          .map((c) => c.id)
  );

  const recentComms = [...communications]
    .filter((c) => permittedConversationIds.has(c.conversationId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentComms.map((comm) => {
          const conversation = conversations.find((c) => c.id === comm.conversationId);
          return (
            <div
              key={comm.id}
              className={`border-l-2 pl-3 py-1 ${BORDER_COLORS[comm.sender] ?? "border-l-gray-400"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{comm.senderName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(comm.createdAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{comm.message}</p>
              {conversation && (
                <span className="text-xs text-muted-foreground">({conversation.title})</span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

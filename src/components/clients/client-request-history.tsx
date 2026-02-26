import type { RequestWithRelations } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestTable } from "@/components/requests/request-table";

interface ClientRequestHistoryProps {
  requests: RequestWithRelations[];
}

export function ClientRequestHistory({ requests }: ClientRequestHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request History</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests found</p>
        ) : (
          <RequestTable requests={requests} />
        )}
      </CardContent>
    </Card>
  );
}

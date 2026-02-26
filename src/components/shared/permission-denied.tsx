import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Lock className="size-12 text-muted-foreground/50 mb-4" />
      <h2 className="text-lg font-medium">
        You don't have permission to view this page
      </h2>
      <Button variant="link" asChild className="mt-2">
        <Link to="/inbox">Go to Inbox</Link>
      </Button>
    </div>
  );
}

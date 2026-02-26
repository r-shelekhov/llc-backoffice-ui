import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VipIndicator() {
  return (
    <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700">
      <Crown className="size-3" />
      VIP
    </Badge>
  );
}

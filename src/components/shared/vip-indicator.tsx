import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VipIndicator() {
  return (
    <Badge variant="outline" className="gap-1 border-tone-vip-border bg-tone-vip-light text-tone-vip-foreground">
      <Crown className="size-3" />
      VIP
    </Badge>
  );
}

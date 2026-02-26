import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function KpiCard({ label, value, icon: Icon, trend, trendValue }: KpiCardProps) {
  return (
    <Card className="relative">
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
        <div className="mt-2 text-2xl font-bold">{value}</div>
        {trend && trendValue && (
          <div className="mt-1 flex items-center gap-1">
            {trend === "up" && <TrendingUp className="size-3 text-green-600" />}
            {trend === "down" && <TrendingDown className="size-3 text-red-600" />}
            <span
              className={`text-xs ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                    ? "text-red-600"
                    : "text-muted-foreground"
              }`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

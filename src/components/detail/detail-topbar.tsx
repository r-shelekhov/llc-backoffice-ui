import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailTopBarProps {
  backTo: string;
  backLabel: string;
  title: ReactNode;
  subtitle?: ReactNode;
  statusBadge: ReactNode;
  actions?: ReactNode;
  infoStrip?: ReactNode;
}

export function DetailTopBar({
  backTo,
  backLabel,
  title,
  subtitle,
  statusBadge,
  actions,
  infoStrip,
}: DetailTopBarProps) {
  return (
    <div className="mx-auto max-w-[1280px] space-y-2 px-6 py-3">
      <Button variant="ghost" size="sm" className="-ml-2 h-7 text-xs" asChild>
        <Link to={backTo}>
          <ArrowLeft className="size-3.5" />
          {backLabel}
        </Link>
      </Button>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
            {subtitle && (
              <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {statusBadge}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      {infoStrip && <div>{infoStrip}</div>}
    </div>
  );
}

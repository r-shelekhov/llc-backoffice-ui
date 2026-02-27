import type { ReactNode } from "react";

interface DetailRailCardProps {
  title: string;
  children: ReactNode;
}

export function DetailRailCard({ title, children }: DetailRailCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

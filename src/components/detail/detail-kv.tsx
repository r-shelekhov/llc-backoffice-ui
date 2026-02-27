import type { ReactNode } from "react";

interface DetailKvProps {
  label: string;
  value: ReactNode;
}

export function DetailKv({ label, value }: DetailKvProps) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

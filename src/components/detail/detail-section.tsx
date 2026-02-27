import type { ReactNode } from "react";

interface DetailSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function DetailSection({ title, action, children }: DetailSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

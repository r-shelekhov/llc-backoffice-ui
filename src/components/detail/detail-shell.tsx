import type { ReactNode } from "react";

interface DetailShellProps {
  topBar: ReactNode;
  children: ReactNode;
  rail: ReactNode;
}

export function DetailShell({ topBar, children, rail }: DetailShellProps) {
  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-10 border-b bg-background">{topBar}</div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">{children}</div>
        <div className="lg:sticky lg:top-20 lg:self-start">{rail}</div>
      </div>
    </div>
  );
}

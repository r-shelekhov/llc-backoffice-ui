import type { ReactNode } from "react";
import { MessageSquare } from "lucide-react";

interface InboxLayoutProps {
  left: ReactNode;
  middle: ReactNode | null;
  right: ReactNode | null;
  emptyState?: ReactNode;
}

export function InboxLayout({ left, middle, right, emptyState }: InboxLayoutProps) {
  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r">{left}</div>
      {middle ? (
        <>
          <div className="flex min-w-0 flex-1 flex-col">{middle}</div>
          <div className="w-80 shrink-0 overflow-y-auto border-l">
            {right}
          </div>
        </>
      ) : emptyState ? (
        <div className="flex-1">{emptyState}</div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <MessageSquare className="size-10 opacity-40" />
            <p>Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}

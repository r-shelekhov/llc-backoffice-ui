import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterBarProps {
  children: ReactNode;
  onReset: () => void;
  activeCount: number;
}

export function FilterBar({ children, onReset, activeCount }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {children}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <X className="size-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
}

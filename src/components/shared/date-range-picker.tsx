import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onSelect: (range: { from?: Date; to?: Date }) => void;
}

export function DateRangePicker({ from, to, onSelect }: DateRangePickerProps) {
  const hasRange = from || to;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "justify-start text-left font-normal",
            !hasRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="size-4" />
          {hasRange
            ? `${from ? format(from, "MMM d, yyyy") : "..."} - ${to ? format(to, "MMM d, yyyy") : "..."}`
            : "Pick date range"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={(range) =>
            onSelect({ from: range?.from, to: range?.to })
          }
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

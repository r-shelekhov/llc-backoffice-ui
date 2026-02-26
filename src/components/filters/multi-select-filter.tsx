import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface MultiSelectFilterProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onSelectionChange: (values: string[]) => void;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onSelectionChange,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((v) => v !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  const displayText =
    selected.length === 0
      ? label
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? label
        : `${label} (${selected.length})`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "justify-between font-normal",
            selected.length > 0 && "border-primary/50 bg-primary/5"
          )}
        >
          {displayText}
          <ChevronsUpDown className="size-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleToggle(option.value)}
                >
                  <Check
                    className={cn(
                      "size-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

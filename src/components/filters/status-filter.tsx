import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface StatusFilterProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: { value: string; label: string }[];
}

export function StatusFilter({ values, onChange, options }: StatusFilterProps) {
  function handleToggle(optionValue: string, checked: boolean) {
    if (checked) {
      onChange([...values, optionValue]);
    } else {
      onChange(values.filter((v) => v !== optionValue));
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          Status
          {values.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {values.length}
            </Badge>
          )}
          <ChevronDown className="size-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-2">
        <div className="flex flex-col gap-1">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Checkbox
                checked={values.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleToggle(option.value, checked === true)
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

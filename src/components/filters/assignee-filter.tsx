import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface AssigneeFilterProps {
  values: string[];
  onChange: (values: string[]) => void;
  users: { id: string; name: string }[];
}

export function AssigneeFilter({ values, onChange, users }: AssigneeFilterProps) {
  function handleToggle(userId: string, checked: boolean) {
    if (checked) {
      onChange([...values, userId]);
    } else {
      onChange(values.filter((v) => v !== userId));
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          Assignee
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
          {users.map((user) => (
            <label
              key={user.id}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Checkbox
                checked={values.includes(user.id)}
                onCheckedChange={(checked) =>
                  handleToggle(user.id, checked === true)
                }
              />
              {user.name}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LIFECYCLE_AVATAR_COLORS, RELATIONSHIP_TYPE_LABELS } from "@/lib/constants";
import { getInitials } from "@/lib/format";
import type { Client, RelationshipType } from "@/types";
import { ChevronsUpDown } from "lucide-react";

interface AddRelatedClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  excludeClientIds: string[];
  onAdd: (clientId: string, type: RelationshipType) => void;
}

export function AddRelatedClientDialog({
  open,
  onOpenChange,
  clients,
  excludeClientIds,
  onAdd,
}: AddRelatedClientDialogProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [type, setType] = useState<RelationshipType>("colleague");
  const [searchOpen, setSearchOpen] = useState(false);

  const excludeSet = new Set(excludeClientIds);
  const availableClients = clients.filter((c) => !excludeSet.has(c.id));
  const selectedClient = selectedClientId ? clients.find((c) => c.id === selectedClientId) : null;

  const handleSubmit = () => {
    if (!selectedClientId) return;
    onAdd(selectedClientId, type);
    setSelectedClientId(null);
    setType("colleague");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Related Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Client</label>
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  {selectedClient ? selectedClient.name : "Select client..."}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search clients..." />
                  <CommandList>
                    <CommandEmpty>No clients found.</CommandEmpty>
                    <CommandGroup>
                      {availableClients.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.name}
                          onSelect={() => {
                            setSelectedClientId(c.id);
                            setSearchOpen(false);
                          }}
                        >
                          <Avatar className="size-6">
                            <AvatarFallback className={`text-[10px] ${LIFECYCLE_AVATAR_COLORS.client}`}>
                              {getInitials(c.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{c.name}</span>
                          {c.company && (
                            <span className="ml-auto text-xs text-muted-foreground">{c.company}</span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Relationship Type</label>
            <Select value={type} onValueChange={(v) => setType(v as RelationshipType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(RELATIONSHIP_TYPE_LABELS) as [RelationshipType, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedClientId}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

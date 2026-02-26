import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { currentUser, setCurrentUser, allUsers } = useAuth();

  return (
    <header className="fixed top-0 z-10 flex h-14 w-full items-center justify-between border-b bg-white px-6">
      <span className="text-lg font-bold">LLC Car</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full"
            />
            <span>{currentUser.name}</span>
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allUsers.map((user) => (
            <DropdownMenuItem
              key={user.id}
              onSelect={() => setCurrentUser(user)}
            >
              <span>{user.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

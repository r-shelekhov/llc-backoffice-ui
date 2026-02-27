import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  FileText,
  CreditCard,
  Users,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS } from "@/lib/constants";
import { requests } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const actionRequiredCount = requests.filter(
  (r) => r.status === "action_required",
).length;

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

function NavItem({ to, icon: Icon, label, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-muted",
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { currentUser, setCurrentUser, allUsers } = useAuth();

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-white">
      <div className="flex h-14 items-center px-6">
        <span className="text-lg font-bold">LLC Car</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem
          to="/inbox"
          icon={Inbox}
          label="Inbox"
          badge={actionRequiredCount}
        />
        <NavItem to="/invoices" icon={FileText} label="Invoices" />
        <NavItem to="/payments" icon={CreditCard} label="Payments" />

        {currentUser.role === "admin" && (
          <>
            <div className="my-2 border-t" />
            <NavItem to="/admin/users" icon={Users} label="User Management" />
          </>
        )}
      </nav>

      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full"
              />
              <span className="truncate text-sm">{currentUser.name}</span>
              <ChevronDown className="ml-auto size-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
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
      </div>
    </aside>
  );
}

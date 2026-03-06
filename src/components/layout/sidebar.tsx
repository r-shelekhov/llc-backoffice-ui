import { NavLink, useNavigate } from "react-router-dom";
import {
  Inbox,
  UserCheck,
  CalendarCheck,
  Receipt,
  Users,
  Users2,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import llcLogo from "@/assets/llc-logo.svg";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS } from "@/lib/constants";
import { getAllConversationsWithRelations } from "@/lib/mock-data";
import { filterConversationsByPermission, filterVipConversations } from "@/lib/permissions";
import { isConversationUnread } from "@/lib/unread";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            ? "bg-accent text-accent-foreground font-semibold"
            : "text-muted-foreground hover:bg-muted",
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-white">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, allUsers, conversationLastReadAt } = useAuth();

  const permittedConversations = filterVipConversations(
    currentUser,
    filterConversationsByPermission(currentUser, getAllConversationsWithRelations())
  );
  const unreadCount = permittedConversations.filter((conversation) =>
    isConversationUnread(conversation, conversationLastReadAt)
  ).length;

  const myUnreadCount = permittedConversations.filter(
    (conversation) =>
      conversation.managerIds.includes(currentUser.id) &&
      isConversationUnread(conversation, conversationLastReadAt)
  ).length;

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-white">
      <div className="flex h-14 items-center gap-2 px-6">
        <img src={llcLogo} alt="LLC" className="h-7" />
        <span className="text-lg font-bold" style={{ fontFamily: "'Taviraj', serif", color: '#332f2b' }}>LLC</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <NavItem
          to="/inbox"
          icon={Inbox}
          label="Inbox"
          badge={unreadCount}
        />
        <NavItem
          to="/my-queue"
          icon={UserCheck}
          label="My Queue"
          badge={myUnreadCount}
        />
        <NavItem to="/bookings" icon={CalendarCheck} label="Bookings" />
        <NavItem to="/clients" icon={Users2} label="Clients" />
        <NavItem to="/billing" icon={Receipt} label="Billing" />

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
          <DropdownMenuContent side="top" align="start" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-3 py-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{currentUser.email}</span>
                <span className="text-xs font-normal text-muted-foreground">{ROLE_LABELS[currentUser.role]}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/profile")}>
              <User className="mr-2 size-4" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Switch account
            </DropdownMenuLabel>
            {allUsers
              .filter((user) => user.id !== currentUser.id)
              .map((user) => (
                <DropdownMenuItem
                  key={user.id}
                  onSelect={() => setCurrentUser(user)}
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="mr-2 h-6 w-6 rounded-full"
                  />
                  <span>{user.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {ROLE_LABELS[user.role]}
                  </span>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => {}}>
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

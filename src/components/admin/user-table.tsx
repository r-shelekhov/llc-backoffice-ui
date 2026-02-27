import type { User } from "@/types";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserTableProps {
  users: User[];
}

const ROLE_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  vip_manager: "secondary",
  manager: "outline",
};

export function UserTable({ users }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Avatar</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            </TableCell>
            <TableCell className="text-sm font-medium">{user.name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {user.email}
            </TableCell>
            <TableCell>
              <Badge variant={ROLE_BADGE_VARIANTS[user.role] ?? "outline"}>
                {ROLE_LABELS[user.role]}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${
                    user.isActive ? "bg-tone-success" : "bg-tone-neutral"
                  }`}
                />
                <span className="text-sm">
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-sm">
              {formatDate(user.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

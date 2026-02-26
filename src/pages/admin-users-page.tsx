import { RoleGuard } from "@/components/shared/role-guard";
import { UserTable } from "@/components/admin/user-table";
import { users } from "@/lib/mock-data";

export function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <UserTable users={users} />
      </div>
    </RoleGuard>
  );
}

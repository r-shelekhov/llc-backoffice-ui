import { RoleGuard } from "@/components/shared/role-guard";

export function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
      </div>
    </RoleGuard>
  );
}

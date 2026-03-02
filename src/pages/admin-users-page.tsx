import { useState } from "react";
import type { Role, User } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { users } from "@/lib/mock-data";
import { RoleGuard } from "@/components/shared/role-guard";
import { UserTable } from "@/components/admin/user-table";
import { UserFormDialog } from "@/components/admin/user-form-dialog";
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AdminUsersPage() {
  const { currentUser } = useAuth();
  const [, forceUpdate] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  function handleAdd() {
    setEditingUser(undefined);
    setFormOpen(true);
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function handleSave(data: { name: string; email: string; role: Role }) {
    if (editingUser) {
      const idx = users.findIndex((u) => u.id === editingUser.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data, updatedAt: new Date().toISOString() };
      }
    } else {
      const initials = data.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase();
      const now = new Date().toISOString();
      users.push({
        id: `usr-${Date.now()}`,
        ...data,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${initials}`,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
    setFormOpen(false);
    forceUpdate((n) => n + 1);
  }

  function handleToggleActive(user: User) {
    if (user.id === currentUser.id) return;
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        isActive: !users[idx].isActive,
        updatedAt: new Date().toISOString(),
      };
      forceUpdate((n) => n + 1);
    }
  }

  function handleDelete(user: User) {
    if (user.id === currentUser.id) return;
    setDeletingUser(user);
  }

  function handleConfirmDelete() {
    if (!deletingUser) return;
    const idx = users.findIndex((u) => u.id === deletingUser.id);
    if (idx !== -1) {
      users.splice(idx, 1);
    }
    setDeletingUser(null);
    forceUpdate((n) => n + 1);
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">User Management</h1>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <UserTable
          users={users}
          currentUserId={currentUser.id}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />

        <UserFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          user={editingUser}
          onSave={handleSave}
          currentUserId={currentUser.id}
        />

        {deletingUser && (
          <DeleteUserDialog
            open={!!deletingUser}
            onOpenChange={(open) => !open && setDeletingUser(null)}
            user={deletingUser}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </RoleGuard>
  );
}

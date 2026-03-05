import { useEffect, useState } from "react";
import type { Role } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { users } from "@/lib/mock-data";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";

export function ProfilePage() {
  const { currentUser, setCurrentUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Profile</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-16 w-16 rounded-full"
            />
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{currentUser.name}</h2>
              <Badge variant="secondary">{ROLE_LABELS[currentUser.role]}</Badge>
            </div>
          </div>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Email
              </dt>
              <dd className="text-sm">{currentUser.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Member since
              </dt>
              <dd className="text-sm">{formatDate(currentUser.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Last updated
              </dt>
              <dd className="text-sm">{formatDate(currentUser.updatedAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={currentUser}
        onSave={(data) => {
          const initials = data.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase();
          const idx = users.findIndex((u) => u.id === currentUser.id);
          if (idx !== -1) {
            users[idx] = {
              ...users[idx],
              name: data.name,
              email: data.email,
              role: data.role,
              avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${initials}`,
              updatedAt: new Date().toISOString(),
            };
            setCurrentUser(users[idx]);
          }
          setEditOpen(false);
        }}
      />
    </div>
  );
}

function EditProfileDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { name: string; email: string; role: Role };
  onSave: (data: { name: string; email: string; role: Role }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(user.role);

  const isAdmin = user.role === "admin";

  useEffect(() => {
    if (open) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [open, user]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({ name: name.trim(), email: email.trim(), role });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Email</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Role</span>
            {isAdmin ? (
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ROLE_LABELS) as [Role, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            ) : (
              <>
                <p className="text-sm">{ROLE_LABELS[user.role]}</p>
                <p className="text-xs text-muted-foreground">
                  Role can only be changed by an admin.
                </p>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !email.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import type { Client } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSave: (data: {
    name: string;
    email?: string;
    phone?: string;
    company: string;
    isVip: boolean;
    birthday?: string;
  }) => void;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSave,
}: ClientFormDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [birthday, setBirthday] = useState("");

  const isEdit = !!client;

  useEffect(() => {
    if (open) {
      setName(client?.name ?? "");
      setEmail(client?.email ?? "");
      setPhone(client?.phone ?? "");
      setCompany(client?.company ?? "");
      setIsVip(client?.isVip ?? false);
      setBirthday(client?.birthday ?? "");
    }
  }, [open, client]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;
    onSave({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      company: company.trim(),
      isVip,
      birthday: birthday || undefined,
    });
  }

  const isValid = !!name.trim() && !!company.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Client" : "Add Client"}</DialogTitle>
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
              placeholder="client@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Phone</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Birthday</span>
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Company</span>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isVip}
              onCheckedChange={(checked) => setIsVip(checked === true)}
            />
            VIP Client
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              {isEdit ? "Save Changes" : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

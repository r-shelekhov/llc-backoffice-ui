import { useState } from "react";
import type { PaymentMethod } from "@/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConfirmPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceTotal: number;
  onConfirm: (method: PaymentMethod) => void;
}

export function ConfirmPaymentDialog({
  open,
  onOpenChange,
  invoiceTotal,
  onConfirm,
}: ConfirmPaymentDialogProps) {
  const [method, setMethod] = useState<PaymentMethod | "">("");

  function handleConfirm() {
    if (!method) return;
    onConfirm(method);
    setMethod("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogDescription>
            Record a payment of {formatCurrency(invoiceTotal)} for this booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border p-3 text-sm">
            <span className="text-muted-foreground">Amount due</span>
            <span className="font-medium">{formatCurrency(invoiceTotal)}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Payment Method</label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method..." />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(PAYMENT_METHOD_LABELS) as [
                    PaymentMethod,
                    string,
                  ][]
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button disabled={!method} onClick={handleConfirm}>
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import type { InvoiceWithRelations } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceDetailPanelProps {
  invoice: InvoiceWithRelations | null;
  open: boolean;
  onClose: () => void;
}

export function InvoiceDetailPanel({
  invoice,
  open,
  onClose,
}: InvoiceDetailPanelProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        {invoice && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <span className="font-mono">{invoice.id}</span>
                <StatusBadge type="invoice" status={invoice.status} />
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                {invoice.client.name}
              </p>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-4">
              {/* Booking link */}
              <div>
                <p className="text-sm text-muted-foreground">Booking</p>
                <p className="text-sm font-medium">
                  {invoice.booking.title}
                </p>
              </div>

              {/* Line items */}
              <div>
                <h4 className="mb-2 text-sm font-medium">Line Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({invoice.taxRate}%)
                  </span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>

              {/* Payment history */}
              <div>
                <h4 className="mb-2 text-sm font-medium">Payment History</h4>
                {invoice.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No payments yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {invoice.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-start justify-between rounded-md border p-3"
                      >
                        <div className="space-y-1">
                          <StatusBadge
                            type="payment"
                            status={payment.status}
                          />
                          <p className="text-sm">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.method}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {payment.processedAt
                            ? formatRelativeTime(payment.processedAt)
                            : "Pending"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

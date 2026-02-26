import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/format";
import type { Invoice, Payment } from "@/types";

interface InvoicePaymentCardProps {
  invoices: Invoice[];
  payments: Payment[];
}

export function InvoicePaymentCard({
  invoices,
  payments,
}: InvoicePaymentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No invoices.
          </p>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const invoicePayments = payments.filter(
                (p) => p.invoiceId === invoice.id
              );

              return (
                <div key={invoice.id} className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge type="invoice" status={invoice.status} />
                    <span className="text-xs font-mono text-muted-foreground">
                      {invoice.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {formatCurrency(invoice.total)}
                    </span>
                    <span className="text-muted-foreground">
                      Due {formatDate(invoice.dueDate)}
                    </span>
                  </div>

                  {invoicePayments.length > 0 && (
                    <div className="pl-3 border-l-2 border-muted space-y-2">
                      {invoicePayments.map((payment) => (
                        <div key={payment.id} className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge
                              type="payment"
                              status={payment.status}
                            />
                            <span className="text-sm font-medium">
                              {formatCurrency(payment.amount)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {payment.method}
                            </span>
                          </div>
                          {payment.processedAt && (
                            <p className="text-xs text-muted-foreground">
                              Processed{" "}
                              {formatRelativeTime(payment.processedAt)}
                            </p>
                          )}
                          {payment.refundReason && (
                            <p className="text-xs text-muted-foreground italic">
                              {payment.refundReason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import type { ConversationStatus, BookingStatus, InvoiceStatus, PaymentStatus, PaymentMethod, Role, Channel, ServiceType, SlaState, Priority } from "@/types";

export const CONVERSATION_STATUS_LABELS: Record<ConversationStatus, string> = {
  new: "New",
  in_review: "In Review",
  awaiting_client: "Awaiting Client",
  converted: "Converted",
  closed: "Closed",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  draft: "Draft",
  awaiting_payment: "Awaiting Payment",
  paid: "Paid",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_ACTION_LABELS: Record<BookingStatus, string> = {
  draft: "Draft",
  awaiting_payment: "Send for Payment",
  paid: "Mark as Paid",
  scheduled: "Schedule",
  in_progress: "Start",
  completed: "Complete",
  cancelled: "Cancel",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  succeeded: "Succeeded",
  failed: "Failed",
  refunded: "Refunded",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  card: "Card",
  balance_credit_external: "Balance / Credit (External)",
  cash: "Cash",
  other: "Other",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  vip_manager: "VIP Manager",
  manager: "Manager",
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  phone: "Phone",
  email: "Email",
  whatsapp: "WhatsApp",
  web: "Web",
  concierge: "Concierge",
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  car: "Car",
  jet: "Private Jet",
  helicopter: "Helicopter",
  yacht: "Yacht",
};

export const SLA_STATE_LABELS: Record<SlaState, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  breached: "Breached",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

// Badge color classes
export const CONVERSATION_STATUS_COLORS: Record<ConversationStatus, string> = {
  new: "bg-tone-info-light text-tone-info-foreground",
  in_review: "bg-tone-purple-light text-tone-purple-foreground",
  awaiting_client: "bg-tone-warning-light text-tone-warning-foreground",
  converted: "bg-tone-success-light text-tone-success-foreground",
  closed: "bg-tone-neutral-light text-tone-neutral-foreground",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  draft: "bg-tone-neutral-light text-tone-neutral-foreground",
  awaiting_payment: "bg-tone-warning-light text-tone-warning-foreground",
  paid: "bg-tone-success-light text-tone-success-foreground",
  scheduled: "bg-tone-info-light text-tone-info-foreground",
  in_progress: "bg-tone-purple-light text-tone-purple-foreground",
  completed: "bg-tone-success-light text-tone-success-foreground",
  cancelled: "bg-tone-neutral-light text-tone-neutral-foreground",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-tone-neutral-light text-tone-neutral-foreground",
  sent: "bg-tone-info-light text-tone-info-foreground",
  paid: "bg-tone-success-light text-tone-success-foreground",
  overdue: "bg-tone-danger-light text-tone-danger-foreground",
  cancelled: "bg-tone-neutral-light text-tone-neutral-foreground",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-tone-warning-light text-tone-warning-foreground",
  succeeded: "bg-tone-success-light text-tone-success-foreground",
  failed: "bg-tone-danger-light text-tone-danger-foreground",
  refunded: "bg-tone-purple-light text-tone-purple-foreground",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: "bg-tone-danger-light text-tone-danger-foreground",
  high: "bg-tone-warning-light text-tone-warning-foreground",
  medium: "bg-tone-info-light text-tone-info-foreground",
  low: "bg-tone-neutral-light text-tone-neutral-foreground",
};

export const SLA_STATE_COLORS: Record<SlaState, string> = {
  on_track: "text-tone-success",
  at_risk: "text-tone-warning",
  breached: "text-tone-danger bg-tone-danger-light",
};

export const CONVERSATION_STATUS_TRANSITIONS: Record<ConversationStatus, ConversationStatus[]> = {
  new: ["in_review"],
  in_review: ["awaiting_client", "converted"],
  awaiting_client: ["in_review"],
  converted: ["closed"],
  closed: [],
};

export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  draft: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["paid", "cancelled"],
  paid: ["cancelled"],
  scheduled: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
};

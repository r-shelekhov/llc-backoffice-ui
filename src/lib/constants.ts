import type { ConversationStatus, BookingStatus, InvoiceStatus, PaymentStatus, Role, Channel, ServiceType, SlaState, Priority } from "@/types";

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
  new: "bg-blue-100 text-blue-700",
  in_review: "bg-purple-100 text-purple-700",
  awaiting_client: "bg-amber-100 text-amber-700",
  converted: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  awaiting_payment: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  succeeded: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-amber-100 text-amber-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-500",
};

export const SLA_STATE_COLORS: Record<SlaState, string> = {
  on_track: "text-green-600",
  at_risk: "text-amber-600",
  breached: "text-red-600 bg-red-50",
};

export const CONVERSATION_STATUS_TRANSITIONS: Record<ConversationStatus, ConversationStatus[]> = {
  new: ["in_review"],
  in_review: ["awaiting_client", "converted"],
  awaiting_client: ["in_review"],
  converted: ["closed"],
  closed: [],
};

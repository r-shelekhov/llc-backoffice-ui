import type { RequestStatus, InvoiceStatus, PaymentStatus, Role, Channel, ServiceType, SlaState, Priority } from "@/types";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress",
  action_required: "Action Required",
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
export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  assigned: "bg-purple-100 text-purple-700",
  in_progress: "bg-amber-100 text-amber-700",
  action_required: "bg-red-100 text-red-700",
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

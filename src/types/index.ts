export type Role = "admin" | "vip_manager" | "manager";

export type Priority = "critical" | "high" | "medium" | "low";

export type RequestStatus =
  | "new"
  | "assigned"
  | "in_progress"
  | "action_required"
  | "completed"
  | "cancelled";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type Channel = "phone" | "email" | "whatsapp" | "web" | "concierge";

export type ServiceType = "car" | "jet" | "helicopter" | "yacht";

export type SlaState = "on_track" | "at_risk" | "breached";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  isVip: boolean;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
  totalRequests: number;
  totalSpend: number;
}

export interface Request {
  id: string;
  clientId: string;
  assigneeId: string | null;
  status: RequestStatus;
  priority: Priority;
  channel: Channel;
  serviceType: ServiceType;
  title: string;
  description: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  slaDueAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Communication {
  id: string;
  requestId: string;
  sender: "client" | "agent" | "system";
  senderName: string;
  channel: Channel;
  message: string;
  attachments?: Attachment[];
  tags?: string[];
  createdAt: string;
}

export interface InternalNote {
  id: string;
  requestId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  requestId: string;
  clientId: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  status: PaymentStatus;
  method: string;
  amount: number;
  processedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface RequestWithRelations extends Request {
  client: Client;
  assignee: User | null;
  communications: Communication[];
  internalNotes: InternalNote[];
  invoices: Invoice[];
  payments: Payment[];
  slaState: SlaState;
}

export interface InvoiceWithRelations extends Invoice {
  client: Client;
  request: Request;
  payments: Payment[];
}

export interface PaymentWithRelations extends Payment {
  invoice: Invoice;
  client: Client;
  request: Request;
}

export interface FilterState {
  search: string;
  statuses: RequestStatus[];
  channels: Channel[];
  assigneeIds: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
  vipOnly: boolean;
  slaStates: SlaState[];
}

export interface InvoiceFilterState {
  search: string;
  statuses: InvoiceStatus[];
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface PaymentFilterState {
  search: string;
  statuses: PaymentStatus[];
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface KpiData {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

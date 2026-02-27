export type Role = "admin" | "vip_manager" | "manager";

export type Priority = "critical" | "high" | "medium" | "low";

export type ConversationStatus =
  | "new"
  | "in_review"
  | "awaiting_client"
  | "converted"
  | "closed";

export type BookingStatus =
  | "draft"
  | "awaiting_payment"
  | "paid"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type PaymentMethod = "bank_transfer" | "card" | "balance_credit_external" | "cash" | "other";

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
  totalConversations: number;
  totalSpend: number;
}

export interface Conversation {
  id: string;
  clientId: string;
  assigneeId: string | null;
  status: ConversationStatus;
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

export interface Booking {
  id: string;
  conversationId: string;
  clientId: string;
  assigneeId: string | null;
  status: BookingStatus;
  title: string;
  category: ServiceType;
  executionAt: string;
  location: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Communication {
  id: string;
  conversationId: string;
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
  conversationId: string;
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
  bookingId: string;
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
  method: PaymentMethod;
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

export interface ConversationWithRelations extends Conversation {
  client: Client;
  assignee: User | null;
  communications: Communication[];
  internalNotes: InternalNote[];
  invoices: Invoice[];
  payments: Payment[];
  slaState: SlaState;
}

export interface BookingWithRelations extends Booking {
  client: Client;
  assignee: User | null;
  conversation: Conversation;
  invoices: Invoice[];
  payments: Payment[];
}

export interface InvoiceWithRelations extends Invoice {
  client: Client;
  booking: Booking;
  payments: Payment[];
}

export interface PaymentWithRelations extends Payment {
  invoice: Invoice;
  client: Client;
  booking: Booking;
}

export interface ConversationFilterState {
  search: string;
  statuses: ConversationStatus[];
  channels: Channel[];
  assigneeIds: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
  vipOnly: boolean;
  slaStates: SlaState[];
}

export interface BookingFilterState {
  search: string;
  statuses: BookingStatus[];
  dateFrom: Date | null;
  dateTo: Date | null;
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

export interface ClientRow extends Client {
  visibleConversationCount: number;
  lastActivityAt: string;
  isActive: boolean;
}

export interface ClientFilterState {
  search: string;
  vipStatuses: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
  activeOnly: boolean;
}

export type SortField = "last_activity" | "date_started" | "priority" | "waiting_since" | "sla_due";

export type SortDirection = "asc" | "desc";

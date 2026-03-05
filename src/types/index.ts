export type Role = "admin" | "vip_manager" | "manager";

export type Priority = "critical" | "high" | "medium" | "low";

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

export type DeliveryStatus = "sent" | "delivered" | "read";

export type CommunicationEventType =
  | "booking_created"
  | "booking_status_changed"
  | "invoice_created"
  | "invoice_sent"
  | "payment_confirmed";

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
  lifecycleStatus?: LifecycleStatus;
}

export interface Conversation {
  id: string;
  clientId: string;
  managerId: string | null;
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
  managerId: string | null;
  status: BookingStatus;
  title: string;
  category: string;
  duration: string;
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
  deliveryStatus?: DeliveryStatus;
  attachments?: Attachment[];
  tags?: string[];
  event?: {
    type: CommunicationEventType;
    // Common booking fields
    bookingId?: string;
    title?: string;
    category?: string;
    executionAt?: string;
    location?: string;
    price?: number;
    // booking_status_changed
    fromStatus?: BookingStatus;
    toStatus?: BookingStatus;
    // invoice_created, invoice_sent, payment_confirmed
    invoiceId?: string;
    invoiceTotal?: number;
    // payment_confirmed
    paymentAmount?: number;
    paymentMethod?: PaymentMethod;
  };
  createdAt: string;
}

export interface InternalNote {
  id: string;
  conversationId: string;
  clientId: string;
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
  manager: User | null;
  communications: Communication[];
  internalNotes: InternalNote[];
  bookings: Booking[];
  invoices: Invoice[];
  payments: Payment[];
  slaState: SlaState;
  lifecycleStatus: LifecycleStatus;
}

export interface BookingWithRelations extends Booking {
  client: Client;
  manager: User | null;
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
  channels: Channel[];
  managerIds: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
  vipOnly: boolean;
  slaStates: SlaState[];
}

export interface BookingFilterState {
  search: string;
  statuses: BookingStatus[];
  clientId: string | null;
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
  lifecycleStatus: LifecycleStatus;
}

export interface ClientFilterState {
  search: string;
  vipOnly: boolean;
  activeOnly: boolean;
}

export type SortField = "last_activity" | "date_started" | "priority" | "waiting_since" | "sla_due";

export type SortDirection = "asc" | "desc";

export type LifecycleStatus = "lead" | "client";

# Business Rules

Single source of truth for domain logic. Claude MUST consult this before modifying business logic, mock data, types, or UI that touches domain concepts.

## Domain Model

```
Client → Conversation → Booking → Invoice → Payment
                      ↘ Communication
                      ↘ InternalNote
```

- **Client** — person requesting services (`src/types/index.ts`)
- **Conversation** — thread between client and managers; has `managerIds[]`
- **Booking** — service engagement tied to a Conversation; has own `managerIds[]`
- **Invoice** — bill for a Booking; has line items, tax, total
- **Payment** — money received against an Invoice
- **Communication** — message in a Conversation (sender: `client` | `agent` | `system`)
- **InternalNote** — private note on a Conversation, visible only to staff

## Client / Lead Lifecycle (`src/lib/client-lifecycle.ts`)

A person is either a **lead** or a **client**:

| Status | Meaning |
|--------|---------|
| `lead` | No bookings with paid evidence |
| `client` | At least one booking with paid evidence, OR `client.lifecycleStatus === "client"` (manual override) |

### Paid Evidence

A booking has "paid evidence" if ANY of these is true:

1. **Booking status** is one of: `paid`, `approved`, `scheduled`, `in_progress`, `completed`
2. **Invoice** linked to the booking has status `paid`
3. **Payment** linked to the booking's invoice has status `succeeded` or `refunded`

Statuses that are NOT paid evidence:
- Booking: `draft`, `awaiting_payment`, `cancelled`
- Invoice: `draft`, `sent`, `overdue`, `cancelled`
- Payment: `pending`, `failed`

### Rules

- `client.lifecycleStatus === "client"` is a manual override (for clients with history outside mock data)
- Promotion is one-way: a client never reverts to lead
- **Key implication**: if ALL of a person's bookings are `draft` / `awaiting_payment` / `cancelled`, they are a LEAD

## Account Holders

Clients with `isAccountHolder: true` use deferred monthly billing instead of per-booking upfront payment.

### Designation
- Set via `client.isAccountHolder` flag (toggled in client form, like VIP)
- Typically corporate/VIP clients with established billing relationships

### Modified Booking Flow
```
draft → approved → scheduled → in_progress → completed
  ↘ cancelled   ↘ cancelled
```
- After invoice is created, manager clicks "Approve Booking" (instead of "Send Invoice" / "Confirm Payment")
- `approved` sets booking status to `approved`, invoice remains `sent`
- Payment happens via monthly statement, not per-booking
- `approved` counts as paid evidence for lifecycle (lead → client promotion)

### Statement Lifecycle
```
open → closed → paid
              → overdue
```
- `open`: current month, accumulating invoices
- `closed`: month ended, statement finalized
- `paid`: full payment received
- `overdue`: past due date, unpaid

### Monthly Statements
- Each account holder gets one statement per month
- Individual invoices are still created per booking (deferred payment)
- Statement consolidates all invoices for the period
- "Confirm Payment" applies to the whole statement

## Booking Statuses (`src/lib/constants.ts`)

### Flow

```
draft → awaiting_payment → paid → scheduled → in_progress → completed
  ↘ cancelled    ↘ cancelled   ↘ cancelled  ↘ cancelled   ↘ cancelled
  ↘ approved → scheduled (account holders)
```

### Exact Transitions (`BOOKING_STATUS_TRANSITIONS`)

| From | Allowed transitions |
|------|-------------------|
| `draft` | `awaiting_payment`, `approved`, `cancelled` |
| `awaiting_payment` | `paid`, `cancelled` |
| `paid` | `cancelled` |
| `approved` | `scheduled`, `cancelled` |
| `scheduled` | `in_progress`, `cancelled` |
| `in_progress` | `completed`, `cancelled` |
| `completed` | _(terminal)_ |
| `cancelled` | _(terminal)_ |

Note: transition from `paid` → `scheduled` is not in `BOOKING_STATUS_TRANSITIONS` — scheduling is handled externally.

### UI Labels

| Status | Label |
|--------|-------|
| `draft` | New |
| `awaiting_payment` | Awaiting Payment |
| `paid` | Paid |
| `approved` | Approved |
| `scheduled` | Scheduled |
| `in_progress` | Active |
| `completed` | Completed |
| `cancelled` | Cancelled |

## Invoice Statuses

Flow: `draft` → `sent` → `paid` / `overdue` → `cancelled`

## Payment Statuses

Flow: `pending` → `succeeded` / `failed` / `refunded`

Methods: `bank_transfer`, `card`, `balance_credit_external`, `cash`, `other`

## Roles & Permissions (`src/lib/permissions.ts`)

| Role | Sees own | Sees all | Sees VIP | `/admin` |
|------|----------|----------|----------|----------|
| `admin` | yes | yes | yes | yes |
| `vip_manager` | yes | yes | yes | no |
| `manager` | yes | no | no | no |

### Visibility Rules

- `admin` / `vip_manager`: see everything
- `manager`: sees only conversations/bookings where `managerIds` includes their user ID; CANNOT see VIP clients
- VIP clients (`client.isVip`) can only be assigned to `admin` or `vip_manager` (`getAssignableManagers`)

### Filter Chain

Permission filtering happens at multiple levels:
- `filterConversationsByPermission` — by `managerIds`
- `filterBookingsByPermission` — by `managerIds`
- `filterInvoicesByPermission` — via booking's `managerIds`
- `filterPaymentsByPermission` — via invoice → booking's `managerIds`
- VIP filters: `filterVipConversations`, `filterVipBookings`, `filterVipInvoices`, `filterVipPayments`

## Action Reasons / Tags (`src/lib/filters.ts`)

Tags shown on conversation tiles to indicate required actions:

| Reason | Condition |
|--------|-----------|
| `unread` | Client sent message after `lastReadAt` |
| `sla_risk` | SLA state is `at_risk` or `breached` |
| `unassigned` | `managerIds` is empty |
| `draft_booking` | Any booking with status `draft` |
| `awaiting_payment` | Any booking with status `awaiting_payment` |
| `needs_scheduling` | Any booking with status `paid` (paid but not yet scheduled) |
| `overdue_invoice` | Any invoice with status `overdue` |

**Resolved conversations**: only the `unread` reason is evaluated (if client sent a new message after resolution).

## System Messages (`CommunicationEventType`)

| Type | When |
|------|------|
| `web_form_submitted` | Client submits a web form |
| `booking_created` | New booking created |
| `booking_status_changed` | Booking status transition |
| `booking_approved` | Booking approved for account holder (deferred payment) |
| `invoice_created` | Invoice generated |
| `invoice_sent` | Invoice sent to client |
| `payment_confirmed` | Payment received |
| `conversation_resolved` | Conversation marked as resolved |

## Channels

`phone`, `email`, `whatsapp`, `web`, `concierge`

## SLA (`src/lib/sla.ts`)

| State | Condition |
|-------|-----------|
| `breached` | SLA due date is in the past |
| `at_risk` | SLA due date is within 2 hours |
| `on_track` | SLA due date is more than 2 hours away |

## UI Conventions

- Currency: GBP (£)
- Service types: `car`, `jet` (Private Jet), `helicopter`, `yacht`
- Priority levels: `critical`, `high`, `medium`, `low`
- Delivery statuses (messages): `sent`, `delivered`, `read`

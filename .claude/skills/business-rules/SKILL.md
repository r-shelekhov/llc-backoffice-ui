---
name: business-rules
description: "Use when modifying, creating, or reviewing any business logic, mock data, types, UI components, booking flows, client/lead lifecycle, permissions, conversation features, or invoice/payment handling. MUST be invoked before implementing any feature or fix that touches domain logic."
---

# Business Rules Verification

## Before Making Changes

Read `docs/business-rules.md` in the project root. This is the single source of truth for all domain logic.

## After Making Changes — Verification Checklist

### 1. Lifecycle Consistency

- [ ] Clients with bookings in `paid`/`scheduled`/`in_progress`/`completed` are marked as `client`, not `lead`
- [ ] Clients with ONLY `draft`/`awaiting_payment`/`cancelled` bookings remain `lead`
- [ ] `client.lifecycleStatus === "client"` overrides are respected (never revert to `lead`)
- [ ] Promotion is one-way — no code path demotes a client back to lead

### 2. Booking Status Transitions

- [ ] Status changes follow `BOOKING_STATUS_TRANSITIONS` from `src/lib/constants.ts`
- [ ] `completed` and `cancelled` are terminal — no transitions out
- [ ] New bookings start as `draft`

### 3. Permission Rules

- [ ] `manager` role only sees own conversations/bookings (where `managerIds` includes their ID)
- [ ] `manager` cannot see VIP clients
- [ ] VIP clients are only assigned to `admin` or `vip_manager`
- [ ] `admin` and `vip_manager` see everything
- [ ] Only `admin` can access `/admin` routes

### 4. Mock Data Integrity

- [ ] Mock booking statuses are valid values from `BookingStatus` type
- [ ] Mock invoice/payment statuses match their respective types
- [ ] Referential integrity: `booking.conversationId` points to existing conversation, `invoice.bookingId` to existing booking, `payment.invoiceId` to existing invoice
- [ ] `clientId` is consistent across related entities (conversation → booking → invoice → payment)
- [ ] VIP client bookings have only `admin`/`vip_manager` in `managerIds`

### 5. Action Reasons / Tags

- [ ] Resolved conversations only show `unread` tag (no other action reasons)
- [ ] `needs_scheduling` tag only appears for bookings with status `paid`
- [ ] `sla_risk` checks both `at_risk` and `breached` states

### 6. UI & Types

- [ ] Currency displayed in GBP (£)
- [ ] All status values use exact string literals from `src/types/index.ts`
- [ ] System messages use valid `CommunicationEventType` values

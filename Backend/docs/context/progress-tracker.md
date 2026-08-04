# Progress Tracker

## Current Status

- Phase: Backend foundation and payment bridge slice
- Focus: Plain JavaScript backend, Razorpay onboarding/payment flow, API contract, and data models
- Implementation status: Auth, onboarding, table/QR, menu, customer session/cart, checkout, and payment bridge slices implemented

---

## Completed

- Read the canonical flow and spec docs
- Identified that the repo currently uses `docs/context` as the source of truth
- Narrowed the product scope to MVP/prototype backend behavior
- Captured final decisions for onboarding, QR sessions, OCR, order actions, notifications, and storage retention
- Drafted the API contract and data model specs
- Bootstrapped the Express app shell
- Implemented admin auth routes and onboarding persistence
- Added table generation, QR payload generation, and active session lookup
- Added menu item CRUD and menu image/extraction records
- Added customer session scan, menu access, and cart groundwork
- Added checkout and order creation records with admin order views
- Added Razorpay order creation, webhook verification, and cash-paid marking

---

## Current Decisions

- Backend will be built in plain JavaScript, not TypeScript
- One backend app will hold the MVP modules instead of many microservices
- Razorpay Checkout + webhook verification will be the payment source of truth
- Restaurant signup will include full merchant onboarding details from day one
- Cash at counter stays available as a separate non-gateway flow
- Customer accounts are out of scope for MVP
- One table has one QR code
- One active ordering session controls ordering for a table
- OCR provider will be abstracted, with the strongest available structured extraction model chosen first
- Admin order actions are limited to accept, complete, and cancel
- In-app notifications only for MVP
- Menu images are retained long enough for review and re-processing
- Auth sessions use HttpOnly cookies
- MongoDB is the source of truth for admins, restaurants, and onboarding data
- Table regeneration preserves existing tables instead of deleting them
- Menu images are retained for review and re-processing
- Customer sessions are anonymous and QR-based
- Orders now exist as persistent records tied to carts and sessions
- Payment records now exist and can confirm orders to paid

---

## Open Questions

- Whether the first implementation should include WebSocket or use SSE for live order updates
- Whether the exact onboarding field list should follow Razorpay’s India flow or a slightly broader internal schema that can map to it
- Whether we should add refresh sessions now or keep the 24-hour cookie only for the MVP

---

## Next Steps

1. Add admin order list/detail and status transitions polish
2. Add collections reporting and in-app notifications
3. Add validation/security hardening pass for the implemented slices
4. Run a full phase verification pass

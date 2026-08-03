# Progress Tracker

## Current Status

- Phase: Docs alignment for MVP backend
- Focus: Plain JavaScript backend, Razorpay onboarding/payment flow, API contract, and data models
- Implementation status: Not started in code yet

---

## Completed

- Read the canonical flow and spec docs
- Identified that the repo currently uses `docs/context` as the source of truth
- Narrowed the product scope to MVP/prototype backend behavior
- Captured final decisions for onboarding, QR sessions, OCR, order actions, notifications, and storage retention
- Drafted the API contract and data model specs

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

---

## Open Questions

- Whether the first implementation should include WebSocket or use SSE for live order updates
- Whether the exact onboarding field list should follow Razorpay’s India flow or a slightly broader internal schema that can map to it

---

## Next Steps

1. Lock the backend folder structure
2. Implement the base Express app and shared middleware
3. Add environment validation and database connection setup
4. Add the auth module first

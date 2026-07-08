# Progress Tracker

Update this file after every completed feature so the current state is always obvious.

---

## Current Status

**Phase:** 1 - Foundation  
**Last completed:** Admin auth frontend/backend wiring and backend typecheck pass  
**Next:** Finish admin authentication runtime verification, then build restaurant setup

---

## Progress

### Phase 1 - Foundation

- [x] 01 Repository and App Shell
- [ ] 02 Admin Authentication
- [ ] 03 Admin Home and Restaurant Setup
- [ ] 04 Menu Extraction Pipeline

### Phase 2 - Admin Operations

- [ ] 05 Menu CRUD
- [ ] 06 QR Code Generation
- [ ] 07 Orders List
- [ ] 08 Single Order Details
- [ ] 09 Collections
- [ ] 10 Settings

### Phase 3 - Customer Ordering

- [ ] 11 QR Landing and Menu View
- [ ] 12 Cart and Checkout
- [ ] 13 Razorpay Checkout
- [ ] 14 Order Tracking

### Phase 4 - Hardening

- [ ] 15 Validation and Security
- [ ] 16 Queue and Workers
- [ ] 17 Observability

---

## Decisions Made During Build

- Admin auth starts with email and password only
- Customer sessions are QR-based and guest-friendly
- GraphQL is not the default API style for v1
- REST plus events is the preferred backend direction
- Razorpay is the payment provider
- OCR will be abstracted behind a menu extraction service
- Customer input renders as plain text only
- QR sessions are signed, expiring, and revocable
- Idempotency keys are required for orders and payments
- Backends compile with `tsc --noEmit`
- Customer web app starts in Vite dev mode
- Admin mobile app starts in Expo mobile mode
- Admin auth frontend posts to the admin backend `/auth` endpoint
- Admin backend returns structured register/login responses

# Progress Tracker

Update this file after every completed feature so the current state is always obvious.

---

## Current Status

**Phase:** 1 - Foundation  
**Last completed:** Settings screen with restaurant profile and bank details
**Next:** Build customer QR landing and menu view

---

## Progress

### Phase 1 - Foundation

- [x] 01 Repository and App Shell
- [x] 02 Admin Authentication
- [x] 03 Admin Home and Restaurant Setup
- [x] 04 Menu Extraction Pipeline

### Phase 2 - Admin Operations

- [x] 05 Menu CRUD
- [x] 06 QR Code Generation
- [x] 07 Orders List
- [x] 08 Single Order Details
- [x] 09 Collections
- [x] 10 Settings

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
- Admin auth hands off into the home/setup screen after successful submit
- Admin menu extraction uses image picker + backend draft extraction
- Admin auth now creates an in-memory session token
- Menu extraction uses real multipart file upload
- Menu CRUD supports add/edit/delete/toggle/publish in-memory
- QR generation now creates signed, expiring table sessions with backend QR previews
- Orders list now exposes a live in-memory feed with filters and quick status changes
- Single order detail now opens from the order list and supports lifecycle updates
- Collections dashboard now filters by date and shows revenue summary data
- Settings screen now edits restaurant identity, tables, and bank details

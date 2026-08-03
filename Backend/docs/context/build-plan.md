# Build Plan

## Core Principle

Build OrderXpress in visible, testable slices.

For the MVP, every slice should be backend-first and end-to-end within a small scope.

The implementation order should follow the API contract and data model documents once finalized.

---

## Phase 1 - Foundation

### 01 Repository and App Shell

- Set up the backend project structure
- Add environment validation
- Add shared request/response helpers
- Add base Express app, health route, and error middleware

### 02 Admin Authentication

- Admin registration
- Admin login
- JWT cookie session
- Logout

### 03 Merchant Onboarding

- Build restaurant signup form contract
- Persist onboarding fields
- Track onboarding status
- Store Razorpay-related merchant metadata

### 04 Restaurant Setup

- Store restaurant profile
- Store table count
- Generate table records
- Generate signed QR payloads

### 05 Menu Management

- Create, update, delete, and list menu items
- Upload menu image
- Run OCR extraction pipeline
- Allow manual review before publish

---

## Phase 2 - Customer Ordering

### 06 QR Session and Menu Access

- Create or resume customer session from QR
- Fetch restaurant menu for the active table
- Keep session access time-bound

### 07 Cart and Checkout

- Add and remove cart items
- Calculate totals on the server
- Capture customer note if needed
- Create order draft

### 08 Razorpay Payment Flow

- Create Razorpay order
- Confirm via webhook
- Mark order as paid
- Handle duplicate webhook delivery safely

### 09 Cash at Counter Flow

- Support cash checkout
- Mark payment as pending for manual collection
- Allow admin to complete collection later

---

## Phase 3 - Admin Operations

### 10 Orders List and Order Detail

- Live order feed
- Filter by table and status
- Update order status

### 11 Collections

- Daily totals
- Date-wise filter
- Basic revenue summary

### 12 Notifications

- Emit order created and status changed events
- Send real-time updates to the frontend

---

## Phase 4 - Hardening

### 13 Validation and Security

- Zod validation or equivalent schema validation
- Rate limiting
- Secure headers
- CSRF protection where required

### 14 Menu OCR Reliability

- Retry handling
- Error reporting
- Extraction review feedback

### 15 Observability

- Structured logs
- Audit trails
- Basic request tracing

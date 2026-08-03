# architecture.md
# OrderXpress

**Document Type:** Architecture Reference  
**Audience:** AI Agents, Developers, Architects  
**Source of Truth:** `project-overview.md`  
**Status:** Active - MVP / Prototype Scope

---

## 1. System Overview

OrderXpress is a single backend application built in **Node.js with plain JavaScript**.

The backend serves both the admin and customer frontends through HTTP APIs and real-time events.

### Backend Responsibilities

- Authentication
- Restaurant and table management
- Menu CRUD
- Menu image upload and extraction
- QR session handling
- Cart and order management
- Razorpay payment verification
- Merchant onboarding data capture
- Notifications
- Daily collection summaries
- Audit logging

### Core Infrastructure

- Node.js + JavaScript
- Express for HTTP APIs
- MongoDB for primary storage
- Redis for sessions, rate limiting, and short-lived state
- Object storage for menu images and generated QR assets
- WebSocket or SSE for live order updates

---

## 2. API Strategy

Use **REST** as the primary API style.

Use **webhooks** for payment confirmation.

Use **WebSocket or SSE** for real-time order updates when needed.

Do not introduce GraphQL for the MVP.

Reasoning:

- REST is easier to implement and debug for the first release
- Webhooks are required for payment truth
- Real-time order updates are needed, but should stay lightweight

---

## 3. Service Boundaries

For the MVP we will keep the codebase modular inside one backend app instead of splitting into many deployable microservices.

### Recommended Modules

- Auth
- Merchant onboarding
- Restaurant
- Menu
- OCR / Menu extraction
- Tables
- Orders
- Payments
- Notifications
- Reporting
- Audit

Each module should own its routes, validation, and service logic.

---

## 4. Authentication Model

### Admin

- Email and password
- JWT stored in HttpOnly cookie
- Passwords stored with bcrypt or equivalent one-way hashing

### Customer

- No account
- Session is created from QR scan
- Session is tied to restaurant and table
- Session is signed and can expire

### Restaurant Onboarding

- Collect the full business details needed for Razorpay activation
- Keep onboarding state in the database until the restaurant becomes active
- Allow restaurants to remain in `pending`, `under_review`, `active`, or `rejected`

### Security Rules

- Never store JWTs in localStorage or sessionStorage
- Validate all auth inputs
- Use HttpOnly, Secure, SameSite cookies for admin auth

---

## 5. QR Session Design

Recommended QR session data:

- restaurantId
- tableId
- sessionId
- expiry
- signature

Behavior:

- First scan creates or resumes a table session
- Repeated scans should be idempotent
- A session can be revoked by the admin
- Only one active ordering session should control ordering for a table at a time
- Additional scans can view the menu but cannot create competing order sessions

---

## 6. Menu Extraction Architecture

Menu extraction should be treated as an async pipeline.

Flow:

1. Admin uploads menu image
2. Backend stores the image
3. OCR service extracts text
4. Parser converts text into item candidates
5. Admin reviews and confirms extracted items
6. Confirmed items are saved as menu items

The OCR provider should be abstracted behind one service so we can swap providers later.
For the MVP, choose the strongest provider available for structured menu extraction and keep the provider-specific code isolated.

---

## 7. Orders Architecture

### 7.1 Order Creation Flow

1. Customer adds items to cart
2. Backend calculates totals on the server
3. Backend creates an order record
4. Online payment path creates a Razorpay order
5. Razorpay webhook confirms payment
6. Order status advances through the state machine

### 7.2 Order State Model

Recommended states:

- `draft`
- `pending_payment`
- `paid`
- `queued`
- `accepted`
- `preparing`
- `served`
- `completed`
- `cancelled`
- `failed`

### 7.3 MVP Order Rules

- Duplicate submissions must be blocked with idempotency keys
- Client totals are never trusted
- Cash orders should skip payment gateway creation
- Admin order actions are intentionally limited to `accept`, `complete`, and `cancel`

---

## 8. Payment Architecture

Razorpay is the payment provider for the MVP.

Rules:

- Create Razorpay orders from the backend only
- Verify payment using webhook signatures
- Do not mark an order paid from frontend callbacks alone
- Keep cash-at-counter as a separate non-gateway path
- The backend must store merchant onboarding fields required for Razorpay activation from day one

---

## 9. Database Strategy

MongoDB collections should be organized by domain.

Recommended collections:

- `merchant_onboardings`
- `admins`
- `restaurants`
- `tables`
- `menu_images`
- `menu_items`
- `menu_extractions`
- `customer_sessions`
- `carts`
- `orders`
- `payments`
- `notifications`
- `collections_daily`
- `audit_logs`

---

## 10. Environment Variables

Required env vars will be validated at startup.

Examples:

- `JWT_SECRET`
- `MONGO_URI`
- `REDIS_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `OCR_PROVIDER_KEY`

Secrets must never be committed to git.

---

## 11. Cross-Cutting Security

- Validate every request
- Reject unexpected public fields
- Sanitize customer text before storing or displaying
- Use CSRF protection for cookie-authenticated admin actions where applicable
- Add rate limiting for login, order creation, payment endpoints, and OCR uploads
- Redact secrets and payment data in logs
- Use secure headers and clickjacking protection

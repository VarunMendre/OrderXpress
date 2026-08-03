# architecture.md
# OrderXpress

**Document Type:** Architecture Reference  
**Audience:** AI Agents, Developers, Architects  
**Source of Truth:** `project-overview.md`  
**Status:** Active - Implementation Ready

---

## 1. System Overview

OrderXpress is a microservices-based restaurant ordering platform.

### Client Apps

- Admin mobile app: React Native
- Customer web app: React

### Backend Services

- Auth service
- Restaurant service
- Menu extraction service
- Orders service
- Payment service
- Notification service
- Reporting service
- Media/storage service
- Audit/security service

### Core Infrastructure

- Node.js + TypeScript for backend services
- MongoDB for primary data
- Redis for sessions, caching, rate limiting, and queues
- Object storage for menu images and generated assets
- Message queue for asynchronous work
- Prometheus + Grafana later for observability

---

## 2. API Strategy

Recommended approach:

- **REST** for external integrations, uploads, webhooks, health checks, and simple service endpoints
- **Event-driven internal communication** for order placement, payment completion, notifications, and OCR processing
- **No GraphQL for the first version**

Reasoning:

- OrderXpress has many side effects and asynchronous workflows
- Webhooks and internal events fit REST + queueing better
- The system will be easier to reason about during the first build

---

## 3. Service Boundaries

### 3.1 Admin and Customer Frontends

The frontends render UI only. They must not contain business rules beyond basic presentation and input handling.

### 3.2 Auth Service

Owns:

- Admin registration and login
- Customer QR session issuance
- Session refresh and revocation
- Password hashing and reset flows later

### 3.3 Menu Extraction Service

Owns:

- Menu image intake
- OCR provider integration
- Parsed text normalization
- Price variant extraction such as single, half, and full
- Confidence scoring and extraction metadata

### 3.4 Orders Service

Owns:

- Cart-to-order conversion
- Order state machine
- Idempotency handling
- Restaurant/table linkage
- Order history and tracking

### 3.5 Payment Service

Owns:

- Razorpay order creation
- Razorpay webhook verification
- Payment state reconciliation
- Refund hooks later if needed

### 3.6 Notification Service

Owns:

- Admin in-app notifications
- Customer mobile notifications
- Retry policy for failed deliveries
- Event fan-out from order and payment events

### 3.7 Reporting Service

Owns:

- Daily collection
- Date-wise filtering
- Sales summaries
- Order analytics

---

## 4. Authentication Model

### Admin

- Email and password
- Password hash stored with a strong one-way algorithm
- Session token stored securely
- Future support for MFA and OAuth can be added later

### Customer

- No account creation
- QR code opens a table session
- Session is signed, expiring, and revocable
- Customer may optionally provide a phone number for notifications

### Security Rules

- Never store JWTs in localStorage or sessionStorage
- Use HttpOnly, Secure, SameSite cookies where cookie auth is needed
- Sign QR sessions and bind them to restaurant and table
- Validate all auth inputs with Zod

---

## 5. QR Session Design

Recommended QR payload:

- restaurantId
- branchId if the business has branches
- tableId
- sessionId
- signed expiry
- nonce

Behavior:

- First scan creates or activates a table session
- Repeated scans can reopen menu access
- Only the valid session can place orders
- QR sessions expire and can be revoked by admin

---

## 6. Menu Extraction Architecture

Recommended abstraction:

`MenuExtractionService`

This service should hide the OCR provider behind a stable interface.

Suggested provider strategy:

- Primary: AWS Textract or Google Document AI class of tools
- Fallback: OCR provider abstraction for future swap-out

The service should:

- accept image uploads
- extract text and layout
- infer item names and price variants
- return confidence + raw extraction payload
- allow admin edits before publish

---

## 7. Orders Architecture

### 7.1 Order Creation Flow

1. Customer places order
2. Request validated with Zod
3. Idempotency key checked
4. Order stored as `pending`
5. Event published to queue
6. Worker processes payment or post-payment steps
7. Notification service emits admin and customer updates

### 7.2 Burst Handling

- High traffic must not block the API thread
- Excess work should go through a queue
- Per-restaurant concurrency should be limited
- Duplicate submissions should collapse via idempotency keys

### 7.3 Order State Model

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

---

## 8. Payment Architecture

Razorpay is the payment provider.

Rules:

- Payment creation and confirmation must be idempotent
- Webhooks must be signature-verified
- Payment success should not depend on immediate notification success
- Client-side confirmation alone is not enough

---

## 9. Database Strategy

MongoDB collections should be organized by service ownership, not by client screens.

Recommended collections:

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

Rules:

- Secrets must never be committed to git
- Use separate env files per service
- Production secrets should come from a secret manager
- Validate required env vars at startup

Examples:

- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `REDIS_URL`
- `MONGO_URI`
- `OCR_PROVIDER_KEY`

---

## 11. Cross-Cutting Security

- Zod validation for all inputs
- No raw HTML rendering for customer input
- Strict CSP
- Clickjacking protection
- CSRF protection for cookie-auth endpoints
- Rate limiting for login, QR actions, OCR, orders, and payments
- Dependency scanning in CI
- Redacted logs for secrets and payment data


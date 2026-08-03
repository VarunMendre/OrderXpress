# project-overview.md
# OrderXpress

**Document Type:** Project Overview  
**Audience:** AI Agents, Developers, Architects  
**Source of Truth:** This document plus `architecture.md`, `build-plan.md`, and `code-standards.md`  
**Status:** Active - MVP / Prototype Scope

---

## 1. What Is This Project?

OrderXpress is a QR-based restaurant ordering backend for an MVP/prototype.

It supports two experiences:

- **Admin**: restaurant owner or staff who registers the restaurant, manages menu items, generates table QR codes, and tracks orders
- **Customer**: guest who scans a table QR code, browses the menu, places an order, and pays or chooses cash at counter where enabled

This repository is the backend only. The frontend teams will consume the APIs and real-time events exposed here.

---

## 2. Product Goal

The MVP should solve the core restaurant ordering loop:

1. Admin creates a restaurant account
2. Admin adds menu items
3. Admin generates QR codes for tables
4. Customer scans QR and opens a table session
5. Customer places an order
6. Customer pays through Razorpay or marks cash at counter
7. Admin receives and processes the order

Everything else is secondary until this loop is stable.

The target audience should be able to see a simple, complete onboarding and ordering flow from day one.

---

## 3. Primary Users

### Admin

The admin manages:

- Restaurant registration and login
- Basic restaurant profile
- Menu CRUD
- Menu image upload and OCR review
- Table setup and QR generation
- Live order queue
- Order status updates
- Collection summaries

### Customer

The customer is a guest at the restaurant. The customer can:

- Open the menu through a QR session
- Browse categories and items
- Add items to cart
- Checkout using online payment or cash at counter where allowed
- Track order status

No customer account is required for the MVP.

---

## 4. Core Workflow

### Admin Flow

1. Admin registers with restaurant and account details
2. Admin logs in
3. Admin creates or reviews menu items
4. Admin uploads a menu image when needed
5. System extracts text and item candidates from the image
6. Admin corrects extraction results and publishes menu
7. Admin generates QR codes for tables
8. Customers scan the QR and place orders
9. Admin receives orders in real time
10. Admin updates order status and reviews collections

### Customer Flow

1. Customer scans table QR code
2. Backend creates or resumes a signed table session
3. Customer loads restaurant menu
4. Customer adds items to cart
5. Customer checks out
6. Customer pays online through Razorpay or selects cash at counter if the restaurant allows it
7. Order is created
8. Customer tracks order status

---

## 5. MVP Feature Scope

### In Scope

- Admin registration and login
- Full merchant onboarding for restaurant signup
- Restaurant profile storage
- Menu item CRUD
- Menu image upload and OCR extraction review
- Table generation and QR sessions
- Customer menu browsing
- Cart and order creation
- Razorpay payment flow
- Cash-at-counter order flow
- Admin order management
- Basic collection reporting
- Audit logging for important actions

### Out of Scope for MVP

- Customer accounts and passwords
- Social login
- Loyalty points
- Delivery partner routing
- Multi-branch support
- Advanced analytics
- Subscription billing
- Complex commission routing

### Day-1 Product Requirements

- Restaurant onboarding must collect the full business and banking details needed for Razorpay setup
- Each table must have one QR code
- One active ordering session should control ordering for a table
- Menu images must remain available long enough for review and re-processing
- Admin order actions should stay minimal and focused

---

## 6. Product Rules

- Customers do not create accounts
- Admin authentication uses email and password
- QR sessions must be signed and tied to a restaurant and table
- Order totals are calculated on the server only
- Menu extraction must always be reviewable before publish
- Payment confirmation must rely on server-side verification, not client-side success screens
- Notification or OCR failures must not block core order placement

---

## 7. Payment Approach

For the MVP we will use **Razorpay Checkout + server-side webhook verification** with full merchant onboarding.

The backend will:

- Collect and store restaurant onboarding details required for payment activation
- Create a Razorpay order when the customer starts payment
- Verify payment completion using Razorpay webhooks
- Mark the order as paid only after webhook verification succeeds
- Support cash-at-counter as a non-gateway flow

For restaurant onboarding, the current MVP uses a full merchant onboarding flow inside the app so the user can complete everything without leaving the product.

---

## 8. Initial Build Priority

We will build in this order:

1. Backend foundation and shared patterns
2. Admin authentication
3. Restaurant profile and table setup
4. Menu CRUD
5. Menu image upload and OCR extraction review
6. Customer QR session and menu browsing
7. Cart and checkout
8. Razorpay payment flow
9. Order management and collections
10. Logging, hardening, and cleanup

---

## 9. Scope Boundaries

OrderXpress includes:

- Restaurant onboarding
- Menu extraction and review
- QR-based ordering
- Cart and checkout
- Razorpay payment verification
- Order management
- Notifications
- Collections and reporting
- Security controls and audit-ready architecture

OrderXpress does not include at this stage:

- Customer login accounts
- Marketplace-style multi-merchant payout routing
- Social auth
- Loyalty points
- Delivery partner routing
- Multi-restaurant marketplace behavior

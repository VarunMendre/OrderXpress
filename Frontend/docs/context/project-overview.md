# project-overview.md
# OrderXpress

**Document Type:** Project Overview  
**Audience:** AI Agents, Developers, Architects  
**Source of Truth:** This document plus `architecture.md`, `build-plan.md`, and `code-standards.md`  
**Status:** Active - Implementation Ready

---

## 1. What Is This Project?

OrderXpress is a full-stack restaurant ordering platform with two clients:

- **Admin mobile app** built in React Native
- **Customer web app** built in React

The admin creates a restaurant account, uploads a menu card image, reviews extracted menu items, publishes a QR code for each table, and manages orders and collections. Customers scan the QR code, view the restaurant menu, add items to cart, pay, place orders, and track current order status.

The platform is designed as a **microservices-based system** with clearly separated backend services for authentication, menu extraction, orders, payments, notifications, reporting, and observability.

---

## 2. Product Goals

OrderXpress exists to solve these restaurant problems:

- Manual menu entry is slow and error-prone
- Customers need a fast QR-based ordering flow
- Admins need live order visibility across tables
- Restaurants need date-wise collection reporting
- Payments, notifications, and order processing must remain stable during traffic spikes

---

## 3. Primary Users

### Admin

The admin is the restaurant owner or staff member who manages:

- Restaurant registration and login
- Menu upload and menu extraction review
- Menu edits and publishing
- QR code generation for tables
- Incoming orders and order detail views
- Daily and date-wise collections
- Settings such as restaurant name, bank details, password reset, and table count

### Customer

The customer is a guest scanning a QR code at a restaurant table. The customer can:

- Open the menu without creating an account
- View restaurant details
- Add items to cart
- Place and pay for orders
- Track current orders
- Optionally provide a mobile number for updates

---

## 4. Core Workflow

### Admin Flow

1. Admin registers with restaurant details, email, and password
2. Admin logs in
3. Admin uploads a physical menu card photo
4. The system extracts menu items and price variants
5. Admin reviews and edits the extracted menu
6. Admin publishes menu and generates QR codes for tables
7. Customers begin placing orders
8. Admin receives live order notifications
9. Admin reviews individual orders and daily collections
10. Admin updates settings and bank details when needed

### Customer Flow

1. Customer scans the QR code on the table
2. The app opens restaurant and table context
3. Customer browses the menu
4. Customer adds items to cart
5. Customer pays via Razorpay
6. The order is created and tracked
7. Admin receives the order in real time
8. Customer can continue tracking the order status

---

## 5. Major Product Rules

- Customers do not need personal accounts
- Admin authentication starts with email and password only
- QR codes should be signed, time-bound, and table-specific
- Customer-facing text must render as plain text, not HTML
- Orders must be idempotent and safe under retries
- Menu extraction must be reviewable before publishing
- Notification failures must not block order placement

---

## 6. Initial Build Priority

We will build in this order:

1. Admin mobile app
2. Shared backend services
3. Customer web app
4. Reporting, monitoring, and hardening

---

## 7. Scope Boundaries

OrderXpress includes:

- Restaurant onboarding
- Menu extraction and review
- QR-based ordering
- Cart and checkout
- Razorpay payments
- Order management
- Notifications
- Collections and reporting
- Security controls and audit-ready architecture

OrderXpress does not include at this stage:

- Customer login accounts
- Social auth
- Loyalty points
- Delivery partner routing
- Multi-restaurant marketplace behavior


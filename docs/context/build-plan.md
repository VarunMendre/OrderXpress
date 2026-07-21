# Build Plan

## Core Principle

Build OrderXpress in visible, testable slices. Each slice must have UI first, then logic, then validation, then edge-case handling.

---

## Phase 1 - Foundation

### 01 Repository and App Shell

- Set up monorepo or service folders
- Create environment structure
- Add shared types, shared validation, and shared UI tokens
- Establish base navigation and layout for admin mobile and customer web

### 02 Admin Authentication

- Admin registration with restaurant details
- Email and password login
- Session handling
- Password reset flow later

### 03 Admin Home and Restaurant Setup

- Restaurant profile screen
- Basic dashboard shell
- Table count setup
- Menu upload entry point

### 04 Menu Extraction Pipeline

- Upload menu image
- Extract text and structured price variants
- Show review screen
- Allow manual correction before publish

---

## Phase 2 - Admin Operations

### 05 Menu CRUD

- View menu categories
- Edit item names and variants
- Add or delete items
- Republish menu

### 06 QR Code Generation

- Generate QR per table
- Store signed session metadata
- Show printable and shareable QR view

### 07 Orders List

- Live order feed
- Filter by status, table, and time
- Open single order detail view

### 08 Single Order Details

- Order items
- Table info
- Payment status
- Timeline and status updates

### 09 Collections

- Daily collection dashboard
- Date-wise filter
- Summary totals

### 10 Settings

- Restaurant name
- Table count
- Bank details
- Password reset entry point

---

## Phase 3 - Customer Ordering

### 11 QR Landing and Menu View

- Load restaurant details from QR session
- Show menu
- Plain text rendering only

### 12 Cart and Checkout

- Add and remove items
- Calculate totals
- Apply taxes or charges if configured
- Enter optional mobile number

### 13 Razorpay Checkout

- Create payment order
- Confirm payment
- Verify webhook
- Create idempotent order record

### 14 Order Tracking

- Show current status
- Show previous active orders for the session
- Refresh safely without losing context

---

## Phase 4 - Hardening

### 15 Validation and Security

- Zod validation everywhere
- CSRF protection
- CSP and anti-clickjacking
- Rate limiting
- Duplicate request protection

### 16 Queue and Workers

- Queue order processing
- Queue notification fan-out
- Queue OCR processing
- Add retry policy and dead-letter handling

### 17 Observability

- Request logs
- Error logs
- Metrics
- Dashboards later


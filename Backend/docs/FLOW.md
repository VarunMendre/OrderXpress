# OrderXpress — Complete Platform Flow

> **Version:** 1.0  
> **Last Updated:** July 14, 2026  
> **Scope:** Full end-to-end walkthrough covering Admin and Customer journeys, including registration, menu management, QR generation, ordering, payment, collections, and order lifecycle.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Admin Flow — Full Lifecycle](#2-admin-flow--full-lifecycle)
   - 2.1 [Account Registration & Onboarding](#21-account-registration--onboarding)
   - 2.2 [Login & Authentication](#22-login--authentication)
   - 2.3 [Dashboard (Home)](#23-dashboard-home)
   - 2.4 [Menu Management](#24-menu-management)
   - 2.5 [Table Configuration & QR Code Generation](#25-table-configuration--qr-code-generation)
   - 2.6 [Real-time Order Management](#26-real-time-order-management)
   - 2.7 [Order Detail & Kitchen Workflow](#27-order-detail--kitchen-workflow)
   - 2.8 [Payment Handling (Admin Side)](#28-payment-handling-admin-side)
   - 2.9 [Collections & Reports](#29-collections--reports)
   - 2.10 [Settings & Account Management](#210-settings--account-management)
3. [Customer Flow — Full Journey](#3-customer-flow--full-journey)
   - 3.1 [Table Arrival & QR Scan](#31-table-arrival--qr-scan)
   - 3.2 [Welcome Screen & Order Type Selection](#32-welcome-screen--order-type-selection)
   - 3.3 [Menu Browsing & Category Navigation](#33-menu-browsing--category-navigation)
   - 3.4 [Cart Management](#34-cart-management)
   - 3.5 [Checkout & Order Details Entry](#35-checkout--order-details-entry)
   - 3.6 [Payment Method Selection](#36-payment-method-selection)
   - 3.7 [UPI / Card Payment Execution (Razorpay)](#37-upi--card-payment-execution-razorpay)
   - 3.8 [Cash Payment at Counter](#38-cash-payment-at-counter)
   - 3.9 [Order Confirmation & Success Screen](#39-order-confirmation--success-screen)
   - 3.10 [Order Tracking & Real-Time Status](#310-order-tracking--real-time-status)
   - 3.11 [Receiving the Order (Dine-In vs Takeaway)](#311-receiving-the-order-dine-in-vs-takeaway)
   - 3.12 [Post-Order / Re-ordering](#312-post-order--re-ordering)
4. [Complete Order State Machine](#4-complete-order-state-machine)
5. [Payment Flows & Statuses](#5-payment-flows--statuses)
6. [Notification System](#6-notification-system)
7. [Security & Data Flow](#7-security--data-flow)
8. [Database Collections Reference](#8-database-collections-reference)
9. [Glossary of Statuses & States](#9-glossary-of-statuses--states)

---

## 1. System Architecture Overview

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │                         ORDERXPRESS PLATFORM                        │
  ├────────────────────┬────────────────────┬───────────────────────────┤
  │                    │                    │                           │
  │   ADMIN PANEL      │   CUSTOMER APP     │   BACKEND API            │
  │   (React / Web)    │   (React / Web)    │   (Node.js + TS)         │
  │                    │                    │                           │
  │  ┌──────────────┐  │  ┌──────────────┐  │  ┌─────────────────────┐ │
  │  │ Dashboard    │  │  │ Welcome      │  │  │ Auth Service        │ │
  │  │ Orders       │  │  │ Menu Browse  │  │  │ Restaurant Service  │ │
  │  │ Menu CRUD    │  │  │ Cart         │  │  │ Menu Service        │ │
  │  │ Collections  │  │  │ Checkout     │  │  │ Order Service       │ │
  │  │ Settings     │  │  │ Track Order  │  │  │ Payment Service     │ │
  │  └──────┬───────┘  │  └──────┬───────┘  │  │ Notification Svc    │ │
  │         │          │         │           │  │ Reporting Svc       │ │
  │         │          │         │           │  │ Media/Storage Svc   │ │
  │         │          │         │           │  │ Audit Service       │ │
  │         │          │         │           │  └─────────┬───────────┘ │
  │         └──────────┴─────────┴───────────┘            │             │
  │                         │                             │             │
  │                         ▼                             ▼             │
  │              ┌─────────────────────┐       ┌──────────────────────┐ │
  │              │    MongoDB (Main)   │       │    Redis (Cache)     │ │
  │              │  - admins           │       │  - Sessions          │ │
  │              │  - restaurants      │       │  - Carts             │ │
  │              │  - tables           │       │  - Rate limiting     │ │
  │              │  - menu_items      │       │  - Queues            │ │
  │              │  - orders           │       │  - WebSocket pub/sub │ │
  │              │  - payments         │       └──────────────────────┘ │
  │              │  - notifications    │                                │
  │              │  - collections_daily│        ┌──────────────────────┐ │
  │              │  - audit_logs       │        │  Razorpay (Payment)  │ │
  │              └─────────────────────┘        └──────────────────────┘ │
  └─────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Customer auth | None (session-based via QR) | No barriers to ordering; QR = identity |
| Payment provider | Razorpay | Mature, UPI-native, Indian market leader |
| Payment truth | Webhook only | Only server-verified webhook confirms payment |
| Admin state | JWT in HttpOnly cookie | Protects against XSS token theft |
| Internal communication | Event-driven (pub/sub) | Decoupled services, async notifications |
| Primary DB | MongoDB (NoSQL) | Flexible schema for menu, orders, collections |
| Cache / Session | Redis | Fast session lookups, cart persistence, rate limiting |
| Menu OCR | AWS Textract / Google Document AI | Extract items from printed menu card photo |

---

## 2. Admin Flow — Full Lifecycle

### 2.1 Account Registration & Onboarding

#### Step 1: Restaurant Details
1. Admin navigates to OrderXpress web URL
2. Clicks **"Register / Sign Up"**
3. **Registration Form — Step 1 (Restaurant Details):**
   - **Restaurant Name** (required, string, 2–100 chars)
   - **Restaurant Address** (required, string, full address)
   - **Admin Full Name** (required, string)
   - **Admin Email** (required, valid email format, unique check server-side)
   - **Admin Phone** (required, 10-digit Indian mobile, validated with regex)
   - **Number of Tables** (required, integer, 1–999)
   - **Cuisine Type** (optional, dropdown: North Indian, South Indian, Chinese, Italian, etc.)
   - **GST Number** (optional, validated if provided)
4. Form validation with **Zod** on frontend + backend
5. On valid → proceed to **Step 2**

#### Step 2: Account Security
1. Email field (pre-filled from step 1, editable)
2. **Password** (required):
   - Minimum 8 characters
   - Must contain: uppercase, lowercase, digit, special character
   - Password strength meter (Weak / Medium / Strong)
   - Show/hide toggle
3. **Confirm Password** (must match)
4. Rate limit: max 3 registration attempts per IP per hour

#### Step 3: Verification
1. OTP sent to registered email (or phone via SMS)
2. Admin enters OTP (6-digit)
3. Backend verifies OTP
4. On success:
   - Account created in `admins` collection
   - Restaurant document created in `restaurants` collection
   - `tables` documents bulk-created (one per table count, names: "Table 01", "Table 02", …)
   - Session JWT generated, stored in HttpOnly cookie
   - Redirected to **Dashboard** (setup wizard optional)

#### Edge Cases
- **Email already exists** → Show error "An account with this email already exists. Please log in."
- **Weak password** → Block submission, show strength requirements
- **OTP expired** → "OTP expired. Request a new one." (resend button with 30s cooldown)
- **Network failure** → Retry with exponential backoff

---

### 2.2 Login & Authentication

#### Login Flow
1. Admin visits login page
2. Enter **Email** + **Password**
3. Frontend validates format
4. Backend:
   - Lookup admin by email in `admins` collection
   - Compare password hash (bcrypt, salt rounds: 12)
   - Generate JWT (payload: `{ adminId, restaurantId, email, iat, exp }`)
   - Set HttpOnly cookie (`Set-Cookie: session=<jwt>; HttpOnly; Secure; SameSite=Strict; path=/; max-age=86400`)
5. Redirect to Dashboard
6. Session lasts **24 hours** (configurable)

#### Additional Login Options (Future)
- **Google OAuth** — One-tap login with Google account
- **Passkey** — WebAuthn for passwordless login (Fingerprint / Face ID)

#### Security
- Rate limiting: 5 failed attempts → 15-min lockout
- Audit log on every login (success/failure, IP, user agent, timestamp)
- Session can be revoked by admin from Settings

#### Logout
1. Admin clicks Logout in Settings
2. Cookie cleared server-side
3. Session invalidated in Redis
4. Redirect to login page

#### Edge Cases
- **Forgot password** → "Forgot Password?" link → email OTP → reset form
- **Session expired mid-session** → Redirect to login on next API call (401 intercepted)
- **Concurrent sessions** → Allowed; each session tracked separately

---

### 2.3 Dashboard (Home)

#### Layout
- Top bar: Restaurant name, date/time, notification bell (with unread badge), profile avatar
- Four stat cards (horizontal scroll on mobile):
  - **Active Tables** (green) — number of tables with active customer sessions
  - **Orders Today** (blue) — count of orders placed today
  - **Revenue Today** (green) — total ₹ collected today (paid orders only)
  - **Average Rating** (gold) — aggregated customer rating (future feature)

#### Recent Orders Section
- List of last 10 orders with:
  - Order ID (#ORD-XXXX)
  - Table number
  - Status badge (color-coded)
  - Total amount
  - Time elapsed (e.g., "2 min ago")
- Tap/click → opens **Order Detail** modal/page

#### Quick Action Cards
- **Add Menu Item** → Opens Menu CRUD
- **Generate QR Codes** → Opens Settings > Tables > QR Generation
- **View Collections** → Opens Daily Collection page

#### Revenue Chart
- 7-day revenue line/bar chart (Chart.js)
- X-axis: days, Y-axis: ₹ amount
- Hover tooltips show exact amounts

#### Edge Cases
- **Zero orders day** → Empty state with illustration: "No orders yet. Share your QR codes!"
- **Low stock warning** → Banner: "3 menu items are out of stock. Update your menu."

---

### 2.4 Menu Management

#### Entry Points
- Dashboard quick action card
- Bottom nav → **Products** (mobile) / Sidebar → **Menu** (desktop)

#### Two Approaches to Add Items

##### A. Upload Menu Card Photo (OCR)
1. Admin taps **"Upload Menu Card"**
2. Camera / Gallery picker opens (mobile) or file upload (desktop)
3. Supported formats: JPEG, PNG, PDF (max 10 MB)
4. Image uploaded to backend → stored in `menu_images` collection
5. `MenuExtractionService` processes:
   - AWS Textract or Google Document AI extracts text
   - NLP parsing: identify item names, prices, categories
   - Confidence scoring per item
6. **Review Screen** displays extracted items grouped by detected category:
   ```
   ┌─────────────────────────────────────────┐
   │  Main Courses                            │
   │  ┌──────┬─────────────┬──────┬────────┐ │
   │  │ Img  │ Butter      │ ₹320 │ [Edit] │ │
   │  │      │ Chicken     │      │ [Del]  │ │
   │  ├──────┼─────────────┼──────┼────────┤ │
   │  │ Img  │ Dal Makhani │ ₹250 │ [Edit] │ │
   │  │      │             │      │ [Del]  │ │
   │  └──────┴─────────────┴──────┴────────┘ │
   │  ⚠️ "Paneer Tikka" — price not detected  │
   │     [Add Price: _____]                   │
   ├─────────────────────────────────────────┤
   │  Beverages                               │
   │  ┌──────┬─────────────┬──────┬────────┐ │
   │  │ Img  │ Mango Lassi │ ₹120 │ [Edit] │ │
   │  └──────┴─────────────┴──────┴────────┘ │
   │  + Add Manual Item  →  ┌─ ─ ─ ─ ─ ─┐   │
   │                          (dashed box)   │
   ├─────────────────────────────────────────┤
   │  [  Save & Publish  ]                   │
   └─────────────────────────────────────────┘
   ```
7. Admin can:
   - Edit name, price, category, description
   - Delete incorrectly extracted items
   - Add price for items where OCR failed ("Add Price" prompt)
   - Upload/replace image per item
8. **"Save & Publish"** → All items batch-inserted into `menu_items` collection
9. Previous menu items can be replaced or merged (option during publish)

##### B. Manual Add Item
1. Tap **"Add Item"** button (FAB on mobile, button on desktop)
2. **Form fields:**
   - **Image** (optional) — Upload from gallery/camera with preview; fallback to generic food icon
   - **Item Name** (required, max 100 chars, sanitized)
   - **Category** (required, dropdown): Starters | Mains | Drinks | Desserts | Combos
   - **Price** (required, numeric, > 0, max 99999)
   - **Description** (optional, max 300 chars)
   - **Available** (toggle, default ON)
   - **Vegetarian** (toggle badge: green dot for veg, red dot for non-veg)
   - **Variants** (optional): e.g., "Half ₹150 / Full ₹280" (name + price pairs)
3. On save:
   - Item created in `menu_items` with unique ID
   - Added to uncategorized if category selected
4. After save modal closes, item appears in grid

#### Menu Display
- 2-column grid on mobile, 3–4 columns on desktop
- Each card shows:
  - Image (or placeholder gradient with first letter)
  - Veg/Non-Veg indicator dot
  - Item name (truncated to 2 lines)
  - Category as small chip
  - Price in bold
  - Stock/Availability badge
  - Edit (pencil icon) and Delete (trash icon) buttons on hover/tap

#### Menu Search
- Search bar at top filters by item name or category (debounced 300ms)
- Real-time filtering without page reload

#### Edit Item
1. Tap Edit button on item card
2. Modal populates with existing values
3. Admin updates fields
4. Save → updates `menu_items` document

#### Delete Item
1. Tap Delete button
2. Confirmation modal: "Delete [Item Name]? This action cannot be undone."
3. Confirm → item removed from `menu_items`

#### Edge Cases
- **OCR low confidence** → Flag item with yellow warning, ask admin to verify
- **Duplicate detection** → If OCR extracts same item name twice, group as one and show count
- **Empty menu** → "Your menu is empty. Upload a menu card photo or add items manually."
- **Price too low/high** → Validation warning (e.g., "Price seems unusually low. Please confirm.")
- **Item in active orders** → Delete shows warning: "This item is in 3 active orders. Delete anyway?"

---

### 2.5 Table Configuration & QR Code Generation

#### Location: Settings > Manage Tables

#### Configure Tables
1. Admin sees current table list:
   ```
   ┌─────┬──────────────┬──────────┬───────────┐
   │  #  │ Table Name   │ Capacity │ QR Status │
   ├─────┼──────────────┼──────────┼───────────┤
   │  1  │ Table 01     │ 4        │ ✅ Active │
   │  2  │ Table 02     │ 4        │ ✅ Active │
   │  3  │ Table 03     │ 6        │ ❌ Not    │
   │     │              │          │   Gen.   │
   └─────┴──────────────┴──────────┴───────────┘
   ```
2. Actions:
   - **Add Table** — enter table name/number + capacity
   - **Edit** — rename table, change capacity
   - **Delete** — remove table (only if no active/pending orders)
   - **Bulk add** — "Add 5 tables starting from Table 11"

#### Generate QR Codes
1. Tap **"Generate QR Codes"** (per table or all tables)
2. Backend generates QR payload:
   ```json
   {
     "restaurantId": "rest_abc123",
     "branchId": "branch_001",
     "tableId": "tbl_012",
     "tableName": "Table 12",
     "sessionId": "sess_xyz789",
     "signedExpiry": 1720992000,
     "nonce": "rand_4f6a2b9c",
     "signature": "hmac_sha256_..."
   }
   ```
3. QR code rendered as SVG/PNG:
   - Restaurant logo in center
   - Table name below QR
4. Preview in expandable card
5. **"Download All as PDF"** button:
   - Generates A4 PDF with all table QRs in a grid layout
   - Each QR labeled with table name
   - Ready for print → laminate → place on tables

#### QR Session Behavior
- First scan → activates new customer session for that table
- Subsequent scans → resume existing session (same cart)
- Session auto-expires after configurable idle timeout (default: 30 min)
- Admin can manually revoke any session from settings
- Revoked sessions → customer sees "Session expired. Please ask staff for assistance."

#### Edge Cases
- **Table already has active session** → Show warning before regenerating QR
- **Regenerate QR** → Old QR invalidated, new one generated (old session unaffected until expiry)
- **Printer not available** → "Save PDF" option for offline printing
- **Table deleted after QR printed** → QR still valid? No — backend checks table exists

---

### 2.6 Real-time Order Management

#### Location: Bottom nav → **Orders**

#### Orders List View
- **Stats Overview Bar:**
  | Stat | Badge Color | Meaning |
  |---|---|---|
  | New Orders | Blue bg, white text | Orders placed but not yet accepted |
  | Preparing | Orange/Warning | In kitchen |
  | Ready | Green/Success | Ready to serve |
  | Revenue Today | Green | Total ₹ collected |

- **Order Cards:**
  ```
  ┌──────────────────────────────────────────┐
  │  Table 12     │ #ORD-3891   │ 2 min ago  │
  │  ─────────────────────────────────────── │
  │  Items: Butter Chicken, 2 Naan, Dal      │
  │  Amount: ₹540   │ Status: 🔵 New         │
  │  Payment: ⚡ UPI   │ [Update Status  →] │
  └──────────────────────────────────────────┘
  ```
- Each card shows:
  - Table number (or "Takeaway" for takeaway orders)
  - Order ID
  - Elapsed time
  - Item names (truncated with overflow count: "+2 more")
  - Total amount
  - Status badge (color-coded)
  - Payment method icon + status
  - "Update Status" button

#### Filtering & Search
- **Filter tabs**: All | New | Preparing | Ready | Completed | Cancelled
- **Search bar**: Search by Order ID or table number (debounced)
- **Sort**: Newest first / Oldest first / Amount (high-low)
- **Date range picker** (for historical orders)

#### Real-time Updates
- WebSocket connection (or Server-Sent Events fallback)
- New orders appear automatically without refresh
- Status changes reflected instantly
- Audio notification on new order (toggleable)
- Browser notification permission requested (optional)

#### Status Update Flow (per order)
1. Admin taps **"Update Status"** on an order card
2. Options shown (context-sensitive):
   - New → "Accept Order" → moves to `accepted`
   - Accepted → "Start Preparing" → moves to `preparing`
   - Preparing → "Mark Ready" → moves to `served`
   - Served → "Mark Paid" (if cash) / "Complete Order" (if already paid)
3. Each status change:
   - Updates `orders` collection
   - Emits event to customer via WebSocket
   - Creates notification
   - Logs to `audit_logs`

#### Edge Cases
- **Rapid status clicks** → Debounce / disable button during API call to prevent double-update
- **Order updated by another admin** → Real-time sync across admin sessions
- **Network failure during status update** → Queue locally, retry on reconnect

---

### 2.7 Order Detail & Kitchen Workflow

#### Location: Tap any order card → Order Detail view

#### Layout
```
┌──────────────────────────────────────────────┐
│  ← Back to Orders    #ORD-3891    🔵 New     │
├──────────────────────────────────────────────┤
│  Customer: Ravi Kumar                        │
│  Table: 12 (Dine-in)                         │
│  Time: 07:42 PM (22 min ago)                 │
├──────────────────────────────────────────────┤
│  Items (3)                                   │
│  ┌──────┬───────────────┬──────┬──────────┐ │
│  │ 🍛  │ Butter Chicken│  x2  │  ₹480    │ │
│  │ 🫓  │ Butter Naan   │  x3  │  ₹120    │ │
│  │ 🥤  │ Mango Lassi   │  x1  │  ₹120    │ │
│  └──────┴───────────────┴──────┴──────────┘ │
├──────────────────────────────────────────────┤
│  Subtotal:           ₹720                    │
│  Service Charge(10%): ₹72                    │
│  GST (18%):          ₹129.60                 │
│  ─────────────────────────────────────────── │
│  Total:              ₹921.60                 │
├──────────────────────────────────────────────┤
│  Payment:  UPI  |  Status: ✅ Paid           │
│  Payment ID: pay_razor_abc123                │
├──────────────────────────────────────────────┤
│  Kitchen Notes: "Extra spicy please"         │
├──────────────────────────────────────────────┤
│  Timeline                                    │
│  ✅ 07:40 PM — Order Received                │
│  ✅ 07:42 PM — Payment Confirmed (UPI)       │
│  ⏳ 07:45 PM — Moved to Kitchen              │
│  ⬜ Waiting for Service                      │
├──────────────────────────────────────────────┤
│  [  Preparing  ]  [  Served  ]  [  Paid  ]   │
│  [🖨 Print Receipt]  [🖨 Print KOT]          │
└──────────────────────────────────────────────┘
```

#### Sections

##### A. Customer & Order Info
- Customer name (from checkout)
- Table number (or "Takeaway" with pickup time)
- Order placed timestamp + elapsed duration

##### B. Itemized Order List
- Each item: image thumbnail, name, quantity, unit price, line total
- Subtotal, service charge (10%), GST (18%), grand total
- Veg/non-veg indicator on each item

##### C. Payment Details
- Payment method (UPI / Card / Cash) with icon
- Payment status badge
- Payment gateway transaction ID (if online)
- Refund option (if eligible)

##### D. Kitchen Notes
- Special instructions entered by customer during checkout
- Empty state: "No special instructions"

##### E. Order Timeline
- Vertical timeline with icons:
  - 🟢 Completed steps (green check)
  - 🟡 Current step (orange spinner)
  - ⚪ Future steps (grey circle)
- Steps: Order Received → Payment Confirmed → Moved to Kitchen → Preparing → Ready for Service → Served

##### F. Action Buttons
- **Preparing** — signals kitchen to start
- **Served** — marks food delivered to table
- **Paid** — (for cash orders) confirms cash collected
- **Print Receipt** — generates printable bill (itemized, with GST, restaurant details)
- **Print KOT** (Kitchen Order Ticket) — prints simplified version for chefs

#### Edge Cases
- **Order modification requested** → "Modify" button (future feature): adds new items to existing order
- **Partial cancellation** → Admin can void specific line items (with reason)
- **Order with no items** → Should never occur; validation prevents empty orders

---

### 2.8 Payment Handling (Admin Side)

#### Overview by Payment Method

| Method | Flow | Admin Action Required | Order Status After Payment |
|---|---|---|---|
| **UPI** | Razorpay checkout → Customer pays → Webhook confirms | None (auto) | `pending_payment` → `paid` |
| **Card** | Razorpay checkout → Customer enters card → Webhook confirms | None (auto) | `pending_payment` → `paid` |
| **Net Banking** | Razorpay checkout → Customer selects bank → Webhook confirms | None (auto) | `pending_payment` → `paid` |
| **Cash** | Order placed without online payment | Admin must manually mark as `paid` | `pending_payment` (until admin acts) |

#### UPI / Card / Net Banking — Auto Flow
1. Customer completes payment via Razorpay
2. Razorpay sends **webhook** to backend (`POST /api/payments/webhook`)
3. Backend:
   - Verifies webhook signature (Razorpay secret key)
   - Checks idempotency (skip if already processed)
   - Updates `payments` document: status → `completed`, `razorpayPaymentId`, `razorpaySignature`, verified timestamp
   - Updates `orders` document: `status` → `paid`, `paymentStatus` → `completed`
   - Publishes event: `order.payment_confirmed`
4. Customer sees: success screen with green checkmark
5. Admin sees: order badge turns green "Paid"

#### Cash — Manual Flow
1. Customer selects "Cash" and places order
2. Order saved with `paymentStatus: "pending"`, `orderStatus: "pending_payment"`
3. Admin sees order with badge: **"Cash Pending"** (yellow/amber)
4. Kitchen receives order and starts preparing
5. Customer eats, then goes to counter to pay
6. Admin collects cash, taps **"Mark as Paid"** in order detail
7. Confirmation modal: "Confirm ₹921 received in cash?"
8. On confirm: `paymentStatus` → `completed`, `orderStatus` → `paid`
9. Receipt printed if needed

#### Refund Handling
1. Admin taps **"Refund"** on a paid order
2. Reason required: "Customer cancelled", "Wrong item", "Other"
3. For UPI/Card: Razorpay refund API called (`POST /api/payments/refund`)
4. For Cash: manual refund (admin gives cash back)
5. `payments.status` → `refunded`, `orders.status` → `cancelled`
6. Audit log entry created

#### Edge Cases
- **Webhook timeout/delivery failure** → Razorpay retries (up to 24hrs); backend idempotent
- **Payment amount mismatch** → Webhook amount compared with order amount; alert if mismatch
- **Double webhook** → Idempotency key prevents double-processing
- **Cash payment never collected** → "Pending Cash" warning on admin dashboard for stale orders
- **Payment failed (insufficient funds, card declined)** → Customer sees error → can retry or switch method
- **Razorpay down** → Graceful degradation: show "Payment gateway temporarily unavailable. Try cash."

---

### 2.9 Collections & Reports

#### Location: Bottom nav → **Collection** (or Reports)

##### A. Daily Collection (Today's Summary)
```
┌──────────────────────────────────────────────┐
│  📅 Today — July 14, 2026                    │
├──────────────────────────────────────────────┤
│  💰 Total Revenue:  ₹12,450                  │
│  📦 Total Orders:  42                        │
│  ┌────────────────┬──────────┬─────────────┐ │
│  │ Dine-in: 28    │ Takeaway: 12  │ Del.: 2 │ │
│  ├────────────────┴──────────┴─────────────┤ │
│  │ Payment Mix                              │ │
│  │ 🟦 UPI: ₹8,450  (28 orders, 67.9%)      │ │
│  │ 🟩 Card: ₹2,800 (9 orders, 22.5%)       │ │
│  │ 🟧 Cash: ₹1,200  (5 orders, 9.6%)       │ │
│  └────────────────────────────────────────── ┘ │
├──────────────────────────────────────────────┤
│  ⏰ Peak Traffic Chart (hourly bar chart)    │
│  12  1   2   3   4   5   6   7   8   9  10  │
│  ██  █   ██  █   █   █   ███ ████ ██  █   │
│  2   1   3   1   1   1   5   8    3   1    │
├──────────────────────────────────────────────┤
│  Recent Transactions (last 10)               │
│  ┌────────┬──────┬────────┬───────┬───────┐ │
│  │ Order  │Table │ Status │ ₹     │ Time  │ │
│  ├────────┼──────┼────────┼───────┼───────┤ │
│  │ #3895  │ 12   │ ✅ Paid│ 540   │ 7:42  │ │
│  │ #3894  │ 05   │ ⏳ Open│ 320   │ 7:38  │ │
│  │ #3893  │ TW   │ ✅ Done│ 210   │ 7:35  │ │
│  └────────┴──────┴────────┴───────┴───────┘ │
│  ┌────────────────────────────────────────┐  │
│  │ [View Full Report →]                   │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

##### B. Historical Reports (by Date)
1. Admin selects date range using date picker (from, to)
2. Loads collection data for that period
3. **Displays:**
   - Total collection
   - Total orders (with dine-in / takeaway split)
   - Average order value
   - Peak hours across the period
   - Payment mix trend (percentage over time)
   - Full transaction table (paginated, 20 per page)
     - Columns: Order ID | Table | Customer | Items | Amount | Payment Method | Status | Time
   - Sortable by any column
   - Searchable by Order ID or Table
4. **Export options:**
   - **Export as PDF** — formatted report with restaurant header, date range, summary stats, transactions
   - **Export as CSV** — raw data for Excel/Google Sheets (UTF-8 with BOM for Excel compatibility)

#### Edge Cases
- **No orders on selected date** → Empty state: "No orders on this date."
- **Future date selected** → Validation: "Cannot select a future date."
- **Large dataset (>10,000 orders)** → Server-side pagination + export in chunks
- **Export in progress** → Loading spinner; async email option for very large exports

---

### 2.10 Settings & Account Management

#### Location: Bottom nav → **Settings**

#### Sections

##### A. Profile Summary
- Admin avatar (editable, with upload)
- Admin name
- Restaurant name
- Email (verified badge)
- Phone (verified badge)

##### B. Restaurant Details
- Edit Restaurant Name
- Edit Restaurant Address
- Edit Cuisine Type
- Edit GST Number
- Upload/Change restaurant logo

##### C. Payment Info
- **Bank Account Details:**
  - Account holder name
  - Account number (masked on display, full on edit)
  - IFSC code
  - Bank name
- **UPI ID** (e.g., `restaurant@paytm` or `restaurant@upi`)
- Razorpay merchant ID (read-only)

##### D. Manage Tables
- Table list (same as section 2.5)
- Add / Edit / Delete tables
- Capacity per table
- QR code preview + regenerate per table

##### E. Staff Management (Future)
- Add staff accounts (limited permissions)
- Roles: Kitchen (can only view orders menu), Billing (can view orders + payments), Admin (full access)

##### F. Notifications
- Toggle: New order sound
- Toggle: Browser push notifications
- Toggle: Email reports (daily summary)

##### G. Dark Mode
- Toggle switch
- Prefers-color-scheme detected on first visit
- Persisted in localStorage + user preferences in DB

##### H. Change Password
- Current password → New password → Confirm password
- Same strength rules as registration
- On success: "Password changed successfully. Please log in again."
- All active sessions invalidated except current one

##### I. Logout
- Confirmation modal: "Are you sure you want to log out?"
- On confirm: clear cookie, redirect to login

##### J. Help & Support
- FAQ section
- Contact support (email link: `support@orderxpress.app`)
- App version
- Terms of Service / Privacy Policy links

#### Edge Cases
- **Unsaved changes** → "You have unsaved changes. Discard?" on navigate away
- **Table deletion with active orders** → "Cannot delete Table 12: 2 active orders. Cancel orders first."
- **Bank details validation** → IFSC format, account number length validated with regex

---

## 3. Customer Flow — Full Journey

### 3.1 Table Arrival & QR Scan

#### Physical Setup
- Each table has a **QR code** on a stand, sticker, or acrylic holder
- QR code is unique per table (generated by admin)
- QR printed on the laminated card / acrylic display

#### Scanning Process
1. Customer sits at table
2. Opens phone camera (iOS Camera, Google Camera, or any QR scanner)
3. Points camera at QR code
4. Phone recognizes QR → shows notification with URL
5. Customer taps notification → opens default browser

#### URL & Session Handling
- QR encodes URL: `https://orderxpress.app/r/<restaurantSlug>?table=<tableId>&session=<sessionId>`
- On load, browser:
  1. Extracts `tableId` and `sessionId` from URL
  2. Calls `GET /api/sessions/validate?sessionId=xxx&tableId=xxx`
  3. Backend validates:
     - Session exists and not expired
     - Session not revoked
     - Signature matches (HMAC)
     - `tableId` belongs to `restaurantId`
  4. If valid → proceed to Welcome screen
  5. If invalid → error screen: "This QR code is no longer valid. Please ask staff for assistance."

#### Edge Cases
- **QR scan from home (not at restaurant)** → Allowed; session bound to table, not location
- **Session expired** → Show "Session expired. Please scan the QR code again."
- **QR damaged/unreadable** → "Could not read QR. Please ask staff for a new QR."
- **Multiple scans of same QR** → Returns to same session (cart preserved)
- **Internet required** → Show offline page: "Please connect to the internet to order."

---

### 3.2 Welcome Screen & Order Type Selection

#### Screen Layout
```
┌──────────────────────────────────────────────┐
│                                              │
│              [Restaurant Logo]               │
│                                              │
│         Welcome to [Restaurant Name]         │
│                                              │
│              🔲 Table 12                     │
│                                              │
│     ┌──────────────────────────────┐         │
│     │    🍽️   Dine In              │         │
│     ├──────────────────────────────┤         │
│     │    📦   Take Away            │         │
│     └──────────────────────────────┘         │
│                                              │
│         Powered by OrderXpress               │
└──────────────────────────────────────────────┘
```

#### Flow
1. Table number displayed prominently
2. Two buttons:
   - **Dine In** (primary, suggested for table-scan)
   - **Take Away** (secondary)
3. Customer selects their order type:
   - **Dine In** — selected by default if scanned QR; table number pre-bound to order
   - **Take Away** — customer can order for takeaway even while seated
4. On selection → navigate to Menu page
5. Order type stored in customer session (`session.orderType`)

#### Edge Cases
- **Session already has items in cart from previous interaction** → Cart restored, badge shows item count
- **Table transferred to new customer** → Admin can reset session; old cart discarded

---

### 3.3 Menu Browsing & Category Navigation

#### Screen Layout
```
┌──────────────────────────────────────────────┐
│  ← [Restaurant Name]         🛒 3 items      │
├──────────────────────────────────────────────┤
│  Categories (sticky scroll)                  │
│  ┌──────┬──────┬──────┬──────┬──────┐       │
│  │ All  │ Start│ Mains│ Drks │ Dess │       │
│  └──────┴──────┴──────┴──────┴──────┘       │
├──────────────────────────────────────────────┤
│  Menu Items (scrollable grid)               │
│  ┌──────────────┐  ┌──────────────┐         │
│  │ 🍛           │  │ 🫓           │         │
│  │ Butter       │  │ Garlic       │         │
│  │ Chicken      │  │ Naan         │         │
│  │ ₹320        │  │ ₹40          │         │
│  │ 🟢 Veg       │  │ 🔴 Non-Veg   │         │
│  │ [ + Add ]    │  │ [ + Add ]    │         │
│  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐         │
│  │ 🥤           │  │ 🍰           │         │
│  │ Mango Lassi  │  │ Gulab        │         │
│  │ ₹120         │  │ Jamun        │         │
│  │ 🟢 Veg       │  │ 🟢 Veg       │         │
│  │ [ + Add ]    │  │ [ + Add ]    │         │
│  └──────────────┘  └──────────────┘         │
├──────────────────────────────────────────────┤
│  CTA Bar (slides up when items in cart)      │
│  ┌──────────────────────────────────────┐    │
│  │ 🛒 3 items  │  ₹480         [View →] │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

#### Interaction Details

##### Category Tabs
- Sticky at top of item list
- **"All"** tab (default) shows items from all categories
- Tapping a category filters grid to that category only
- Active tab underlined/highlighted
- Each tab shows item count (e.g., "Mains (12)")
- Categories with no items (after admin filtering) show "(0)" and are grayed
- Horizontal scrollable if more than 5 categories

##### Menu Items Grid
- 2-column layout (3 on larger screens)
- Each card:
  - **Image** — uploaded photo or gradient placeholder with first letter
  - **Veg/Non-Veg indicator** — green diamond (🟢) or red diamond (🔴)
  - **Item name** — bold, max 2 lines with ellipsis
  - **Description** — small text, max 1 line
  - **Price** — ₹ formatted
  - **Add button** — primary colored, or quantity selector if already in cart

##### Add to Cart Flow
1. Tap **"+ Add"** on item
2. Item added to cart with quantity 1
3. Button transforms to quantity selector:
   ```
   [ - ]  1  [ + ]
   ```
4. Cart count in header badge increments
5. Bottom CTA bar slides up (if not already visible) showing item count + total
6. **Animation**: item image flies to cart icon (micro-interaction)

##### Quantity Controls
- **+** → increment by 1 (max: 99 or stock limit)
- **-** → decrement by 1; at 1, pressing `-` removes item entirely
- Quantity reflects in cart badge and CTA total
- Items with variants: tap Add → variant selector modal first:
  ```
  ┌──────────────────────────────────────┐
  │  Butter Chicken                      │
  │  Select a variant:                   │
  │  ○ Half (₹180)                       │
  │  ● Full (₹320)                       │
  │  [  Add to Cart  ]                   │
  └──────────────────────────────────────┘
  ```

##### CTA Bar (Bottom)
- Hidden when cart is empty
- Slides up with animation when first item added
- Shows:
  - 🛒 icon + item count ("3 items")
  - Subtotal total ("₹480")
  - **"View Cart →"** button (or **"Place Order"** if on cart page)
- Tapping navigates to Cart page

#### Edge Cases
- **Item out of stock** → Show "Sold Out" badge, Add button disabled
- **Item with no image** → Generic food icon based on category
- **Long item names** → Truncated with "..." on 2 lines; full name in tooltip
- **Rapid tap on Add** → Debounced to prevent double-add
- **Max cart limit** → Configurable (default 50 items); show warning

---

### 3.4 Cart Management

#### Screen Layout
```
┌──────────────────────────────────────────────┐
│  ← Menu              🛒 Your Order          │
├──────────────────────────────────────────────┤
│  🍽️ Dine In  ·  Table 12                    │
├──────────────────────────────────────────────┤
│  Items (3)                                   │
│  ┌──────┬──────────────┬──────┬────────────┐│
│  │ 🍛  │ Butter       │ - 2 +│ ₹640       ││
│  │     │ Chicken      │      │            ││
│  ├──────┼──────────────┼──────┼────────────┤│
│  │ 🫓  │ Butter Naan  │ - 3 +│ ₹120       ││
│  ├──────┼──────────────┼──────┼────────────┤│
│  │ 🥤  │ Mango Lassi  │ - 1 +│ ₹120       ││
│  └──────┴──────────────┴──────┴────────────┘│
├──────────────────────────────────────────────┤
│  Special Instructions:                       │
│  ┌──────────────────────────────────────┐   │
│  │ Extra spicy please                   │   │
│  └──────────────────────────────────────┘   │
├──────────────────────────────────────────────┤
│  Subtotal:                         ₹880     │
│  GST (18%):                       ₹158.40   │
│  ─────────────────────────────────────────  │
│  Total:                         ₹1,038.40   │
├──────────────────────────────────────────────┤
│  [        Proceed to Checkout       ]        │
└──────────────────────────────────────────────┘
```

#### Functionality

##### A. Order Type Badge
- Displays current order type: "Dine In · Table 12" or "Take Away"
- Customer can change order type here (confirmation: "Changing to Takeaway will remove table assignment. Continue?")
- Changing type clears table-specific data but preserves items

##### B. Item List
- Each item row:
  - Image thumbnail (or category icon)
  - Item name
  - Quantity controls (-/+) — same behavior as menu
  - Line total (price × quantity)
  - Swipe left to delete item with "Remove" action (mobile)
- Delete button (trash icon) per item → confirmation toast: "Item removed"

##### C. Special Instructions
- Textarea per order (not per item in v1)
- Placeholder: "Any special requests for the kitchen?"
- Max 200 characters
- Sanitized to plain text (no HTML)

##### D. Price Summary
- **Subtotal** — sum of all line items
- **GST (18%)** — configurable tax rate
- **Total** — subtotal + taxes
- All amounts formatted as ₹XX,XXX.XX

##### E. Empty Cart State
- If all items removed → show:
  ```
  ┌──────────────────────────────────────────────┐
  │  Your cart is empty                          │
  │  🛒                                         │
  │  Looks like you haven't added anything yet   │
  │  [  Browse Menu  ]                           │
  └──────────────────────────────────────────────┘
  ```

##### F. Proceed to Checkout
- Button at bottom
- Disabled if cart is empty
- On tap → navigate to Checkout page

#### Edge Cases
- **Cart persistence** → Cart synced to Redis on every change; survives page refresh
- **Session timeout** → On restore, cart loaded from backend (not just localStorage)
- **Price change while in cart** → On checkout, current price fetched; if changed, show alert
- **Item deleted by admin while in cart** → On checkout: "Sorry, [item] is no longer available." Removed from cart.

---

### 3.5 Checkout & Order Details Entry

#### Screen Layout
```
┌──────────────────────────────────────────────┐
│  ← Cart              Checkout               │
├──────────────────────────────────────────────┤
│  Order Summary                               │
│  ┌──────────────────────────────────────┐   │
│  │ 🍛 Butter Chicken x2        ₹640    │   │
│  │ 🫓 Butter Naan x3           ₹120    │   │
│  │ 🥤 Mango Lassi x1           ₹120    │   │
│  ├──────────────────────────────────────┤   │
│  │ Subtotal                     ₹880    │   │
│  │ GST (18%)                    ₹158.40 │   │
│  │ Total                      ₹1,038.40 │   │
│  └──────────────────────────────────────┘   │
├──────────────────────────────────────────────┤
│  Your Details                                │
│  Name * ┌──────────────────────────────┐    │
│         │ Enter your name              │    │
│         └──────────────────────────────┘    │
│  Table  ┌──────────────────────────────┐    │
│  Number │ 12              (auto-filled) │    │
│         └──────────────────────────────┘    │
│  Special Notes                              │
│  ┌──────────────────────────────────────┐   │
│  │ Extra spicy please                   │   │
│  └──────────────────────────────────────┘   │
├──────────────────────────────────────────────┤
│  [       Place Order — ₹1,038.40      ]      │
└──────────────────────────────────────────────┘
```

#### Fields

##### A. Order Summary (collapsible)
- Item list read-only
- Subtotal, GST, Total
- Tap to expand/collapse

##### B. Customer Name (required)
- Text input, max 50 chars
- Validated: non-empty, no special characters
- Used for order identification by admin
- Placeholder: "Enter your name"

##### C. Table Number (dine-in) / Pickup Time (takeaway)
- **Dine-in**: Table number pre-filled from QR, read-only (or editable for wrong-table scenarios)
- **Takeaway**: "Pickup Time" selector:
  - Options: "As soon as possible" or specific time (15-min increments)
  - Shown estimated ready time: "Ready by 8:15 PM"

##### D. Special Notes (optional)
- Pre-filled from cart page
- Editable textarea, max 200 chars
- "Any special requests for the kitchen?"

#### Validation
- **Name**: required, 2–50 chars, alphabets + spaces only
- **Table Number** (dine-in): auto-filled, valid table check on backend
- **Pickup Time** (takeaway): must be in the future (within restaurant hours)
- **Cart not empty**: validated
- **Menu items still available**: checked on submit

#### Submit
- Button text: **"Place Order — ₹X,XXX.XX"**
- On tap:
  1. Frontend validates all fields
  2. Shows loading state on button (spinner + "Placing order…")
  3. `POST /api/orders` called with payload:
     ```json
     {
       "sessionId": "sess_abc123",
       "tableId": "tbl_012",
       "customerName": "Ravi Kumar",
       "orderType": "dine-in",
       "items": [
         { "itemId": "item_001", "quantity": 2, "price": 320, "name": "Butter Chicken" },
         { "itemId": "item_005", "quantity": 3, "price": 40, "name": "Butter Naan" },
         { "itemId": "item_012", "quantity": 1, "price": 120, "name": "Mango Lassi" }
       ],
       "subtotal": 880,
       "tax": 158.40,
       "total": 1038.40,
       "specialNotes": "Extra spicy please",
       "idempotencyKey": "order_1720992000_sess_abc123"
     }
     ```
  4. Backend:
     - Validates all items exist and are available
     - Validates prices match current menu prices
     - Checks idempotency (prevents duplicate submission)
     - Creates order document (status: `draft`)
     - Returns order ID + redirect to payment selection

#### Edge Cases
- **Idempotency hit** → "Order already placed. Redirecting to payment…" (no duplicate charge)
- **Item price changed** → Alert: "Butter Chicken price has changed from ₹320 to ₹340. Updated total: ₹1,078.40"
- **Item no longer available** → "Butter Naan is no longer available. Please remove it from your cart."
- **Cart modified in another tab** → Sync on submit; show updated cart if changed
- **Network failure on submit** → Retry on reconnect; idempotency prevents duplicates
- **Table number invalid** → "This table number is not valid. Please ask staff for assistance."

---

### 3.6 Payment Method Selection

#### Screen Layout
```
┌──────────────────────────────────────────────┐
│  ← Checkout            Payment              │
├──────────────────────────────────────────────┤
│  Order #ORD-3891                             │
│  Total: ₹1,038.40                            │
├──────────────────────────────────────────────┤
│  Choose Payment Method                       │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  📱  Online Payment (UPI)           │   │
│  │      Pay via UPI apps: GPay,        │   │
│  │      PhonePe, Paytm                 │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  💳  Card Payment                    │   │
│  │      Credit / Debit Card             │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  🏦  Net Banking                     │   │
│  │      All major banks                 │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  💵  Cash (Pay at Counter)          │   │
│  │      Pay when food arrives or at    │   │
│  │      the counter                     │   │
│  └──────────────────────────────────────┘   │
├──────────────────────────────────────────────┤
│  🛡️ SECURE END-TO-END ENCRYPTED CHECKOUT    │
└──────────────────────────────────────────────┘
```

#### Payment Methods

##### 1. Online Payment — UPI
- **Icon**: 📱 (smartphone with UPI logo)
- **Description**: "UPI (GPay, PhonePe, Paytm)"
- **Flow**: Opens Razorpay checkout → Shows UPI QR → Customer pays → Success

##### 2. Online Payment — Card
- **Icon**: 💳 (credit card)
- **Description**: "Credit / Debit Card"
- **Flow**: Opens Razorpay checkout → Card form → Customer enters details → OTP → Success

##### 3. Online Payment — Net Banking
- **Icon**: 🏦 (bank building)
- **Description**: "All major banks"
- **Flow**: Opens Razorpay checkout → Bank list → Redirect to bank → Login → Success

##### 4. Cash
- **Icon**: 💵 (cash note)
- **Description**: "Pay at Counter"
- **Flow**: No online payment → Order placed as `pending_payment` → Admin collects cash later

#### Behavior
- Each method is a tappable card with radio-style selection
- Selected method highlighted with border/accent color
- After selection, customer taps **"Proceed to Pay"** (for online) or **"Place Order"** (for cash)
- Secure checkout footer with padlock icon

---

### 3.7 UPI / Card Payment Execution (Razorpay)

#### Flow
1. Customer selects **UPI**, **Card**, or **Net Banking**
2. Taps **"Proceed to Pay"**
3. Frontend calls `POST /api/payments/create-order`
4. Backend:
   - Updates order: `orderStatus` → `pending_payment`
   - Creates `payments` document with `status: "initiated"`
   - Calls Razorpay API: `razorpay.orders.create({ amount_in_paise, currency: "INR", receipt: orderId })`
   - Returns `razorpayOrderId`, `razorpayKeyId`, `amount`, `prefill` (customer name, phone)
5. Frontend opens **Razorpay Checkout Modal**:
   - Pre-filled: customer name, email (if available)
   - Payment method select: UPI / Card / Net Banking
   - UPI: enters UPI ID or scans QR shown on screen
   - Card: card number, expiry, CVV → OTP
   - Net Banking: selects bank → redirected to bank login
6. Customer completes payment
7. Razorpay triggers callbacks:
   - **On success** (`payment.razorpay_payment_id` received):
     - Frontend shows success
     - Wait for webhook confirmation
   - **On failure**:
     - Frontend shows error: "Payment failed. Please try again."
     - Option to retry with same or different method
8. Backend webhook (`POST /api/payments/webhook`):
   - Razorpay sends: `event: "payment.captured"`, payload with `order_id`, `payment_id`, `amount`, `signature`
   - Backend verifies HMAC signature
   - Checks idempotency (if already processed → return 200 OK)
   - Updates:
     - `payments.status` → `completed`
     - `payments.razorpayPaymentId` → set
     - `payments.razorpaySignature` → set
     - `payments.completedAt` → timestamp
     - `orders.paymentStatus` → `completed`
     - `orders.orderStatus` → `paid`
   - Publishes event: `order.payment_confirmed`

#### Idempotency
- `idempotencyKey` in `payments` collection (unique index)
- Webhook processing checks: "Has this Razorpay order ID already been processed?"
- Prevents double charge on webhook retry

#### Timeout
- Razorpay checkout modal auto-closes after 10 minutes
- On timeout → order remains `pending_payment` → customer can try again from order tracking page

#### Edge Cases
- **Payment started but modal closed** → Order in `pending_payment` state; customer can resume from track page
- **Bank declined** → Show decline reason (insufficient funds, card not supported, etc.)
- **Network lost during payment** → Razorpay handles retry; webhook will eventually arrive
- **Payment amount mismatch** → If webhook amount ≠ order total → raise alert, manual intervention
- **Razorpay down** → Show "Payment gateway temporarily unavailable. Please try cash."

---

### 3.8 Cash Payment at Counter

#### Flow
1. Customer selects **Cash**
2. Taps **"Place Order"**
3. Backend:
   - Creates order with `orderStatus: "pending_payment"` and `paymentMethod: "cash"`
   - Updates `payments`: `status: "pending"`, `method: "cash"`
   - Publishes event: `order.created` (with pending payment flag)
4. Customer sees success screen: **"Order Placed! You can pay by cash at the counter."**
5. Admin side:
   - New order appears in orders list with **"Cash Pending"** badge (amber)
   - Kitchen receives order (starts preparing)
6. Customer eats, finishes meal
7. Customer walks to counter to pay
8. Admin:
   - Finds order (by table number or order ID)
   - Opens order detail
   - Collects cash amount
   - Taps **"Mark as Paid"**
   - Confirms: "Confirm ₹1,038.40 received in cash?"
   - On confirm → payment marked completed

#### Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Customer leaves without paying | Admin checks payment status before letting customer go |
| Wrong amount collected | Amount displayed clearly on order detail; receipt printed for verification |
| Stale pending payments | Dashboard shows "Unpaid Orders" alert if cash orders > 30 min old |

---

### 3.9 Order Confirmation & Success Screen

#### Screen Layout
```
┌──────────────────────────────────────────────┐
│                                              │
│              ✅                              │
│                                              │
│         Order Placed!                        │
│                                              │
│         #ORD-3891                            │
│                                              │
│     ┌──────────────────────────────┐         │
│     │  ⏱️ Estimated ready time     │         │
│     │      8:15 PM                 │         │
│     └──────────────────────────────┘         │
│                                              │
│     🍽️ Dine In  ·  Table 12                 │
│                                              │
│     💳 Payment: UPI — ✅ Paid                │
│     (or) 💵 Cash — ⏳ Pay at Counter         │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │        Track Order                   │    │
│  ├──────────────────────────────────────┤    │
│  │        Back to Menu                  │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  OrderXpress                                 │
└──────────────────────────────────────────────┘
```

#### Details
- Large checkmark animation (scale + fade in)
- Order ID displayed prominently
- Estimated ready time (calculated from average prep time × item count)
- Order type + table
- Payment status (Paid / Pending)
- Two buttons:
  - **"Track Order"** → Navigates to tracking page
  - **"Back to Menu"** → Continue browsing (for additional orders)

#### Email/SMS (Future)
- If customer provided phone number → SMS confirmation sent
- "Your order #ORD-3891 from [Restaurant] has been placed. Ready by 8:15 PM."

---

### 3.10 Order Tracking & Real-Time Status

#### Screen Layout
```
┌──────────────────────────────────────────────┐
│  ← Menu           Track Order               │
├──────────────────────────────────────────────┤
│  Order #ORD-3891                             │
├──────────────────────────────────────────────┤
│  Status Timeline                             │
│                                              │
│  ✅ Order Confirmed                          │
│     07:40 PM                                 │
│      ┃                                       │
│      ┃                                       │
│  ✅ Payment Confirmed (UPI)                  │
│     07:42 PM                                 │
│      ┃                                       │
│      ┃                                       │
│  🔄 Preparing                                │
│     07:48 PM  (Current)                      │
│      ┃                                       │
│      ┃                                       │
│  ⏳ Ready for Table                          │
│     Estimated: 08:15 PM                      │
│      ┃                                       │
│      ┃                                       │
│  ⏳ Served                                   │
│     (Waiting)                                │
│                                              │
├──────────────────────────────────────────────┤
│  Order Summary                               │
│  🍛 Butter Chicken x2               ₹640    │
│  🫓 Butter Naan x3                  ₹120    │
│  🥤 Mango Lassi x1                  ₹120    │
│  ───────────────────────────────────         │
│  Total: ₹1,038.40                            │
├──────────────────────────────────────────────┤
│  Table Location: Table 12                    │
│  (Near the window, 2nd floor)                │
├──────────────────────────────────────────────┤
│  [Order More]       [View Receipt]           │
└──────────────────────────────────────────────┘
```

#### Real-Time Updates
- WebSocket connection (or SSE fallback)
- Status updates appear immediately:
  - Order Confirmed → ✅
  - Paid → ✅
  - Preparing → 🔄 (animated spinner)
  - Ready → ✅
  - Served → ✅
  - Completed → 🎉
- Each step shows timestamp
- Estimated time for remaining steps (dynamically updated)

#### Actions
- **Order More** — Goes back to menu; current order remains active (customer can have multiple orders)
- **View Receipt** — Opens printable receipt with full breakdown

#### Edge Cases
- **Multiple orders from same table** → Each order tracked separately; tabbed view
- **Long prep time** → Estimated time shows "Delayed" with apology if past ETA
- **Order cancelled by admin** → Red "Order Cancelled" status; reason shown

---

### 3.11 Receiving the Order (Dine-In vs Takeaway)

#### Dine-In
1. Kitchen prepares food
2. Admin marks order as **"Ready"** in admin panel
3. Customer tracker updates: "Ready for Table" ✅
4. Staff brings food to the table
5. Staff checks order items (name, table number)
6. Customer receives food
7. Admin marks order as **"Served"**
8. Customer sees "Served" ✅ on tracker

#### Takeaway
1. Customer waits at counter or in waiting area
2. Kitchen prepares food
3. Admin marks **"Ready"**
4. Customer tracker: "Ready for Pickup" ✅
5. Staff calls out order number (or sends notification)
6. Customer approaches counter
7. Customer collects order
8. Admin marks **"Completed"**
9. Order closed

---

### 3.12 Post-Order / Re-ordering

#### Order More
- From tracking page, tap **"Order More"**
- Goes to menu with existing cart preserved
- New items added to existing cart
- On checkout, **new order created** (not merged with previous)
- Multiple orders visible on tracking page (tabbed or stacked)

#### New Session
- Customer leaves restaurant
- Session expires after 30 min inactivity
- Next customer scans QR → fresh session starts

---

## 4. Complete Order State Machine

```
                         ┌──────────┐
                         │  DRAFT   │  ← Cart being built (not yet submitted)
                         └────┬─────┘
                              │
                              │ Customer places order
                              ▼
                     ┌────────────────┐
                     │ PENDING PAYMENT│  ← Waiting for payment confirmation
                     └────┬───────────┘
                          │
              ┌───────────┼───────────────┐
              │           │               │
              ▼           ▼               ▼
         ┌────────┐ ┌────────┐     ┌──────────┐
         │ PAID   │ │ PAID   │     │ PENDING  │
         │ (UPI)  │ │ (CARD) │     │ (CASH)   │
         └───┬────┘ └───┬────┘     └────┬─────┘
             │          │               │
             │          │               │ Admin marks paid
             │          │               ▼
             │          │          ┌────────┐
             │          │          │ PAID   │
             │          │          │ (CASH) │
             │          │          └───┬────┘
             └──────────┴──────────────┘
                              │
                              ▼
                       ┌──────────┐
                       │  QUEUED  │  ← In kitchen queue (not yet accepted)
                       └────┬─────┘
                            │
                            │ Kitchen accepts
                            ▼
                     ┌────────────┐
                     │  ACCEPTED  │  ← Kitchen acknowledges
                     └─────┬──────┘
                           │
                           │ Start preparing
                           ▼
                     ┌────────────┐
                     │ PREPARING  │  ← Being cooked
                     └─────┬──────┘
                           │
                           │ Food ready
                           ▼
                      ┌─────────┐
                      │ SERVED  │  ← Delivered to table / ready for pickup
                      └────┬────┘
                           │
                           │ Customer receives
                           ▼
                    ┌─────────────┐
                    │  COMPLETED  │  ← Order finished ✓
                    └─────────────┘

Cancellation paths:
  PENDING_PAYMENT ──────────► CANCELLED  (customer cancels before paying)
  PAID ─────────────────────► CANCELLED  (admin cancels, refund initiated)
  QUEUED ───────────────────► CANCELLED  (admin cancels before cooking)

Failure path:
  PENDING_PAYMENT ──────────► FAILED     (payment declined / error)
```

### State Transition Rules

| From | To | Trigger | Who | Notes |
|---|---|---|---|---|
| `draft` | `pending_payment` | Place Order | Customer | Only if cart has items |
| `pending_payment` | `paid` | Payment confirmed | System (webhook) | UPI/Card auto; Cash manually |
| `pending_payment` | `failed` | Payment declined | System | Razorpay failure |
| `pending_payment` | `cancelled` | Cancel order | Customer/Admin | Before payment |
| `paid` | `cancelled` | Cancel & refund | Admin | Only with refund |
| `paid` | `queued` | Auto-queue | System | After payment confirmed |
| `queued` | `accepted` | Accept order | Admin | Kitchen acceptance |
| `queued` | `cancelled` | Cancel | Admin | Before cooking starts |
| `accepted` | `preparing` | Start prep | Admin | Food being cooked |
| `preparing` | `served` | Mark ready | Admin | Food ready for table |
| `served` | `completed` | Mark complete | Admin | Customer received food |
| `paid` (cash) | `queued` | Auto-queue | System | Kitchen starts even before payment (cash) |

---

## 5. Payment Flows & Statuses

### Payment Data Model

```
payments {
  _id: ObjectId,
  orderId: String (references orders._id),
  restaurantId: String,
  method: "upi" | "card" | "netbanking" | "cash",
  status: "initiated" | "pending" | "completed" | "failed" | "refunded",
  amount: Number (in paise for Razorpay, but stored as INR decimal),
  currency: "INR",
  
  // Razorpay fields (for online payments)
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Timestamps
  initiatedAt: Date,
  completedAt: Date,
  refundedAt: Date,
  
  // Refund
  refundReason: String,
  refundAmount: Number,
  
  // Idempotency
  idempotencyKey: String (unique index),
  
  audit: [
    { action, timestamp, performedBy }
  ]
}
```

### Payment Status Lifecycle

```
UPI / CARD / NET BANKING:
  initiated ──► completed  (webhook success)
     │
     └─────────► failed    (webhook failure / timeout)

CASH:
  pending ──► completed  (admin marks paid)

ALL:
  completed ──► refunded  (admin initiates refund)
```

### Payment Status Definitions

| Status | Meaning | Color |
|---|---|---|
| `initiated` | Razorpay order created, customer is in checkout | Blue |
| `pending` | Cash order, awaiting collection | Amber |
| `completed` | Payment received successfully | Green |
| `failed` | Transaction declined / error | Red |
| `refunded` | Amount returned to customer | Red/Grey |
| `in_progress` | Transaction in progress (Razorpay) | Orange |

### Admin Payment Actions

| Action | Condition | Result |
|---|---|---|
| Mark as Paid | Cash payment | `pending` → `completed` |
| Refund | Completed payment (UPI/Card) | Razorpay refund API called |
| Void | Initiated but not completed | Cancel, no charge |
| Confirm | Webhook missed (manual) | Force `completed` (audit log) |

---

## 6. Notification System

### Architecture
- **Event-driven** using Redis pub/sub (later: message queue like Bull/BullMQ)
- Events published → consumed by notification service
- Notification service distributes to channels

### Event Types

| Event | Trigger | Recipient | Channel |
|---|---|---|---|
| `order.created` | Customer places order | Admin panel | WebSocket + Toast + Sound |
| `order.payment_confirmed` | Payment webhook received | Customer app | WebSocket |
| `order.status_changed` | Admin updates status | Customer app | WebSocket |
| `order.cancelled` | Admin cancels | Customer app | WebSocket + Alert |
| `payment.failed` | Payment decline | Customer app | Alert on checkout |

### Notification Channels

#### A. Admin WebSocket
- Persistent connection to admin panel
- On new event → toast notification (top-right, auto-dismiss 5s)
- Order count badge updates
- Sound played (configurable toggle)

#### B. Customer WebSocket
- Persistent connection to customer app
- Status updates on tracking page
- New toast on status change: "Your order is being prepared!"

#### C. Sound (Admin)
- New order → notification chime
- Toggleable in Settings
- Default: enabled

#### D. Browser Push (Future)
- If tab not active → browser push notification
- Requires permission grant

### Notification Data Model
```
notifications {
  _id: ObjectId,
  recipientId: String (adminId or sessionId),
  recipientType: "admin" | "customer",
  type: "order_created" | "payment_confirmed" | "status_changed" | "order_cancelled",
  title: String,
  body: String,
  data: { orderId, tableNumber, status },
  read: Boolean (default false),
  createdAt: Date
}
```

---

## 7. Security & Data Flow

### Authentication
| Aspect | Implementation |
|---|---|
| Admin sessions | JWT in HttpOnly, Secure, SameSite=Strict cookie |
| Customer identity | QR-based session (no password/account) |
| Session signing | HMAC-SHA256 with server secret |
| Session expiry | 24h for admin, 30min idle for customer |
| Rate limiting | Login: 5/hr, Order: 10/min, Payment: 5/min, OCR: 3/hr |

### Payment Security
| Aspect | Implementation |
|---|---|
| Razorpay keys | Server-side only, never exposed to frontend |
| Webhook signature | Verified with `razorpay_webhook_secret` |
| Idempotency | Unique key prevents duplicate charges |
| Amount verification | Webhook amount compared to order amount |
| Encryption | Razorpay handles card data (PCI-DSS compliant) |

### Data Validation
| Input | Validation |
|---|---|
| Customer name | Alphanumeric + spaces only, max 50 chars |
| Special notes | Plain text only, HTML tags stripped |
| Price | Positive number, max ₹99,999 |
| Email | RFC 5322 regex |
| Phone | Indian mobile (10 digits, starts with 6-9) |
| Password | Min 8 chars, uppercase + lowercase + digit + special |

### Anti-fraud
- Idempotency keys on order and payment creation
- Audit log for every status change and payment action
- Rate limiting on all write endpoints
- Session revocation by admin kills all active connections for that table

### Audit Log Fields
```
audit_logs {
  _id: ObjectId,
  action: String,      // e.g., "order.created", "payment.marked_paid"
  actorType: "admin" | "customer" | "system",
  actorId: String,
  targetType: String,  // "order" | "payment" | "menu" | "table"
  targetId: String,
  details: Object,     // JSON blob with context
  ip: String,
  userAgent: String,
  timestamp: Date
}
```

---

## 8. Database Collections Reference

| Collection | Purpose | Key Fields |
|---|---|---|
| `admins` | Admin accounts | `email`, `passwordHash`, `name`, `restaurantId`, `phone`, `isVerified`, `createdAt` |
| `restaurants` | Restaurant profiles | `name`, `address`, `cuisine`, `gstNumber`, `logo`, `tableCount`, `bankDetails`, `upiId`, `razorpayMerchantId`, `createdAt` |
| `tables` | Table definitions | `restaurantId`, `tableNumber`, `capacity`, `qrSessionId`, `qrGeneratedAt`, `isActive` |
| `menu_images` | Uploaded menu card photos | `restaurantId`, `imageUrl`, `ocrStatus`, `extractedAt`, `createdAt` |
| `menu_items` | Individual menu items | `restaurantId`, `name`, `description`, `price`, `category`, `imageUrl`, `isAvailable`, `isVegetarian`, `variants[]`, `createdAt` |
| `menu_extractions` | OCR extraction results | `menuImageId`, `rawText`, `extractedItems[]`, `confidence`, `status`, `createdAt` |
| `customer_sessions` | QR-based guest sessions | `restaurantId`, `tableId`, `sessionToken`, `signedExpiry`, `nonce`, `signature`, `orderType`, `isActive`, `createdAt`, `lastActivityAt` |
| `carts` | Active carts per session | `sessionId`, `items[]` (`{ itemId, quantity, priceAtAdd }`), `specialNotes`, `updatedAt` |
| `orders` | Order records | `restaurantId`, `tableId`, `sessionId`, `orderNumber`, `customerName`, `orderType`, `items[]`, `subtotal`, `tax`, `total`, `orderStatus`, `paymentStatus`, `paymentMethod`, `specialNotes`, `timeline[]`, `createdAt` |
| `payments` | Payment records | `orderId`, `method`, `status`, `amount`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `idempotencyKey`, `refundReason`, `audit[]`, `createdAt` |
| `notifications` | Notification delivery | `recipientId`, `recipientType`, `type`, `title`, `body`, `data`, `read`, `createdAt` |
| `collections_daily` | Daily revenue aggregates | `restaurantId`, `date`, `totalRevenue`, `totalOrders`, `dineInCount`, `takeawayCount`, `deliveryCount`, `paymentBreakdown` (`{ upi, card, cash, amount }`), `peakHours[]`, `createdAt` |
| `audit_logs` | Security audit trail | `action`, `actorType`, `actorId`, `targetType`, `targetId`, `details`, `ip`, `userAgent`, `timestamp` |

---

## 9. Glossary of Statuses & States

### Order Statuses (order.orderStatus)

| Status | Meaning |
|---|---|
| `draft` | Cart being built, not yet submitted |
| `pending_payment` | Submitted, awaiting payment confirmation |
| `paid` | Payment received (auto for UPI/Card, manual for Cash) |
| `queued` | In kitchen queue, awaiting acceptance |
| `accepted` | Kitchen acknowledged the order |
| `preparing` | Food is being cooked |
| `served` | Food delivered to table / ready for pickup |
| `completed` | Order finished, customer received |
| `cancelled` | Order cancelled (before/after payment with refund) |
| `failed` | Payment declined or system error |

### Payment Statuses (order.paymentStatus / payments.status)

| Status | Meaning |
|---|---|
| `initiated` | Razorpay order created, customer in checkout |
| `pending` | Cash — awaiting manual collection |
| `completed` | Payment received successfully |
| `failed` | Transaction declined or error |
| `refunded` | Amount returned to customer |
| `in_progress` | Razorpay transaction in progress |

### Payment Methods (order.paymentMethod / payments.method)

| Method | Type | Flow |
|---|---|---|
| `upi` | Online | Razorpay → Webhook → Auto-confirm |
| `card` | Online | Razorpay → Webhook → Auto-confirm |
| `netbanking` | Online | Razorpay → Webhook → Auto-confirm |
| `cash` | Offline | Manual collect at counter → Admin confirms |

### Order Types (order.orderType)

| Type | Description |
|---|---|
| `dine-in` | Customer eating at restaurant table |
| `takeaway` | Customer taking food away from restaurant |
| `delivery` | (Future) Customer ordering for home delivery |

### Session Statuses

| Status | Meaning |
|---|---|
| `active` | Session valid, customer can order |
| `expired` | Session timed out (30min idle) |
| `revoked` | Admin manually terminated session |

### Menu Item Statuses (menu_items.isAvailable)

| Status | Meaning | Display |
|---|---|---|
| `true` | Item available for ordering | Normal display |
| `false` | Item temporarily unavailable | Greyed out, "Sold Out" badge |

---

## Complete Journey Summary (Visual)

```
  ADMIN FLOW                              CUSTOMER FLOW
  ────────────────────                    ────────────────────
                                          ┌─────────────────┐
  Register Account                        │  Arrive at      │
  └──► Login                              │  Restaurant     │
      └──► Dashboard                      └────────┬────────┘
          │                                        │
          ▼                                        ▼
  ┌─────────────────┐                     ┌─────────────────┐
  │ Add Menu Items  │                     │  Scan QR Code   │
  │ (Manual / OCR)  │                     └────────┬────────┘
  └────────┬────────┘                              │
           │                                       ▼
           ▼                            ┌─────────────────┐
  ┌─────────────────┐                   │  Welcome        │
  │ Generate QR     │                   │  Dine-In / TA   │
  │ Codes for Tables│                   └────────┬────────┘
  └────────┬────────┘                              │
           │                                       ▼
           │                            ┌─────────────────┐
           │                            │  Browse Menu    │
           │                            │  Categories     │
           │                            │  Add Items      │
           │                            └────────┬────────┘
           │                                       │
           │                                       ▼
           │                            ┌─────────────────┐
           │                            │  View Cart      │
           │                            │  Special Notes  │
           │                            └────────┬────────┘
           │                                       │
           │                                       ▼
           │                            ┌─────────────────────┐
           │                            │  Checkout           │
           │                            │  Name, Details      │
           │                            │  Payment Selection  │
           │                            └────┬────────┬───────┘
           │                                 │        │
           │                    ┌────────────┘        └────────────┐
           │                    ▼                                  ▼
           │         ┌──────────────────┐              ┌──────────────────┐
           │         │ UPI / Card / NB  │              │  Cash            │
           │         │ (Razorpay)       │              │  (Pay at Counter)│
           │         │ Webhook → Paid   │              │  Pending Payment │
           │         └────────┬─────────┘              └────────┬─────────┘
           │                  │                                  │
           │                  ▼                                  │
           │         ┌──────────────────┐                        │
           │         │  Order Confirmed  │◄──────────────────────┘
           │         │  Success Screen   │
           │         └────────┬─────────┘
           │                  │
           │                  ▼
  ┌─────────────────┐       ┌─────────────────┐
  │  Receive Order  │       │  Track Order    │
  │  Notification   │       │  (Real-time)    │
  └────────┬────────┘       └────────┬────────┘
           │                        │
           ▼                        │
  ┌─────────────────┐               │
  │  View Order     │               │
  │  Accept / Prep  │               │
  │  Mark Ready     │◄──────────────┤ (updates via WS)
  │  Mark Served    │               │
  └────────┬────────┘               │
           │                        │
           ▼                        ▼
  ┌─────────────────┐       ┌─────────────────┐
  │  Staff Serves   │       │  Food Arrives   │
  │  Food           │       │  (Served ✓)     │
  └────────┬────────┘       └────────┬────────┘
           │                        │
           ▼                        ▼
  ┌─────────────────┐       ┌─────────────────┐
  │  Collect Cash   │       │  Eat & Enjoy    │
  │ (if cash order) │       │  (Or Leave)     │
  │  Mark Paid      │       │                 │
  │  Complete Order │       │  Order More?    │
  └────────┬────────┘       └────────┬────────┘
           │                        │
           ▼                        ▼
  ┌─────────────────┐       ┌─────────────────┐
  │  View Daily     │       │  Session Expires│
  │  Collection     │       │  (30 min idle)  │
  │  Reports        │       │                 │
  └─────────────────┘       └─────────────────┘
```

---

> **End of OrderXpress Platform Flow Document**  
> This document covers every stage of the Admin and Customer journey within the OrderXpress QR-based restaurant ordering system. For implementation details, refer to the `architecture.md`, API contracts, and source code.

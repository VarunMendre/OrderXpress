# OrderXpress — Frontend Build Tracker (Chunks)

The single source of truth for the frontend work plan. We work chunk by chunk and tick them off here as they are completed.

## Apps

| App | Tech | Location |
|---|---|---|
| **Admin App** | React Native + Expo SDK 54 (matches Expo Go 54.0.8 on Play Store), plain JS (no TypeScript) | `Frontend/admin-app/` |
| **Customer Web App** | React + JSX (Vite), plain JS (no TypeScript) | `Frontend/web-app/` |

## Rules

- **No TypeScript anywhere** — plain JS / JSX only.
- Reference UI = `Frontend/docs/context/ui-pages/` (DESIGN.md + code.html + screen.png) and the sample `admin-panel.html` / `customer-order.html`.
- Design tokens from `docs/context/ui-tokens.md` (Inter font, bg `#f7f8fa`, surface white, primary navy `#0b3877`, black CTAs `#111318`, card radius 16px, button/input radius 12px, pill 9999px).
- Status badge colors: Blue = New, Orange = Preparing/Pending, Green = Ready/Paid, Red = Reject/Delete.
- API base: `http://localhost:4000/api/v1` — response envelope `{ success, data }` / `{ success: false, error: { code, message } }`.
- Admin requests authenticate via `session` cookie (set on login, HttpOnly). Customer requests send `x-session-token` header (stored in localStorage after QR scan).
- Customer-facing text must render as plain text, never raw HTML.
- A chunk is **done** only when its checklist items below are all verified working against the running backend.

## Legend

- `[ ]` — pending, `[x]` — completed. `⚠` — blocked / waiting on backend.

---

## Phase 1 — Scaffolding & Shared Foundation

### Chunk 1 — App scaffolding, design system tokens, navigation shells
- [ ] `admin-app` scaffolds with Expo (expo-router or react-navigation, plain JS), `web-app` scaffolds with Vite + React (plain JSX)
- [ ] Design tokens as a single theme file mirrored on both sides (colors, radius, spacing, typography from `ui-tokens.md`); Inter font loaded on both
- [ ] Shared primitive components: Button, Card, Badge (status), Input, Spinner, EmptyState — matching the reference UI classes in `ui-pages/**/code.html`
- [ ] Admin app shell: bottom navigation bar with 5 tabs (Home, Orders, Menu, Collections, Settings) — active item = black rounded-square chip
- [ ] Customer web app shell: top header (OrderXpress brand) + responsive layout (mobile-first)
- Trivial screens wired: placeholder screens per tab that match each reference layout structure

**Reference:** `docs/context/ui-tokens.md`, `ui-rules.md`, `ui-pages/admin/*/code.html`

---

## Phase 2 — Admin App (React Native + Expo)

### Chunk 2 — Admin authentication: register, login, logout, session
- [x] Register screen (multi-step registration flow: restaurant details → contact → table count; password ≥ 8 chars + confirm) → `POST /auth/register`
- [x] Login screen → `POST /auth/login` (sets session cookie; app then reads `GET /auth/me`)
- [x] Home when logged in vs. login screen; logout button → `POST /auth/logout` (in Settings > Session)
- [x] Session expiry handling: 401 on any authed call → redirect to login (Auto handled via unauthorized handler in `src/api/client.js`)
- [x] Errors shown from `error.message` only (never raw backend errors)
- **API:** `POST /api/v1/auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- **Cookie note:** React Native Android does not auto-send cookies — `src/api/client.js` captures the `session` cookie from `Set-Cookie`, stores it in AsyncStorage and forwards it as a manual `Cookie` header on every request (`credentials: 'omit'`).
- **Reference:** `admin/auth/login-page`, `admin/auth/registeration-flow`

### Chunk 3 — Merchant onboarding (KYC details)
- [ ] Onboarding/KYC screen: owner name, business type/category, address, city/state/pincode, PAN, GSTIN, bank account + IFSC, transaction profile
- [ ] Pre-fill from `GET /auth/onboarding/status` if draft exists; submit → `POST /auth/onboarding` → status becomes `pending`
- [ ] Show onboarding status banner on home until `approved`
- **API:** `POST /auth/onboarding`, `GET /auth/onboarding/status`
- **Reference:** `admin/auth/details-page`

### Chunk 4 — Home dashboard + restaurant setup
- [ ] Dashboard screen (home tab): restaurant profile card, primary stats (today's orders, revenue), recent orders preview, menu status, table count
- [ ] "Set up menu" entry point → navigates to menu upload (Chunk 5) when menu is empty; QR setup entry when menu published
- [ ] Restaurant open/closed toggle if supported
- **API:** `GET /auth/me` (restaurant payload), `GET /orders?page=1&limit=5`
- **Reference:** `admin/home-page`

### Chunk 5 — Menu upload + extraction pipeline + review
- [ ] Upload menu image (camera / image picker) → `POST /menu-items/:id/image`; show `ocrStatus` (uploaded/processing/processed/failed)
- [ ] Extraction review screen: show detected items (name, price, category) from extraction API; allow edit (name/category/price) before accepting
- [ ] Accept extraction → converts items into menu items; reject → discard
- [ ] Manual add of a single menu item from the review screen
- **API:** `POST /menu-items/:id/image`, `GET /menu-extractions/:id`, `POST /menu-extractions/:id/review`
- **Reference:** `admin/menu-crud`

### Chunk 6 — Menu CRUD
- [ ] Menu list grouped by category with availability toggle
- [ ] Create/edit/delete menu item (name, description, price, category, veg/non-veg, portion type, availability)
- [ ] Search + filter by category + filter available only
- **API:** `GET /menu-items`, `POST /menu-items`, `GET /menu-items/:id` → PATCH, `DELETE /menu-items/:id`
- **Reference:** `admin/menu-crud`

### Chunk 7 — Tables & QR generation
- [ ] Generate tables screen → `POST /tables/generate` (tableCount, retains existing tables)
- [ ] Table list screen → `GET /tables`; per-table QR view → `GET /tables/:tableId/qr` (show QR + share/print)
- [ ] Active session info on a table row → `GET /tables/:tableId/session` (badge when a customer session is live)
- **API:** `POST /tables/generate`, `GET /tables`, `GET /tables/:tableId/qr`, `GET /tables/:tableId/session`
- **Note:** QR image source from backend qr payload URL; keep the "download/print QR" button working in Expo (share sheet / save to gallery)

### Chunk 8 — Orders list (live feed)
- [ ] Orders list screen with filters: status (new/accepted/completed/cancelled) + table + time; pull-to-refresh + auto-refresh interval
- [ ] Compact order card: order number, table, items count, total, payment status, order status badge (blue/orange/green/red)
- [ ] Pagination via page/limit params; new orders badge/count
- **API:** `GET /orders?page=&limit=&status=&tableId=`
- **Reference:** `admin/orders/list-orders`

### Chunk 9 — Single order details + status actions
- [ ] Order detail screen: line items (qty, snapshot name, price), table info, order type, payment method & status, totals (subtotal/tax/total), timeline (status, at, by, note)
- [ ] Status action buttons: Accept → accepted, Complete → completed, Cancel → cancelled (respect current state; disable when invalid)
- [ ] Payment actions: mark cash paid when payment method is cash → `POST /payments/:paymentId/cash/mark-paid`
- **API:** `GET /orders/:orderId`, `PATCH /orders/:orderId/status { action }`, `POST /payments/:paymentId/cash/mark-paid`
- **Reference:** `admin/orders/view-single-order-details`

### Chunk 10 — Collections (daily & by date)
- [ ] Daily collection dashboard: today's total, break by payment method (online vs cash), order count
- [ ] Date-wise view: pick a date → orders + totals for that day
- [Chunk blocked note] Backend collections/report endpoints are not built yet (`docs/context/progress-tracker.md`). Build UI against mock data + an interface layer so it can switch to `GET /reports/collections?date=...` once the backend lands. `[⚠ backend]`
- **Reference:** `admin/collection/*`

### Chunk 11 — Settings
- [ ] Restaurant profile: name, address, phone, cuisine, logo (update wherever backend accepts it)
- [ ] Bank details (IFSC, account number) + business details read-only from onboarding
- [ ] Table count display; change table count + regenerate
- [ ] Logout + password change entry point (backend password reset later)
- **API:** existing auth/onboarding + tables endpoints
- **Reference:** `admin/settings`

## Phase 3 — Customer Web App (React)

### Chunk 12 — QR landing + menu browsing
- [ ] Scan flow: web app opens with QR payload (query params: restaurantId, tableId, signature, expiry, nonce already embedded in QR URL) → `POST /customer/scan` validates signature, returns session + `x-sessionToken`
- [ ] Persist session token (localStorage), resume when already active → `GET /customer/session`
- [ ] Menu view: restaurant header (name, address, cuisine, open status), items grouped by category, veg/non-veg indicator, prices in INR; plain-text rendering only
- [ ] Table reference shown in UI ("Table 4")
- **API:** `POST /customer/scan`, `GET /customer/menu`, `GET /customer/session`
- **Reference:** `customer/home-page-after-scaning`

### Chunk 13 — Cart
- [ ] Add item (choices/qty), cart drawer/page listing items with quantity steppers, remove item, clear cart
- [ ] Totals server-computed display, not client arithmetic: subtotal, tax, total; special instructions field
- [ ] Session expiry handling (30 min): show banner + re-scan option when session expires
- **API:** `GET /customer/cart`, `POST /customer/cart` { item, qty }, `DELETE /customer/cart/clear` (x-session-token header)
- **Reference:** `customer/cart-or-your-order`

### Chunk 14 — Checkout + payment (Razorpay)
- [ ] Checkout form: order type (dine-in/takeaway), payment method (online/cash), optional mobile number; totals summary from cart
- [ ] Online flow: `POST /payments/razorpay/order` → open Razorpay Checkout (load `checkout.js`; sandbox mode) → on success `POST /payments/razorpay/verify` with signature
- [ ] Fallback: select cash; order placed
- [ ] Create order via `POST /orders/checkout` only after payment outcome (verify matches backend order state `authorized/paid`); show failure/retry state, never leave user ambiguous
- **API:** `POST /orders/checkout`, `POST /payments/razorpay/order`, `POST /payments/razorpay/verify`
- **Reference:** `customer/payment-checkout`

### Chunk 15 — Order tracking
- [ ] Post-checkout screen: order placed confirmation (order number, total), status tracker (ordered → accepted → preparing → ready/completed), timeline
- [ ] Poll `GET /customer/session` / order lookup by `activeOrderId` in session; preserve context on refresh (token in localStorage)
- [ ] Previous active orders of this session listed with status
- [ ] "Order again / new order" entry point (same menu session)
- **API:** `GET /customer/session` (activeOrderId), order detail via session token
- **Reference:** `customer/track-order-and-order-new`

## Phase 4 — Hardening & Integration

### Chunk 16 — Shared UX states & input validation
- [ ] All screens: loading skeletons/spinners, error states with retry, empty states with one clear action — across both apps
- [ ] Client-side validation for every form matching backend validators (password ≥8 chars, positive prices, required KYC fields, etc.)
- [ ] Network resilience: axios instance with timeout, error interceptor mapping backend error codes to readable messages
- [ ] Currency formatting util (INR) used everywhere, no scattered `₹` string concat

### Chunk 17 — End-to-end verification against backend
- [ ] Full admin flow on simulator/device: register → onboarding → upload menu → extract → review → publish → QR generation
- [ ] Full customer flow on browser: QR scan → menu → cart → cash & online payment → tracking update when admin accepts/completes
- [ ] Edge flows: expired QR, duplicate login, order placed but payment failed, session expiry mid-cart, order status blocked transitions
- [ ] Final polish pass: spacing/typography tokens consistent, statuses color correct, bottom nav states correct
- [ ] Update `docs/context/ui-registry.md` with all components built (living registry)

---

## Quick API Reference (mounted under `http://localhost:4000/api/v1`)

| Area | Endpoint | Auth |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/onboarding`, `GET /auth/onboarding/status` | cookie (except register/login) |
| Tables | `POST /tables/generate`, `GET /tables`, `GET /tables/:id/qr`, `GET /tables/:id/session` | admin |
| Menu | `GET|POST /menu-items`, `GET|PATCH|DELETE /menu-items/:id`, `POST /menu-items/:id/image`, `GET /menu-extractions/:id`, `POST /menu-extractions/:id/review` | admin |
| Customer | `POST /customer/scan`, `GET /customer/menu`, `GET /customer/session`, `GET /customer/cart`, `POST /customer/cart`, `DELETE /customer/cart/clear` | x-session-token |
| Orders | `POST /orders/checkout` (public), `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` | admin |
| Payments | `POST /payments/razorpay/order`, `POST /payments/razorpay/verify`, `POST /payments/webhook` (public), `POST /payments/:id/cash/mark-paid` | admin |

## Known backend gaps to design around

- Collections/reports endpoints — not implemented in backend yet → Chunk 10 uses mock contract
- No real-time push (SSE/WebSocket) — poll instead (orders list refresh, tracking).
- Menu images/extractions may take time processing — always render `ocrStatus` states.
```
# OrderXpress Frontend API Handoff

**Audience:** Frontend team  
**Scope:** Backend endpoints validated during Phase 1 testing  
**Base URL:** `http://localhost:4000`  
**Status:** MVP backend endpoints are wired and the following routes have been tested from Postman/manual flow.

---

## 1. How To Use This Guide

This document explains:

- which backend endpoints are ready
- what headers to send
- what body to send
- what to store from each response
- what each endpoint is used for in the frontend flow
- which endpoints are still not fully tested

The frontend should treat the backend as the source of truth for:

- restaurant onboarding
- table setup
- menu data
- customer sessions
- carts
- orders
- payment records

---

## 2. Environment Assumptions

For local development:

- Backend runs on `http://localhost:4000`
- MongoDB and Redis are already connected in the backend environment
- Admin auth uses a cookie called `session`
- Customer session APIs use `x-session-token`

For Razorpay webhook testing:

- Use your ngrok URL mapped to the backend webhook route
- Example:

```text
https://unanimatingly-noncruciform-jayleen.ngrok-free.dev/api/v1/payments/webhook/razorpay
```

---

## 3. Authentication And Session Rules

### Admin session

After `POST /api/v1/auth/register` or `POST /api/v1/auth/login`, the backend sets:

- cookie name: `session`

Frontend should:

- allow the browser to keep the cookie
- send it automatically on same-origin requests
- if using a separate client or manual tools, copy the cookie into the request header

### Customer session

After `POST /api/v1/customer/session/scan`, the backend returns:

- `sessionToken`

Frontend should store it temporarily in memory or session storage and send it as:

```http
x-session-token: <sessionToken>
```

Do not confuse admin cookie auth with customer session token auth.

---

## 4. Tested Endpoint Summary

These endpoints were manually verified as working:

1. `GET /health`
2. `GET /ready`
3. `POST /api/v1/auth/register`
4. `GET /api/v1/auth/me`
5. `POST /api/v1/tables/generate`
6. `GET /api/v1/tables`
7. `POST /api/v1/tables/:tableId/qr`
8. `GET /api/v1/menu-items`
9. `POST /api/v1/menu-items`
10. `POST /api/v1/menu-images`
11. `GET /api/v1/menu-images/:imageId/extraction`
12. `POST /api/v1/menu-images/:imageId/review`
13. `POST /api/v1/customer/session/scan`
14. `GET /api/v1/customer/menu`
15. `GET /api/v1/customer/cart`
16. `POST /api/v1/customer/cart/items`
17. `POST /api/v1/customer/cart/clear`
18. `POST /api/v1/orders/checkout`
19. `POST /api/v1/payments/razorpay/order`
20. `GET /api/v1/orders?page=1&limit=10`
21. `GET /api/v1/orders/:orderId`
22. `PATCH /api/v1/orders/:orderId/status`

Not fully tested yet:

- `POST /api/v1/payments/razorpay/verify`
- `POST /api/v1/payments/webhook/razorpay`

---

## 5. Endpoint Details

## 5.1 Health Check

### `GET /health`

Use:
- backend alive check
- app boot verification

Headers:
- none required

Expected:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### `GET /ready`

Use:
- dependency readiness check
- confirm backend is ready to serve requests

Expected:

```json
{
  "success": true,
  "data": {
    "status": "ready"
  }
}
```

---

## 5.2 Admin Authentication

### `POST /api/v1/auth/register`

Use:
- create admin account
- create restaurant record
- create merchant onboarding record

Headers:

```http
Content-Type: application/json
```

Body:

```json
{
  "ownerName": "Varun",
  "restaurantName": "OrderXpress Demo",
  "email": "admin@example.com",
  "phone": "9876543210",
  "tableCount": 2,
  "password": "StrongPass@123",
  "confirmPassword": "StrongPass@123",
  "businessType": "Restaurant",
  "businessCategory": "Food",
  "businessSubCategory": "Quick Service",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "pan": "ABCDE1234F",
  "gstin": "",
  "bankAccountNumber": "1234567890",
  "ifsc": "HDFC0001234",
  "transactionProfile": "food_and_beverages"
}
```

Expected:
- `201 Created`
- response contains:
  - `admin`
  - `restaurant`
  - `onboarding`
- `session` cookie is set

Frontend should store:
- nothing special, just keep the cookie in browser

### `POST /api/v1/auth/login`

Use:
- login existing admin

Headers:

```http
Content-Type: application/json
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "StrongPass@123"
}
```

Expected:
- `200 OK`
- `admin` in response
- `session` cookie set

### `GET /api/v1/auth/me`

Use:
- get current authenticated admin and restaurant context

Headers:

```http
Cookie: session=<cookie>
```

Expected:
- `200 OK`
- `admin`
- `restaurant`
- `onboarding`

### `POST /api/v1/auth/logout`

Use:
- logout admin

Headers:

```http
Cookie: session=<cookie>
```

Expected:
- `200 OK`
- cookie cleared

---

## 5.3 Table And QR

### `POST /api/v1/tables/generate`

Use:
- generate table records based on restaurant table count

Headers:

```http
Cookie: session=<cookie>
Content-Type: application/json
```

Body:

```json
{
  "tableCount": 2
}
```

Expected:
- `201 Created`
- array of tables

Notes:
- existing tables are preserved if they already exist

### `GET /api/v1/tables`

Use:
- list all tables for admin

Headers:

```http
Cookie: session=<cookie>
```

Expected:
- `200 OK`
- array of tables sorted by table number

### `POST /api/v1/tables/:tableId/qr`

Use:
- fetch signed QR payload for a table

Headers:

```http
Cookie: session=<cookie>
```

Expected:
- `200 OK`
- response contains:
  - `table`
  - `qr.payload`
  - `qr.signature`

Store from response:
- `table._id`
- `table.restaurantId`
- `qr.signature`

Frontend use:
- render QR code from payload if needed
- use `tableId` and `signature` during customer session scan

---

## 5.4 Menu

### `GET /api/v1/menu-items`

Use:
- list restaurant menu items

Headers:

```http
Cookie: session=<cookie>
```

Query params supported:

- `category`
- `available`
- `search`

Example:

```text
/api/v1/menu-items?category=Main%20Course&available=true
```

Expected:
- `200 OK`
- array of menu items

### `POST /api/v1/menu-items`

Use:
- create a menu item

Headers:

```http
Cookie: session=<cookie>
Content-Type: application/json
```

Body:

```json
{
  "name": "Paneer Butter Masala",
  "price": 220,
  "category": "Main Course",
  "imageUrl": "",
  "isVegetarian": true,
  "portionType": "full",
  "description": "Creamy paneer curry",
  "isAvailable": true
}
```

Expected:
- `201 Created`
- created menu item object

### `PATCH /api/v1/menu-items/:itemId`

Use:
- update menu item

Headers:

```http
Cookie: session=<cookie>
Content-Type: application/json
```

Body can include any of:

```json
{
  "name": "Paneer Butter Masala",
  "price": 250,
  "category": "Main Course",
  "imageUrl": "",
  "isVegetarian": true,
  "portionType": "full",
  "description": "Updated description",
  "isAvailable": true
}
```

Expected:
- `200 OK`

### `DELETE /api/v1/menu-items/:itemId`

Use:
- delete a menu item

Headers:

```http
Cookie: session=<cookie>
```

Expected:
- `200 OK`
- `{ deleted: true }`

### `POST /api/v1/menu-images`

Use:
- create OCR image upload record

Headers:

```http
Cookie: session=<cookie>
Content-Type: application/json
```

Body:

```json
{
  "imageUrl": "https://example.com/menu.jpg",
  "fileName": "menu.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 123456,
  "provider": "stub",
  "rawText": "Paneer Butter Masala 220\nVeg Biryani 180",
  "confidenceScore": 0.88,
  "detectedItems": [
    {
      "name": "Paneer Butter Masala",
      "price": 220,
      "category": "Main Course",
      "isVegetarian": true,
      "portionType": "full"
    }
  ]
}
```

Expected:
- `201 Created`
- image record
- extraction record

### `GET /api/v1/menu-images/:imageId/extraction`

Use:
- fetch OCR extraction data

Headers:

```http
Cookie: session=<cookie>
```

Expected:
- `200 OK`
- extraction object

### `POST /api/v1/menu-images/:imageId/review`

Use:
- confirm OCR output and create menu items from it

Headers:

```http
Cookie: session=<cookie>
Content-Type: application/json
```

Body:

```json
{
  "detectedItems": [
    {
      "name": "Paneer Butter Masala",
      "price": 220,
      "category": "Main Course",
      "isVegetarian": true,
      "portionType": "full"
    }
  ]
}
```

Expected:
- `200 OK`
- extraction object
- `createdItems` array

---

## 5.5 Customer Session

### `POST /api/v1/customer/session/scan`

Use:
- create or resume anonymous customer session from QR data

Headers:

```http
Content-Type: application/json
```

Body:

```json
{
  "restaurantId": "<restaurantId>",
  "tableId": "<tableId>",
  "signature": "<qr.signature>",
  "expiry": "2026-09-10T12:00:00.000Z",
  "nonce": "random-nonce-123"
}
```

Expected:
- `201 Created`
- customer session object
- `sessionToken`

Store:
- `sessionToken`

Frontend should send:

```http
x-session-token: <sessionToken>
```

### `GET /api/v1/customer/menu`

Use:
- fetch menu for the active customer session

Headers:

```http
x-session-token: <sessionToken>
```

Expected:
- `200 OK`
- `session`
- `items`

---

## 5.6 Cart

### `GET /api/v1/customer/cart`

Use:
- get current cart for customer session

Headers:

```http
x-session-token: <sessionToken>
```

Expected:
- `200 OK`
- cart object

### `POST /api/v1/customer/cart/items`

Use:
- add item to cart

Headers:

```http
x-session-token: <sessionToken>
Content-Type: application/json
```

Body:

```json
{
  "menuItemId": "<menuItemId>",
  "quantity": 2,
  "notes": "Less spicy"
}
```

Expected:
- `200 OK`
- updated cart

### `POST /api/v1/customer/cart/clear`

Use:
- remove all cart items for the active session

Headers:

```http
x-session-token: <sessionToken>
```

Expected:
- `200 OK`
- `{ cleared: true }`

---

## 5.7 Checkout

### `POST /api/v1/orders/checkout`

Use:
- create order from current cart

Headers:

```http
x-session-token: <sessionToken>
Content-Type: application/json
```

Body:

```json
{
  "orderType": "dine-in",
  "paymentMethod": "online",
  "customerName": "Rahul",
  "phone": "9876543210",
  "specialInstructions": "No onions"
}
```

or for cash:

```json
{
  "orderType": "dine-in",
  "paymentMethod": "cash",
  "customerName": "Rahul",
  "phone": "9876543210",
  "specialInstructions": "No onions"
}
```

Expected:
- `201 Created`
- order object
- order number
- payment method and status

Store:
- `orderId`
- `orderNumber`

---

## 5.8 Payment

### `POST /api/v1/payments/razorpay/order`

Use:
- create payment record and Razorpay order reference

Headers:

```http
Cookie: session=<cookie>
Content-Type: application/json
```

Body:

```json
{
  "orderId": "<orderId>",
  "amount": 400,
  "currency": "INR"
}
```

Expected:
- `201 Created`
- payment object
- `razorpayOrder` object

Store:
- `razorpayOrder.id`
- `payment._id`

### `POST /api/v1/payments/razorpay/verify`

Not fully tested yet.

Purpose:
- verify Razorpay checkout success callback

Expected body from Razorpay:

```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_from_razorpay"
}
```

### `POST /api/v1/payments/webhook/razorpay`

Not fully tested yet.

Purpose:
- receive server-to-server Razorpay webhook events

Webhook URL for ngrok:

```text
https://unanimatingly-noncruciform-jayleen.ngrok-free.dev/api/v1/payments/webhook/razorpay
```

Headers:

```http
X-Razorpay-Signature: <webhook_signature>
Content-Type: application/json
```

Recommended events:

- `payment.captured`
- `payment.failed`
- `payment.authorized`
- `order.paid`

### `POST /api/v1/payments/cash/:orderId/mark-paid`

Use:
- mark a cash order as paid by admin

Headers:

```http
Cookie: session=<cookie>
```

Expected:
- `200 OK`
- order marked paid

---

## 5.9 Orders

### `GET /api/v1/orders?page=1&limit=10`

Use:
- list orders for admin dashboard

Headers:

```http
Cookie: session=<cookie>
```

Expected:
- `200 OK`
- response contains:
  - `items`
  - `pagination`

Each list item includes:
- `orderId`
- `orderNumber`
- `placedAt`
- `status`
- `tableId`
- `totalAmount`

### `GET /api/v1/orders/:orderId`

Use:
- fetch full single order details

Headers:

```http
Cookie: session=<cookie>
```

Expected:
- `200 OK`
- full order object

### `PATCH /api/v1/orders/:orderId/status`

Use:
- admin order status update

Headers:

```http
Cookie: session=<cookie>
Content-Type: application/json
```

Body:

```json
{
  "action": "accept"
}
```

or:

```json
{
  "action": "complete"
}
```

or:

```json
{
  "action": "cancel"
}
```

Expected:
- `200 OK`
- updated order object

---

## 6. MongoDB Collections To Watch

During testing, confirm writes in:

- `admins`
- `restaurants`
- `merchant_onboardings`
- `tables`
- `menu_items`
- `menu_images`
- `menu_extractions`
- `customer_sessions`
- `carts`
- `orders`
- `payments`

---

## 7. Manual Test Notes For Frontend

- Use `session` cookie for admin APIs
- Use `x-session-token` for customer APIs
- Use the exact `qr.signature` returned from QR generation when scanning customer session
- Use `orderId` returned by checkout when creating payment
- Use Razorpay’s real checkout success fields for verify endpoint
- Webhook testing must be done through ngrok or another public URL

---

## 8. Current Gaps

These are not yet fully validated:

- Razorpay verify endpoint
- Razorpay webhook endpoint

Everything else listed above was reported as working during manual testing.


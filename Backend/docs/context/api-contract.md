# api-contract.md
# OrderXpress API Contract

**Document Type:** API Contract  
**Audience:** AI Agents, Developers, Architects  
**Status:** MVP Draft

---

## 1. Contract Principles

- REST is the primary API style
- All mutation endpoints validate payloads on the server
- Client totals are never trusted
- Protected admin routes require HttpOnly cookie auth
- Customer routes use a signed QR session
- Payment confirmation relies on Razorpay webhook verification
- Responses should use a consistent envelope

### Response Envelope

```json
{
  "success": true,
  "data": {},
  "message": "optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message"
  }
}
```

---

## 2. Auth APIs

### POST `/api/v1/auth/register`

Creates the admin account and restaurant onboarding record.

Body:

- `ownerName`
- `restaurantName`
- `email`
- `phone`
- `password`
- `confirmPassword`
- `businessType`
- `businessCategory`
- `businessSubCategory`
- `address`
- `city`
- `state`
- `pincode`
- `pan`
- `gstin` optional
- `bankAccountNumber`
- `ifsc`
- `transactionProfile`

Returns:

- admin profile
- restaurant profile
- onboarding status

### POST `/api/v1/auth/login`

Creates an admin session cookie.

Body:

- `email`
- `password`

### POST `/api/v1/auth/logout`

Clears the admin session.

### GET `/api/v1/auth/me`

Returns the current admin and restaurant context.

---

## 3. Restaurant APIs

### GET `/api/v1/restaurant/me`

Returns restaurant profile and onboarding state.

### PATCH `/api/v1/restaurant/me`

Updates restaurant profile fields that are editable after signup.

Allowed fields:

- `restaurantName`
- `address`
- `cuisineType`
- `logoUrl`
- `phone`

### POST `/api/v1/restaurant/onboarding/submit`

Submits onboarding data to move the restaurant toward active status.

### GET `/api/v1/restaurant/onboarding/status`

Returns current onboarding status and missing fields.

---

## 4. Table and QR APIs

### POST `/api/v1/tables/generate`

Creates table records from the configured table count.

### GET `/api/v1/tables`

Lists tables for the restaurant.

### POST `/api/v1/tables/:tableId/qr`

Generates or returns the signed QR payload for one table.

### GET `/api/v1/tables/:tableId/session`

Returns the active customer session state for a table.

---

## 5. Menu APIs

### GET `/api/v1/menu-items`

Lists menu items for the restaurant.

Query:

- `category`
- `available`
- `search`

### POST `/api/v1/menu-items`

Creates a menu item.

Body:

- `name`
- `price`
- `category`
- `imageUrl`
- `isVegetarian`
- `portionType` optional, values like `half`, `full`
- `description` optional
- `isAvailable`

### PATCH `/api/v1/menu-items/:itemId`

Updates a menu item.

### DELETE `/api/v1/menu-items/:itemId`

Deletes a menu item.

### POST `/api/v1/menu-images`

Uploads a menu image for OCR extraction.

### GET `/api/v1/menu-images/:imageId/extraction`

Returns OCR output and extracted menu item candidates.

### POST `/api/v1/menu-images/:imageId/review`

Saves admin-reviewed extraction results as menu items.

---

## 6. Customer Session APIs

### POST `/api/v1/customer/session/scan`

Creates or resumes a table session from a QR payload.

Body:

- `restaurantId`
- `tableId`
- `signature`
- `expiry`
- `nonce`

### GET `/api/v1/customer/menu`

Returns restaurant menu for the active customer session.

### GET `/api/v1/customer/session`

Returns the current session state.

---

## 7. Cart APIs

### GET `/api/v1/cart`

Returns the active cart for the customer session.

### POST `/api/v1/cart/items`

Adds an item to the cart.

Body:

- `menuItemId`
- `quantity`
- `notes` optional

### PATCH `/api/v1/cart/items/:itemId`

Updates a cart item quantity or notes.

### DELETE `/api/v1/cart/items/:itemId`

Removes a cart item.

### POST `/api/v1/cart/clear`

Clears the cart.

---

## 8. Checkout and Order APIs

### POST `/api/v1/orders/checkout`

Creates the order draft and returns the next action.

Body:

- `orderType` values `dine-in` or `takeaway`
- `paymentMethod` values `online` or `cash`
- `customerName` optional
- `phone` optional
- `specialInstructions` optional

### GET `/api/v1/orders`

Lists restaurant orders for admin with pagination.

Query:

- `page`
- `limit`
- `status`
- `tableId`

Returns summary fields only:

- `orderId`
- `placedAt`
- `status`
- `tableNumber`
- `totalAmount`

### GET `/api/v1/orders/:orderId`

Returns full order detail.

### PATCH `/api/v1/orders/:orderId/status`

Admin updates the order status.

Allowed actions:

- `accept`
- `complete`
- `cancel`

### GET `/api/v1/orders/:orderId/timeline`

Returns order lifecycle events.

---

## 9. Payments APIs

### POST `/api/v1/payments/razorpay/order`

Creates a Razorpay order for an existing checkout.

Body:

- `orderId`
- `amount`
- `currency`

### POST `/api/v1/payments/razorpay/verify`

Verifies a Razorpay payment signature.

### POST `/api/v1/payments/webhook/razorpay`

Receives Razorpay webhook events.

### POST `/api/v1/payments/cash/mark-paid`

Admin marks a cash order as collected.

---

## 10. Reporting APIs

### GET `/api/v1/reports/collections/today`

Returns today’s revenue and order count.

### GET `/api/v1/reports/collections`

Returns date-wise collection totals.

Query:

- `from`
- `to`

---

## 11. Notification APIs

### GET `/api/v1/notifications`

Returns unread and recent in-app notifications.

### PATCH `/api/v1/notifications/:notificationId/read`

Marks a notification as read.

---

## 12. Health APIs

### GET `/health`

Returns service health.

### GET `/ready`

Returns readiness for dependencies like MongoDB and Redis.


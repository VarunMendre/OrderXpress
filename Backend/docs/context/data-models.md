# data-models.md
# OrderXpress Data Models

**Document Type:** Data Model Reference  
**Audience:** AI Agents, Developers, Architects  
**Status:** MVP Draft

---

## 1. Modeling Principles

- Use MongoDB collections by domain
- Store only what the MVP needs
- Keep onboarding, payment, and order state explicit
- Use timestamps on every major record
- Index lookup fields used by auth, table scans, order lists, and webhooks

---

## 2. `admins`

Stores admin login accounts.

Fields:

- `_id`
- `restaurantId`
- `ownerName`
- `email`
- `phone`
- `passwordHash`
- `role` default `admin`
- `isActive`
- `createdAt`
- `updatedAt`

Indexes:

- unique `email`
- `restaurantId`

---

## 3. `merchant_onboardings`

Stores business details required for restaurant onboarding and Razorpay activation.

Fields:

- `_id`
- `restaurantId`
- `ownerName`
- `restaurantName`
- `email`
- `phone`
- `businessType`
- `businessCategory`
- `businessSubCategory`
- `address`
- `city`
- `state`
- `pincode`
- `pan`
- `gstin`
- `bankAccountNumber`
- `ifsc`
- `transactionProfile`
- `onboardingStatus`
- `razorpayMerchantId` optional
- `submittedAt`
- `reviewedAt`
- `createdAt`
- `updatedAt`

Onboarding status values:

- `draft`
- `pending`
- `under_review`
- `active`
- `rejected`

Indexes:

- `restaurantId`
- `email`
- `pan`

---

## 4. `restaurants`

Stores restaurant profile data.

Fields:

- `_id`
- `name`
- `address`
- `phone`
- `cuisineType`
- `logoUrl`
- `tableCount`
- `isOpen`
- `onboardingStatus`
- `createdAt`
- `updatedAt`

Indexes:

- `name`
- `onboardingStatus`

---

## 5. `tables`

Stores table definitions.

Fields:

- `_id`
- `restaurantId`
- `tableNumber`
- `tableLabel`
- `qrPayload`
- `qrSignature`
- `isActive`
- `createdAt`
- `updatedAt`

Indexes:

- unique compound `restaurantId + tableNumber`
- `restaurantId`

---

## 6. `customer_sessions`

Stores anonymous QR-based customer sessions.

Fields:

- `_id`
- `restaurantId`
- `tableId`
- `sessionToken`
- `sessionStatus`
- `activeOrderId` optional
- `lastActivityAt`
- `expiresAt`
- `createdAt`
- `updatedAt`

Session statuses:

- `active`
- `expired`
- `revoked`

Indexes:

- `sessionToken`
- compound `restaurantId + tableId + sessionStatus`
- `expiresAt`

---

## 7. `menu_images`

Stores uploaded menu images and OCR lifecycle data.

Fields:

- `_id`
- `restaurantId`
- `imageUrl`
- `fileName`
- `mimeType`
- `fileSize`
- `ocrStatus`
- `retentionStatus`
- `createdAt`
- `updatedAt`

OCR status values:

- `uploaded`
- `processing`
- `processed`
- `failed`

Retention status values:

- `retained`
- `archived`
- `deleted`

Indexes:

- `restaurantId`
- `ocrStatus`

---

## 8. `menu_extractions`

Stores OCR output and extracted item candidates.

Fields:

- `_id`
- `restaurantId`
- `menuImageId`
- `provider`
- `rawText`
- `confidenceScore`
- `detectedItems`
- `reviewStatus`
- `reviewedBy`
- `reviewedAt`
- `createdAt`
- `updatedAt`

Review status values:

- `pending`
- `reviewed`
- `accepted`
- `rejected`

Detected item shape:

- `name`
- `price`
- `category`
- `isVegetarian`
- `portionType`
- `notes`

Indexes:

- `restaurantId`
- `menuImageId`
- `reviewStatus`

---

## 9. `menu_items`

Stores published menu items.

Fields:

- `_id`
- `restaurantId`
- `name`
- `description`
- `price`
- `category`
- `imageUrl`
- `isVegetarian`
- `portionType`
- `isAvailable`
- `sourceExtractionId` optional
- `createdAt`
- `updatedAt`

Indexes:

- `restaurantId`
- `category`
- `isAvailable`

---

## 10. `carts`

Stores the active cart for a customer session.

Fields:

- `_id`
- `restaurantId`
- `tableId`
- `sessionId`
- `items`
- `specialInstructions`
- `subtotal`
- `tax`
- `total`
- `updatedAt`
- `createdAt`

Cart item shape:

- `menuItemId`
- `nameSnapshot`
- `priceSnapshot`
- `quantity`
- `notes`

Indexes:

- unique `sessionId`
- `restaurantId`

---

## 11. `orders`

Stores order records.

Fields:

- `_id`
- `restaurantId`
- `tableId`
- `sessionId`
- `cartId`
- `orderNumber`
- `orderType`
- `paymentMethod`
- `paymentStatus`
- `orderStatus`
- `customerName` optional
- `phone` optional
- `specialInstructions` optional
- `items`
- `subtotal`
- `tax`
- `total`
- `currency`
- `placedAt`
- `createdAt`
- `updatedAt`

Order status values:

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

Payment status values:

- `initiated`
- `pending`
- `completed`
- `failed`
- `refunded`

Indexes:

- unique `orderNumber`
- `restaurantId`
- `tableId`
- `orderStatus`
- `placedAt`

---

## 12. `payments`

Stores payment records and Razorpay references.

Fields:

- `_id`
- `restaurantId`
- `orderId`
- `method`
- `status`
- `amount`
- `currency`
- `razorpayOrderId`
- `razorpayPaymentId`
- `razorpaySignature`
- `idempotencyKey`
- `webhookEventId` optional
- `createdAt`
- `updatedAt`

Status values:

- `initiated`
- `pending`
- `completed`
- `failed`
- `refunded`

Indexes:

- unique `idempotencyKey`
- unique `razorpayOrderId`
- unique `razorpayPaymentId`
- `orderId`

---

## 13. `notifications`

Stores in-app notifications for admin use.

Fields:

- `_id`
- `restaurantId`
- `recipientType`
- `recipientId`
- `type`
- `title`
- `body`
- `data`
- `readAt` optional
- `createdAt`
- `updatedAt`

Types:

- `order_created`
- `order_status_changed`
- `payment_confirmed`
- `order_cancelled`

Indexes:

- `restaurantId`
- `recipientType`
- `readAt`

---

## 14. `collections_daily`

Stores daily revenue aggregates.

Fields:

- `_id`
- `restaurantId`
- `dateKey`
- `totalRevenue`
- `orderCount`
- `onlineRevenue`
- `cashRevenue`
- `createdAt`
- `updatedAt`

Indexes:

- unique `restaurantId + dateKey`
- `dateKey`

---

## 15. `audit_logs`

Stores security and action logs.

Fields:

- `_id`
- `restaurantId`
- `actorType`
- `actorId`
- `action`
- `targetType`
- `targetId`
- `details`
- `ip`
- `userAgent`
- `createdAt`

Actor types:

- `admin`
- `customer`
- `system`

Indexes:

- `restaurantId`
- `action`
- `createdAt`


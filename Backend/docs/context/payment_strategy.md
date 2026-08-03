# payment_strategy.md
# OrderXpress Payment Strategy

**Version:** 1.0  
**Purpose:** Define the MVP payment approach for OrderXpress

---

## 1. MVP Payment Decision

For the MVP we will use:

- **Razorpay Checkout**
- **Server-side order creation**
- **Webhook-based payment confirmation**
- **Full merchant onboarding inside the app**
- **Cash at counter as a fallback payment method**

This keeps the implementation simple and reliable while still supporting real online payment behavior.

---

## 2. Why This Approach

The MVP needs to be:

- fast to implement
- easy to verify
- safe against duplicate payment confirmation
- stable even if the frontend retries or loses connection

Webhook confirmation gives us the source of truth.
Full onboarding keeps the product self-contained and easier to demonstrate to users.

---

## 3. Payment Flow

### Merchant Onboarding

1. Admin starts restaurant signup
2. Backend collects business and banking details
3. Backend stores onboarding status and merchant metadata
4. Razorpay activation proceeds using the collected details
5. Restaurant becomes eligible for online payment flow once the onboarding state is active

### Online Payment

1. Customer checks out
2. Backend creates an order record with `pending_payment`
3. Backend creates a Razorpay order
4. Frontend opens Razorpay Checkout
5. Customer pays
6. Razorpay sends a webhook to the backend
7. Backend verifies the webhook signature
8. Backend marks the payment as completed
9. Backend advances the order to `paid`

### Cash at Counter

1. Customer selects cash
2. Backend creates the order without calling Razorpay
3. Order is marked as cash pending or paid by admin later
4. Admin confirms collection in the backend

---

## 4. MVP Payment Rules

- Never trust frontend payment success alone
- Never mark an order paid before webhook verification
- Store Razorpay IDs only after they are returned by the provider
- Prevent duplicate payment processing using idempotency keys
- Keep payment and order state separate, even though they are linked
- The backend should model onboarding state explicitly from day one

---

## 5. Settlement Assumption

For the MVP we will not build full marketplace payout orchestration.

Assumption:

- The restaurant is the merchant of record for its own payment flow
- OrderXpress stores the payment metadata and verification result
- Complex merchant onboarding and split settlement can be added later if the product requires it

---

## 6. Data We Need To Store

Minimum payment fields:

- `merchantOnboardingId`
- `businessName`
- `ownerName`
- `email`
- `phone`
- `address`
- `pan`
- `gstin`
- `bankAccountNumber`
- `ifsc`
- `businessCategory`
- `businessSubCategory`
- `transactionProfile`
- `onboardingStatus`
- `orderId`
- `method`
- `status`
- `amount`
- `currency`
- `razorpayOrderId`
- `razorpayPaymentId`
- `razorpaySignature`
- `idempotencyKey`
- `createdAt`

---

## 7. Failure Handling

- If checkout fails, keep the order in `pending_payment` or `failed`
- If webhook arrives twice, ignore the duplicate safely
- If webhook verification fails, do not mark payment complete
- If online payment is unavailable, allow cash-at-counter only when enabled by the restaurant

---

## 8. Non-Goals For MVP

We are not building these in the first pass:

- split settlements
- commission routing
- merchant marketplace onboarding
- subscriptions
- refunds automation beyond basic manual handling
- multi-provider payment abstraction unless needed later

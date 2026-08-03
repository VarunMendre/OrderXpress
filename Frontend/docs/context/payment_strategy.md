# Razorpay Payment Integration Strategy for OrderXpress

> **Version:** 2.0
> **Purpose:** Document the payment architecture for OrderXpress and evaluate Razorpay's Marketplace/Route (or equivalent enterprise merchant onboarding product) as the payment infrastructure provider.

---

## 1. Problem Statement

OrderXpress is a QR-code based restaurant ordering platform.

### Current Workflow
`Restaurant Signup` ➔ `Upload Menu` ➔ `Generate QR Code` ➔ `Customer Scans QR` ➔ `Browse & Order` ➔ `Payment`

> **The Core Challenge:**
> How should restaurants receive online payments without forcing them to manually create a Razorpay account or visit the Razorpay website themselves?

---

## 2. Platform Requirements

The ideal payment solution must satisfy the following criteria:

* **Frictionless Onboarding:** Restaurant owners sign up strictly within OrderXpress without installing secondary apps or manually setting up a Razorpay dashboard. The admin never visits the Razorpay website.
* **Diverse Payment Options:** Out-of-the-box support for UPI, Debit/Credit Cards, Net Banking, and Wallets.
* **Direct Settlements:** Funds must flow directly to the restaurant's bank account so OrderXpress avoids becoming a regulated payment aggregator and never touches customer money.
* **Scalability:** Built to support thousands of restaurants seamlessly.
* **Monetization Ready:** Built with future support for platform fees, commissions, and subscriptions.

> **Important note:** OrderXpress needs **Razorpay's Marketplace/Route (or an equivalent enterprise merchant-onboarding product) — not a standard Razorpay payment gateway account.** A normal Razorpay account is a single-merchant account; Route (or the equivalent partner/marketplace product) is what allows OrderXpress to programmatically onboard many independent restaurant merchants and route payouts to each of them.

---

## 3. Why Razorpay (Route / Marketplace)?

Razorpay's marketplace product is more than a standard payment gateway. It provides the APIs needed to programmatically manage a multi-merchant marketplace:

* **Merchant Onboarding & KYC:** Verifies PAN, GST, and bank accounts programmatically.
* **Split Settlements & Payouts:** Essential for routing platform commissions or vendor payouts directly to each restaurant.
* **Complete Gateway Suite:** Handles checkout pages, delayed refunds, webhooks, and custom settlement cycles per merchant.

---

## 4. High-Level Architecture

```
                    +-----------------------------------+
                    |            OrderXpress            |
                    | (Auth, Menu, Orders, Payments)     |
                    +-----------------+-----------------+
                                      |
                          Razorpay Route / Marketplace APIs
                                      |
                      +---------------+---------------+
                      |                               |
                      ▼                               ▼
                 Merchant A                      Merchant B
                (Restaurant)                    (Restaurant)
                      |                               |
                      +---------------+---------------+
                                      |
                                   Customer
```

Everything appears to happen inside the OrderXpress application. In reality:

```
Customer
   ↓
Razorpay
   ↓
Restaurant Bank
```

OrderXpress never touches customer money. The backend only handles Orders, Payment Verification, Webhooks, Refund requests, and Payment Status.

---

## 5. Merchant (Restaurant) Onboarding Flow

```
Admin Opens OrderXpress
   ↓
Creates Account
   ↓
Fills Business Details
  • Restaurant Name
  • Owner Name
  • Mobile Number
  • Email
  • PAN
  • GST (Optional)
  • Bank Account
  • IFSC
  • Address
   ↓
Clicks "Create Restaurant"
   ↓
────────── OrderXpress Backend takes over ──────────
   ↓
Validate Details
   ↓
Call Razorpay Merchant Onboarding API
   ↓
Razorpay performs:
  • KYC
  • PAN Verification
  • Bank Verification
  • Merchant Creation
   ↓
Merchant Created
   ↓
Merchant ID Returned
   ↓
Store Merchant ID
   ↓
Restaurant Registration Completed
```

The admin never visits the Razorpay website — everything is embedded inside the OrderXpress onboarding wizard.

### Important caveat: onboarding is not always instant

Treating "backend calls Razorpay and the account is created automatically" as fully automatic end-to-end is an oversimplification. Conceptually that's correct, but technically there are usually additional steps:

* KYC verification
* Document validation
* Possible manual review for some merchants
* Merchant activation

Depending on Razorpay's onboarding process and regulatory requirements, a merchant might **not become fully active instantly**. Many businesses are auto-approved, but some may require additional verification before they can start accepting payments. OrderXpress's UI and backend state machine must account for a **PENDING / UNDER_REVIEW** merchant status, not just ACTIVE.

---

## 6. Checkout & Payment Flow

```
Customer
   ↓
QR Code
   ↓
Menu
   ↓
Cart
   ↓
Checkout
   ↓
OrderXpress Backend
   ↓
Create Razorpay Order (using Merchant ID)
   ↓
Razorpay Checkout Opens
   ↓
Customer Pays
   ↓
Payment Success
```

### After payment

```
Customer → Bank → Razorpay → Payment Successful → Webhook → OrderXpress → Restaurant Dashboard → Kitchen Starts Cooking
```

*Note: The platform should never rely solely on the frontend callback. Always verify payment server-side via webhooks or the Payment Verification API before confirming orders.*

---

## 7. Settlement Dynamics

A successful customer payment does not mean money instantly reaches the restaurant. They are two separate financial events:

* **Payment Success:** Customer's card/UPI is debited. Order preparation begins immediately.
* **Settlement:** Funds transfer from Razorpay's holding queue to the restaurant's bank account according to their agreed-upon cycle (Instant, Same-Day, T+1, or T+2).

### Lifecycle Timeline Example
* **10:00:00 AM:** Customer pays ₹2,000.
* **10:00:03 AM:** Payment is successful.
* **10:00:04 AM:** Webhook received; kitchen starts preparing food.
* **Settlement Cycle (e.g., T+1):** Funds (minus fees) clear to the restaurant bank account the next business day.

If the restaurant has **Same-Day Settlement**, money arrives later that day. If **T+1**, it arrives the next business day.

---

## 8. Database Schema & State Models

### Required Merchant Database Fields

A minimal restaurant table looks like:

```
Restaurant
  id
  name
  email
  mobile
  bank_account
  ifsc
  pan
  gst
  razorpay_merchant_id
  payment_status
  settlement_cycle
  created_at
```

> **Note:** You do **not** need to store Razorpay API keys per merchant. Only the `razorpay_merchant_id` (or whatever identifier the onboarding API returns) needs to be stored and mapped to the local restaurant record.

| Field Name | Description |
| :--- | :--- |
| razorpay_merchant_id | Razorpay's registered merchant identifier |
| restaurant_id | Local OrderXpress unique ID |
| bank_details | Bank Account Number & IFSC code |
| tax_details | Verified PAN & (optional) GST credentials |
| settlement_type | Settlement speed setting (e.g., INSTANT, SAME_DAY, T+1) |
| kyc_status | Current verification tier state from Razorpay (PENDING, UNDER_REVIEW, ACTIVE, REJECTED) |

### Independent Order & Settlement States

To prevent settlement delays from stalling physical operations, manage order states independently of financial settlements:

* **Order Progression:** CREATED ➔ PAYMENT_PENDING ➔ PAYMENT_SUCCESS ➔ ORDER_CONFIRMED ➔ PREPARING ➔ READY ➔ COMPLETED
* **Settlement Progression:** PENDING ➔ SETTLED
* **Payment State Machine:** Pending ➔ Success | Failed | Cancelled ➔ Refunded | Partially Refunded
* **Merchant Onboarding State (new):** PENDING ➔ UNDER_REVIEW ➔ ACTIVE | REJECTED

---

## 9. Pricing & Commission Edge Cases

### Fee Responsibility Models

#### Model A: Restaurant Bears Gateway Fee (Recommended)
* **Customer Pays:** ₹1,000 (Menu price is exact)
* **Razorpay Fee:** ₹20 (Deducted during processing)
* **Restaurant Settlement:** ₹980
* *Pros: Frictionless customer checkout. High conversion rates.*

#### Model B: Customer Bears Gateway Fee
* **Customer Pays:** ₹1,020 (Menu Price ₹1,000 + ₹20 gateway charge)
* **Restaurant Settlement:** ₹1,000
* *Cons: Poor customer experience. Increased cart abandonment due to "surprise fees" at checkout.*

#### Model C: Platform Bears Gateway Fee
* **Customer Pays:** ₹1,000
* **Restaurant Settlement:** ₹1,000
* **Platform Loss:** -₹20 (Paid directly by OrderXpress)
* *Cons: Extremely expensive and financially unsustainable at scale.*



#### Model D: Hybrid / Shared Fee
* **Customer Pays:** ₹1,010 (Menu Price ₹1,000 + flat ₹10 convenience fee, clearly disclosed at checkout)
* **Razorpay Fee:** ₹20 (actual gateway MDR, varies by payment method)
* **Restaurant Settlement:** ₹990 (absorbs the remaining ₹10 from the actual gateway cost)
* *Neither side bears the full ₹20 — the cost is split between customer and restaurant instead of loaded onto one party.*
* *Note: Rather than mirroring Razorpay's real, variable MDR (which differs by UPI/card/net banking) as a live 50/50 split, the customer-facing amount should be a **flat, fixed convenience fee** — the same approach Airbnb uses with its separate guest and host service fees. A flat fee is simpler to disclose at checkout (RBI requires convenience fees to be clearly shown before payment), easier to implement, and doesn't expose Razorpay's per-method pricing to the customer.*
* *Pros: More balanced than Models A/B; avoids "surprise fee" perception since the flat amount is small and predictable.*
* *Cons: Restaurant still nets slightly less than the menu price; requires an extra field (`convenience_fee`) in the order calculation logic.*


### Advanced Transaction Scenarios

* **Platform Fee Addition:** Customer is charged a minor convenience fee (e.g., ₹5 + GST) at checkout. This fee splits directly into the OrderXpress platform account, while the main food total routes to the restaurant, via Razorpay Route's split settlement.
* **Commission Model:** OrderXpress takes a percentage cut (e.g., 2%). Razorpay Route's Split Settlement API automatically routes 98% of the payout to the restaurant and 2% to the platform wallet.
* **In-Store Cash Payments:** The checkout flow bypasses Razorpay. The system generates an order ticket marked as Cash on Delivery with zero gateway fees applied.
* **Payment Failures & Cancellations:** Orders failing during checkout or cancelled before payment drop to an ORDER_CANCELLED state, triggering a retry prompt to the customer.
* **Delayed Webhooks:** If Razorpay's webhook is delayed, a background job queries the Razorpay Payment Verification API before declaring an order failed.
* **Order Refunds (Full & Partial):** Admin issues a refund request via the OrderXpress dashboard. The application calls Razorpay's Refund API to return the exact specified amount back to the customer's original payment source.
* **Duplicate Payments:** If a rare race condition causes duplicate charges, the system flags the matching transaction IDs and automatically auto-refunds the second transaction.
* **KYC Rejected / Under Review (new):** If a merchant's KYC is rejected, the restaurant's `payment_status` stays non-ACTIVE and online payments are disabled for that restaurant until documents are resubmitted and re-verified; the restaurant can still optionally accept Cash on Delivery orders in the meantime.
* **Webhook Authenticity (new):** Every incoming webhook must be verified using Razorpay's webhook signature before being trusted, to prevent spoofed "payment success" calls from confirming orders.

---

## 10. Platform Monetization Options

To drive platform revenue, OrderXpress can leverage multiple billing strategies:

* **Subscription Model:** Restaurants pay a flat monthly/yearly fee to access the platform.
* **Commission Model:** A small percentage-based fee is deducted from each successful transaction via Razorpay Route split settlement.
* **Platform Fee Model:** Customers pay a flat, small convenience fee per order.
* **Hybrid Model:** Combine a low base subscription fee with a minimal platform convenience fee for customers.

---

## 11. Final Recommendations

1. **Onboarding Integration:** Embed Razorpay's Merchant Onboarding API (Route/Marketplace product) directly into the onboarding wizard of the OrderXpress Admin portal.
2. **Decouple Financial States:** Never tie order completion to bank settlements. The kitchen should prepare food the moment payment is marked as SUCCESS, regardless of when the cash lands in the bank.
3. **Handle Non-Instant Activation:** Build the merchant state machine (PENDING / UNDER_REVIEW / ACTIVE / REJECTED) so the UI and payment flow correctly reflect that not all merchants are activated instantly.
4. **Gateway Abstraction Layer:** Implement an abstract wrapper class for payments (`IPaymentProvider`). This allows OrderXpress to support alternative providers (e.g., Cashfree, PhonePe) in the future with minimal code rewrite.

### Recommended End-to-End Architecture

```
                  Admin Registration
                        │
                        ▼
             Fill Restaurant Details
                        │
                        ▼
              OrderXpress Backend
                        │
                        ▼
         Merchant Onboarding API (Razorpay)
                        │
                        ▼
            Merchant / KYC Verification
                        │
                        ▼
        Merchant Account Created & Activated
                        │
                        ▼
          Store Merchant ID in Database
                        │
                        ▼
           Restaurant Ready to Accept Payments
──────────────────────────────────────────────────
                  Customer Places Order
                        │
                        ▼
                Create Razorpay Order
                        │
                        ▼
                 Customer Pays ₹1000
                        │
                        ▼
              Razorpay Payment Success
                        │
                        ▼
                 Webhook → OrderXpress
                        │
                        ▼
              Order Marked as PAID
                        │
                        ▼
             Restaurant Starts Preparing
                        │
                        ▼
        Razorpay Settlement (Same Day / T+1)
                        │
                        ▼
             Restaurant Bank Account
```

This is a clean, scalable architecture for OrderXpress — provided the platform is built on Razorpay's appropriate merchant onboarding / marketplace (Route) solution rather than a standard single-merchant integration.

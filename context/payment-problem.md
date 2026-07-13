# Cashfree Payment Integration Strategy for OrderXpress

> **Version:** 1.0  
> **Purpose:** Document the payment architecture for OrderXpress and evaluate Cashfree as the payment infrastructure provider.[cite: 1]

---

## 1. Problem Statement

OrderXpress is a QR-code based restaurant ordering platform.[cite: 1]

### Current Workflow
`Restaurant Signup` ➔ `Upload Menu` ➔ `Generate QR Code` ➔ `Customer Scans QR` ➔ `Browse & Order` ➔ `Payment`[cite: 1]

> **The Core Challenge:**  
> How should restaurants receive online payments without forcing them to manually create payment gateway accounts or install separate applications?[cite: 1]

---

## 2. Platform Requirements

The ideal payment solution must satisfy the following criteria:[cite: 1]

* **Frictionless Onboarding:** Restaurant owners sign up strictly within OrderXpress without installing secondary apps or manually setting up a Cashfree dashboard.[cite: 1]
* **Diverse Payment Options:** Out-of-the-box support for UPI, Debit/Credit Cards, Net Banking, and Wallets.[cite: 1]
* **Direct Settlements:** Funds must flow directly to the restaurant's bank account so OrderXpress avoids becoming a regulated payment aggregator.[cite: 1]
* **Scalability:** Built to support thousands of restaurants seamlessly.[cite: 1]
* **Monetization Ready:** Built with future support for platform fees, commissions, and subscriptions.[cite: 1]

---

## 3. Why Cashfree?

Cashfree is more than a standard payment gateway.[cite: 1] It provides the essential APIs needed to programmatically manage a multi-merchant marketplace:[cite: 1]

* **Merchant Onboarding & KYC:** Verifies PAN, GST, and bank accounts programmatically.[cite: 1]
* **Split Settlements & Payouts:** Essential for routing platform commissions or vendor payouts.[cite: 1]
* **Complete Gateway Suite:** Handles checkout pages, delayed refunds, webhooks, and custom settlement cycles.[cite: 1]

---

## 4. High-Level Architecture

                    +-----------------------------------+
                    |            OrderXpress            |
                    | (Auth, Menu, Orders, Payments)    |
                    +-----------------+-----------------+
                                      |
                              Cashfree Gateway APIs
                                      |
                      +---------------+---------------+
                      |                               |
                      ▼                               ▼
                 Merchant A                      Merchant B
                      |                               |
                      +---------------+---------------+
                                      |
                                   Customer

---

## 5. Merchant Onboarding Flow

1. **Restaurant Signup:** The owner enters business details directly into the OrderXpress application (Restaurant Name, Owner Name, PAN, GST, Bank Details, IFSC, Address, Email, Mobile).[cite: 1]
2. **API Handshake:** OrderXpress passes these details to the Cashfree Merchant Onboarding API.[cite: 1]
3. **Provisioning:** Cashfree registers the merchant dynamically and returns a unique Merchant ID.[cite: 1]
4. **Database Mapping:** OrderXpress securely stores the Merchant ID and binds it to the restaurant's local account.[cite: 1]

---

## 6. Checkout & Payment Flow

Customer Scans QR ➔ Build Cart ➔ Cashfree Hosted Checkout ➔ Payment Success ➔ Webhook Recieved ➔ Order Dispatched to Kitchen

*Note: The platform should never rely solely on the frontend callback. Always verify payment server-side via webhooks or verification API endpoints before confirming orders.*[cite: 1]

---

## 7. Settlement Dynamics

A successful customer payment does not mean money instantly reaches the restaurant.[cite: 1] They are two separate financial events:[cite: 1]

* **Payment Success:** Customer's card/UPI is debited. Order preparation begins immediately.[cite: 1]
* **Settlement:** Funds transfer from Cashfree's holding queue to the restaurant's bank account according to their agreed-upon cycle (Instant, Same-Day, T+1, or T+2).[cite: 1]

### Lifecycle Timeline Example
* **10:00:00 AM:** Customer pays ₹2,000.[cite: 1]
* **10:00:03 AM:** Payment is successful.[cite: 1]
* **10:00:04 AM:** Webhook received; kitchen starts preparing food.[cite: 1]
* **Settlement Cycle (e.g., T+1):** Funds (minus fees) clear to the restaurant bank account the next business day.[cite: 1]

---

## 8. Database Schema & State Models

### Required Merchant Database Fields
To facilitate programmatic payments and payouts, the database must map the following attributes per restaurant:[cite: 1]

| Field Name | Description |
| :--- | :--- |
| merchant_id | Cashfree's registered merchant identifier |
| restaurant_id | Local OrderXpress unique ID |
| bank_details | Bank Account Number & IFSC code |
| tax_details | Verified PAN & GST credentials |
| settlement_type | Settlement speed setting (e.g., INSTANT, T+1) |
| kyc_status | Current verification tier state from Cashfree |

### Independent Order & Settlement States
To prevent settlement delays from stalling physical operations, manage order states independently of financial settlements:[cite: 1]

* **Order Progression:** CREATED ➔ PAYMENT_PENDING ➔ PAYMENT_SUCCESS ➔ ORDER_CONFIRMED ➔ PREPARING ➔ READY ➔ COMPLETED[cite: 1]
* **Settlement Progression:** PENDING ➔ SETTLED[cite: 1]
* **Payment State Machine:** Pending ➔ Success | Failed | Cancelled ➔ Refunded | Partially Refunded[cite: 1]

---

## 9. Pricing & Commission Edge Cases

### Fee Responsibility Models

#### Model A: Restaurant Bears Gateway Fee (Recommended)
* **Customer Pays:** ₹1,000 (Menu price is exact)[cite: 1]
* **Cashfree Fee:** ₹20 (Deducted during processing)[cite: 1]
* **Restaurant Settlement:** ₹980[cite: 1]
* *Pros: Frictionless customer checkout. High conversion rates.*

#### Model B: Customer Bears Gateway Fee
* **Customer Pays:** ₹1,020 (Menu Price ₹1,000 + ₹20 gateway charge)[cite: 1]
* **Restaurant Settlement:** ₹1,000[cite: 1]
* *Cons: Poor customer experience. Increased cart abandonment due to "surprise fees" at checkout.*

#### Model C: Platform Bears Gateway Fee
* **Customer Pays:** ₹1,000[cite: 1]
* **Restaurant Settlement:** ₹1,000[cite: 1]
* **Platform Loss:** -₹20 (Paid directly by OrderXpress)[cite: 1]
* *Cons: Extremely expensive and financially unsustainable at scale.*

### Advanced Transaction Scenarios

* **Platform Fee Addition:** Customer is charged a minor convenience fee (e.g., ₹5 + GST) at checkout. This fee splits directly into the OrderXpress platform account, while the main food total routes to the restaurant.[cite: 1]
* **Commission Model:** OrderXpress takes a percentage cut (e.g., 2%). Cashfree's Split Settlement API automatically routes 98% of the payout to the restaurant and 2% to the platform wallet.[cite: 1]
* **In-Store Cash Payments:** The checkout flow bypasses Cashfree. The system generates an order ticket marked as Cash on Delivery with zero gateway fees applied.[cite: 1]
* **Payment Failures & Cancellations:** Orders failing during checkout or cancelled before payment drop to an ORDER_CANCELLED state, triggering a retry prompt to the customer.[cite: 1]
* **Delayed Webhooks:** If Cashfree's webhook is delayed, a background job queries the Cashfree Payment Verification API before declaring an order failed.[cite: 1]
* **Order Refunds (Full & Partial):** Admin issues a refund request via the OrderXpress dashboard. The application calls Cashfree's Refund API to return the exact specified amount back to the customer's original payment source.[cite: 1]
* **Duplicate Payments:** If a rare race condition causes duplicate charges, the system flags the matching transaction IDs and automatically auto-refunds the second transaction.[cite: 1]

---

## 10. Platform Monetization Options

To drive platform revenue, OrderXpress can leverage multiple billing strategies:[cite: 1]

* **Subscription Model:** Restaurants pay a flat monthly/yearly fee to access the platform.[cite: 1]
* **Commission Model:** A small percentage-based fee is deducted from each successful transaction.[cite: 1]
* **Platform Fee Model:** Customers pay a flat, small convenience fee per order.[cite: 1]
* **Hybrid Model:** Combine a low base subscription fee with a minimal platform convenience fee for customers.[cite: 1]

---

## 11. Final Recommendations

1. **Onboarding Integration:** Embed Cashfree’s Merchant Onboarding API directly into the onboarding wizard of the OrderXpress Admin portal.[cite: 1]
2. **Decouple Financial States:** Never tie order completion to bank settlements. The kitchen should prepare food the moment payment is marked as SUCCESS, regardless of when the cash lands in the bank.[cite: 1]
3. **Gateway Abstraction Layer:** Implement an abstract wrapper class for payments (IPaymentProvider). This allows OrderXpress to support alternative providers (e.g., Razorpay, PhonePe) in the future with minimal code rewrite.[cite: 1]
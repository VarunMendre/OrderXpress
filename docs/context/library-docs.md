# Library Docs

Project-specific usage rules for libraries used in OrderXpress.

---

## Before Using Any Library

Before implementing anything that uses a third-party library:

1. Read the relevant project context files
2. Check whether a project skill or MCP source exists for the library
3. Follow the project rules in this file

The order of authority is:

`MCP or official docs -> project docs -> general knowledge`

---

## Zod

Zod is the default validation library for all services.

Use it for:

- request bodies
- query params
- route params
- webhook payloads
- internal DTOs

Rules:

- Reject unknown fields on public inputs
- Keep schemas close to the code they validate
- Reuse schemas across controller and service boundaries

---

## MongoDB / Mongoose

Rules:

- Prefer service-scoped models
- Never query without restaurant, admin, or session scoping as appropriate
- Treat MongoDB injection risks seriously
- Use indexes for frequent filters such as restaurant, table, order status, and createdAt

---

## Redis

Use Redis for:

- sessions
- rate limits
- queue coordination
- idempotency windows
- short-lived QR session state

Rules:

- Set TTLs explicitly
- Never treat Redis as the source of long-term truth

---

## Razorpay

Use Razorpay for payments and payment verification.

Rules:

- Create payment records server-side
- Verify webhook signatures
- Treat webhook success as the source of truth for final payment state
- Use idempotency keys for payment creation and confirmation

---

## OCR / Menu Extraction

Use an OCR provider behind a `MenuExtractionService` abstraction.

Recommended service shape:

- upload image
- extract raw text
- normalize item names
- infer price variants
- return confidence and raw output

Rules:

- Do not couple the app to a single provider in business logic
- Keep provider-specific code behind adapters

---

## Notifications

Use a message-driven notification layer.

Rules:

- Order and payment events emit notifications asynchronously
- Notification failures must not block order placement
- Store delivery status separately from the order record


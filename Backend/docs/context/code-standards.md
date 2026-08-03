# Code Standards

Implementation rules for OrderXpress. Follow these in every session.

---

## Engineering Mindset

- Read `project-overview.md` and `architecture.md` before implementation
- Build only the requested scope
- Prefer simple, explicit code over clever abstractions
- Every feature must be testable before it is considered complete
- Failures must be handled locally and must not crash the whole flow

---

## JavaScript

- Use modern plain JavaScript for backend code
- Prefer `const` by default
- Avoid `var`
- Avoid unnecessary abstraction
- Keep functions small and named clearly
- Keep onboarding, payment, and order state logic explicit rather than hidden behind overly generic helpers

---

## Backend Structure

- Use Node.js + Express
- Keep route handlers thin
- Put business logic in service files
- Put validation in dedicated schema files
- Keep payment webhook handlers separate from normal request handlers

Recommended layout:

```text
src/
  routes/
  controllers/
  services/
  validators/
  models/
  middleware/
  jobs/
  utils/
```

---

## API Rules

- Validate every request
- Reject unexpected fields on public endpoints
- Use consistent response envelopes
- Use idempotency keys for order and payment flows
- Never trust client-side order totals
- Keep merchant onboarding payloads versioned so the schema can evolve safely

---

## Security Rules

- Never store secrets in git
- Treat `.env` as sensitive
- Prefer HttpOnly, Secure cookies
- Render customer input as plain text only
- Escape and sanitize any dynamic content shown in admin views
- Use CSRF protection for cookie-authenticated actions where applicable
- Protect against clickjacking and XSS with headers and CSP
- Rate limit login, order, payment, OCR, and webhook endpoints

---

## Error Handling

- Always wrap async boundaries in try/catch
- Log enough context to debug, but redact secrets
- Return user-safe error messages
- Never leak raw provider responses to customers

---

## File Naming

- Folders: kebab-case
- Utilities: camelCase
- Route handlers: `route.js`
- Validation files: `*.schema.js`
- Service files: `*.service.js`

---

## Logging

- Prefix logs with the module name
- Redact tokens, secrets, bank data, and webhook payloads
- Track order creation, payment verification, menu publish, and QR generation
- Track onboarding state transitions as audit-worthy events

# Code Standards

Implementation rules for OrderXpress. Follow these in every session.

---

## Engineering Mindset

- Read `project-overview.md` and `architecture.md` before implementation
- Build only the requested scope
- Prefer simple, explicit code over clever abstractions
- Every feature must be testable before it is considered complete
- Failures must be handled locally and never crash the whole flow

---

## TypeScript

- Use strict mode
- Avoid `any`
- Prefer `type` for shapes and unions
- Explicitly type function parameters and return values
- Use `const` by default

---

## Backend Structure

- Use Node.js + TypeScript for services
- Keep controllers thin
- Put business logic in service files
- Put validation in dedicated schema files
- Keep queue handlers separate from HTTP handlers

Recommended layout:

```text
src/
  controllers/
  services/
  validators/
  models/
  routes/
  jobs/
  utils/
```

---

## API Rules

- Validate every request with Zod
- Reject unexpected fields on public endpoints
- Use consistent response envelopes
- Use idempotency keys for order and payment flows
- Never trust client-side order totals

---

## Security Rules

- Never store secrets in git
- Treat `.env` as sensitive
- Prefer HttpOnly, Secure cookies
- Render customer input as plain text only
- Escape and sanitize any dynamic content shown in admin views
- Enforce CSRF protection on cookie-authenticated actions
- Protect against clickjacking and XSS with headers and CSP
- Rate limit login, order, payment, and OCR endpoints

---

## Microservice Rules

- Each service owns its own domain logic
- Services communicate through events or approved APIs only
- Do not create hidden service-to-service runtime coupling
- Keep shared code minimal and explicit

---

## Error Handling

- Always wrap async boundaries in try/catch
- Log enough context to debug, but redact secrets
- Return user-safe error messages
- Never leak raw provider responses to customers

---

## File Naming

- Folders: kebab-case
- Components: PascalCase
- Utilities: camelCase
- Route handlers: `route.ts`
- Validation files: `*.schema.ts`
- Service files: `*.service.ts`

---

## Logging

- Prefix logs with the module name
- Redact tokens, secrets, bank data, and webhook payloads
- Track order creation, payment verification, menu publish, and QR generation


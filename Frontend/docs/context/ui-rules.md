# UI Rules

Concise rules for building OrderXpress UI.

---

## Design Direction

- Preserve the provided UI/UX direction in `context/ui-pages/`
- Fix only mistakes and usability gaps after matching the reference
- Avoid generic, boilerplate-looking layouts

---

## Typography

- Use **Inter** as the primary font
- Keep typography consistent with the provided tokens
- Use clear hierarchy for titles, labels, body text, and helper text

---

## Layout

- Mobile-first for admin app screens
- Responsive web layout for customer app
- Use cards for grouped content
- Keep primary actions visible
- Avoid clutter in forms and tables

---

## Cards

- White surfaces
- Subtle borders
- Rounded corners
- Soft shadow only where needed

---

## Forms

- Inputs must be readable and touch-friendly
- Validation messages must be short and clear
- Do not rely on color alone to communicate status

---

## Tables and Lists

- Use clear row separation
- Highlight active or selected rows carefully
- Keep dense admin lists scannable

---

## Security and Content

- Render customer input as plain text
- Never display raw provider errors to users
- Never allow unsafe HTML rendering in customer-facing views

---

## Empty States

- Show a short explanation
- Offer one obvious next action


# UI Tokens

Design tokens for OrderXpress. Keep these tokens aligned with the delivered UI references.

---

## Core Palette

```css
@theme {
  --font-sans: "Inter", sans-serif;

  --color-background: #f7f8fa;
  --color-surface: #ffffff;
  --color-surface-secondary: #f4f5f7;
  --color-surface-tertiary: #edeef1;
  --color-border: #e5e7eb;

  --color-text-primary: #111318;
  --color-text-secondary: #7a7f8a;
  --color-text-muted: #9aa1ad;

  --color-primary: #0b3877;
  --color-primary-foreground: #ffffff;
  --color-accent: #61a8ff;
  --color-success: #358f6c;
  --color-warning: #ba864c;
  --color-error: #e5484d;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 9999px;
}
```

---

## Usage Rules

- Use token-based classes only
- Do not hardcode Tailwind color classes
- Do not add new colors casually
- Reuse tokens across admin and customer surfaces

---

## Component Values

- Card radius: 16px
- Button radius: 12px
- Input radius: 12px
- Pill radius: 9999px
- Page background: `--color-background`
- Surface background: `--color-surface`
- Border color: `--color-border`


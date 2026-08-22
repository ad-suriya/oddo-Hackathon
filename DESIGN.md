---
name: Dayflow
description: A restrained, single-accent HR platform — the login screen's dark/crimson world quoted into a calm, paper-white operating surface.
colors:
  brand-600: "#e91e46"
  brand-700: "#c8163a"
  brand-100: "#ffe1e6"
  brand-50: "#fff1f3"
  ink-900: "#0f172a"
  ink-700: "#334155"
  ink-500: "#64748b"
  paper: "#f8f7f6"
  paper-card: "#ffffff"
  nav-bg: "#0c0c0d"
  nav-surface: "#17171875"
  nav-text: "#f5f5f5"
  nav-text-muted: "#9a9a9a"
  success-600: "#059669"
  warning: "#e91e46"
  danger-600: "#dc2626"
  info-600: "#0369a1"
typography:
  display:
    fontFamily: "Fraunces, Iowan Old Style, Georgia, serif"
    fontWeight: 600
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, -apple-system, Segoe UI, Roboto, sans-serif"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "10px"
  lg: "12px"
  full: "999px"
spacing:
  1: "4px"
  4: "16px"
  6: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brand-600}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.brand-700}"
---

# Design System: Dayflow

## Overview

**Creative North Star: "The Quiet Ledger"**

Dayflow is an internal HR operating tool, not a marketing surface — people check in, request leave, and review payroll here every working day, often several times a day. The login screen already states the brand correctly: near-black surfaces, one exact crimson accent (`#e91e46`), a serif display face reserved for headlines only, plain Inter for everything that has to be read fast. The rest of the app inherited a *different*, unrelated palette — a warm cream background, a second unrelated red (`#e11d48`, one digit off from the login's own accent), and a second "active state" blue that the login world never uses. None of that was a deliberate decision; it was drift. This system closes that gap without turning the working screens into the login screen: the accent, type pairing, and radius/shadow language become one shared vocabulary, while the *content* surface stays light because dense tables and forms read faster on white than on near-black.

The resolved shape is the common "dark rail, light stage" pattern (Linear, Vercel, Notion): the sidebar and mobile nav are the login's exact dark palette (`#0c0c0d` / `#171717` / crimson accent) — the one place in the authenticated app that visually *is* the login screen — while the content area is a quiet, cool-neutral paper (`#f8f7f6`, not the previous cream) with white cards, thin borders instead of shadows, and the same single crimson accent for every primary action, focus ring, and active state. Blue is retired as an interactive color entirely; it survives only as the semantic "info" badge tone, because a second accent competing with the primary one is the exact "AI dashboard" tell this pass exists to remove.

**Key Characteristics:**
- One accent, used sparingly: crimson for primary actions, current selection, and focus — never decoration, never blue in parallel.
- Dark rail (sidebar/mobile nav) quotes the login screen exactly; the content stage stays light for scanability.
- Cards are borders first, shadow only on things that actually float (modals, popovers).
- Fraunces serif is a headline-only accent (h1 page titles); every control, label, table, and body sentence stays on Inter.
- Tighter radius than the previous system (12px cards, 10px controls) — considered, not bubbly.

## Colors

Single warm accent against cool neutrals; the dark rail borrows the login's near-black surfaces verbatim.

### Primary
- **Crimson** (`#e91e46`): primary buttons, links, active nav item, focus rings, the brand mark. Matches the login screen's `--auth-accent` exactly — this is the one color that must never drift between the two worlds again.
- **Crimson Hover** (`#c8163a`): hover/active state for the above. Matches `--auth-accent-hover`.

### Neutral
- **Ink** (`#0f172a` / `#334155` / `#64748b`): primary / secondary / tertiary text on the light stage.
- **Paper** (`#f8f7f6`): the content page background — a cool, barely-there neutral, replacing the previous warm cream (`#f7f2e7`).
- **Card White** (`#ffffff`): every card, table, input, and modal surface on the light stage.
- **Rail Black** (`#0c0c0d` / `#171717`): sidebar and mobile-nav background, quoting the login screen's `--auth-bg` / `--auth-surface`.
- **Rail Text** (`#f5f5f5` / `#9a9a9a`): text on the dark rail, quoting `--auth-text` / `--auth-text-muted`.

### Named Rules
**The One Accent Rule.** Crimson is the only interactive color in the system. Blue never marks a selection, a focus ring, or an active nav item again — it is retired to the "info" semantic badge only, where it means something different from "you can click this."

## Typography

**Display Font:** Fraunces (with Iowan Old Style, Georgia fallback)
**Body Font:** Inter (with system sans fallback)

**Character:** A quiet serif accent on page titles only — one moment of warmth per page — over an otherwise all-Inter interface built for fast reading at density.

### Named Rules
**The Headline-Only Rule.** Fraunces appears on `<h1>` page titles and nowhere else — not on card headers, not on stat values, not in tables, not in buttons. Everything a user reads to *do* something stays on Inter.

## Layout

Fixed rem sizing (no fluid/clamp type — this is a task surface, viewed at a stable desktop or tablet DPI, not a marketing page). Sidebar is a fixed 264px dark rail on desktop; it collapses to a dark mobile header + slide-in drawer under 880px. Content area caps at 1280px, centered, with generous but not excessive outer padding (32px desktop, 16-20px mobile).

## Elevation & Depth

Mostly flat. Cards, stat tiles, and tables rest on a 1px border against the page/card contrast — no resting shadow. Shadow is reserved for things that are genuinely layered above the page: the modal dialog and the mobile drawer's slide-in. Depth comes from contrast and spacing, not blur.

### Named Rules
**The Border-Not-Shadow Rule.** A card at rest is a border. A shadow only appears under an element that is actually floating above other content (modal, drawer, popover-style menu).

## Shapes

Tighter than the previous system: 10px on inputs/buttons (matches the login screen's own input radius exactly), 12px on cards/tables (down from 14-20px), full pill only for badges/avatars/dots. No element goes fully rounded except those.

## Components

### Buttons
- **Shape:** 10px radius, matching login inputs.
- **Primary:** crimson fill, white text, `shadow-xs` only (a 1px-equivalent hairline lift, not a floating shadow).
- **Secondary:** white fill, 1px border, no shadow.
- **Hover/Focus:** primary darkens to crimson-hover; every control gets a 3px crimson-tinted focus ring (`rgba(233,30,70,.16)`), matching the login form's own focus treatment exactly.

### Cards / Containers
- **Corner:** 12px.
- **Background:** white on the light stage.
- **Shadow:** none at rest.
- **Border:** 1px, default neutral.

### Sidebar / Rail (signature component)
- Near-black background (`#0c0c0d`), quoting the login screen's left panel.
- Active nav item: crimson-tinted background (`rgba(233,30,70,.14)`) + crimson text, no shadow, no blue.
- Inactive nav item: `#9a9a9a` text, hover lightens to `#f5f5f5` on a faint white-alpha background — the same hover language the login screen uses on its Google button and password-toggle.

### Inputs / Fields
- **Style:** 10px radius, 1px border, white background on the light stage.
- **Focus:** border turns crimson, 3px crimson-tinted ring — identical treatment to the login form's own inputs.

## Do's and Don'ts

### Do:
- **Do** use crimson for exactly one thing per screen at a time: the primary action or the current selection.
- **Do** let borders carry card edges; reserve shadow for modals/drawers only.
- **Do** keep Fraunces to page-level `<h1>` titles only.

### Don't:
- **Don't** reintroduce a second interactive accent color (blue, purple, or otherwise) for selection/focus states.
- **Don't** touch `frontend/src/pages/auth/LoginPage.jsx`, `SplitAuthLayout.jsx/.module.css`, or `AuthAbstractVisual.jsx` — those are the frozen source of truth this system quotes from, not a page to also restyle.
- **Don't** stack more than two card-level containers vertically on one screen without a reason; prefer one section with internal rows over N small cards.

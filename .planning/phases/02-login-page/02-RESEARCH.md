# Phase 2: Login Page — Research

**Researched:** 2026-05-08
**Domain:** Next.js 16 App Router client-side auth guard, Tailwind CSS v4 design token translation, font loading
**Confidence:** HIGH (core patterns), MEDIUM (Tailwind v4 font-size + font-weight bundled syntax)

---

## Note on CONTEXT.md

No `02-CONTEXT.md` exists yet for this phase. The constraints below are synthesized from three authoritative sources:
- `CLAUDE.md` — project spec + design contracts (checked into repo)
- `.planning/ROADMAP.md` — Phase 2 success criteria
- `.planning/phases/01-api-layer/01-01-SUMMARY.md` — Phase 1 established patterns

These are treated as locked decisions. No discussion session was needed because the design contract is fully specified in CLAUDE.md.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LOGIN-01 | User can enter a username on `/login` page and submit | Controlled form with `useState`, `onSubmit` handler — see Pattern 1 |
| LOGIN-02 | Username saved to sessionStorage under key "username" on submit | `sessionStorage.setItem('username', value)` in submit handler — see Pattern 1 |
| LOGIN-03 | Visiting `/swipe` without a username in sessionStorage redirects to `/login` | `'use client'` + `useEffect` + `router.replace('/login')` — see Pattern 2 |
</phase_requirements>

---

## Summary

Phase 2 builds three things: (1) a styled login page at `/login` that collects a username and stores it in sessionStorage, (2) a root redirect at `/` that sends users to the correct page based on sessionStorage state, and (3) an auth guard on `/swipe` that redirects back to `/login` if no username is found. Because sessionStorage is browser-only, the entire auth guard pattern must be client-side — Next.js middleware cannot read sessionStorage.

The biggest implementation complexity in this phase is not the logic (a simple `useEffect` + `router.replace`) but the Tailwind CSS v4 design token setup. The project uses `@tailwindcss/postcss` v4 (confirmed from `package.json`), which requires CSS-native `@theme` configuration in `globals.css` instead of a `tailwind.config.ts`. All design tokens from the Stitch export (colors, spacing named keys, font sizes with bundled properties, font families, border radii) must be translated to v4 CSS variable syntax before any UI can be built correctly.

`app/layout.tsx`, `app/globals.css`, and `app/page.tsx` are all still create-next-app boilerplate and must be fully replaced in this phase.

**Primary recommendation:** Replace globals.css with a complete `@theme` block, rewrite layout.tsx to load Quicksand via `next/font/google` and Material Symbols via CSS `@import`, then build the three page files as `'use client'` components.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Login form (render + submit) | Browser / Client | — | sessionStorage is client-only; no server state |
| sessionStorage read/write | Browser / Client | — | Web Storage API; unavailable in SSR/middleware |
| Auth guard on /swipe | Browser / Client | — | Must run after hydration; can't use Next.js middleware |
| Root redirect (/ → /login or /swipe) | Browser / Client | — | Same constraint — must read sessionStorage post-hydration |
| Design token delivery | Frontend Server (SSR) | CDN / Static | CSS is embedded in layout; tokens are static |
| Quicksand font serving | CDN / Static | — | next/font/google self-hosts as static asset |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.6 | App Router framework | Already installed; Phase 1 established |
| React | 19.2.4 | UI + hooks (useState, useEffect) | Already installed |
| Tailwind CSS | 4.2.4 | Utility-first styling | Already installed; `@tailwindcss/postcss` v4 |
| TypeScript | ^5 | Type safety | Already installed; strict mode |

Versions verified: `npm view tailwindcss version` → 4.2.4, `npm view next version` → 16.2.6. [VERIFIED: npm registry]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/font/google` | built-in | Self-hosted Quicksand font | Always — eliminates external font request at render |
| `material-symbols` | 0.44.6 | Material Symbols Outlined icon font via npm | Alternative to `<link>` tag; smaller bundle with selective import |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `@import` for Material Symbols | `material-symbols` npm package (`import 'material-symbols/outlined.css'`) | npm package allows tree-shaking; `@import` is simpler, no extra dep |
| CSS `@import` for Material Symbols | `next/font/google` | Material Symbols is a variable icon font with custom axes — NOT supported by `next/font/google` (verified: GitHub discussion #42881) |

**Installation (if using npm package approach):**
```bash
npm install material-symbols
```

**If using CSS @import (simpler, no new dep):** Add to `globals.css` before `@import "tailwindcss"`:
```css
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap");
```

---

## Architecture Patterns

### System Architecture Diagram

```
Browser request → Next.js App Router
                       │
          ┌────────────┼────────────────┐
          │            │                │
        GET /        GET /login       GET /swipe
          │            │                │
    [Client Component] [Client Component] [Client Component]
    useEffect on mount  form submit       useEffect on mount
          │            │                │
    read sessionStorage  write sessionStorage  read sessionStorage
          │            │                │
    username?         router.replace('/swipe')  username?
    ┌─yes──┴──no─┐                      ┌─yes─┴──no─┐
 router.replace  router.replace       render page  router.replace
  ('/swipe')     ('/login')                        ('/login')
```

### Recommended Project Structure

```
app/
├── globals.css          # REWRITE: @theme design tokens + font @import
├── layout.tsx           # REWRITE: Quicksand font + metadata
├── page.tsx             # REWRITE: root redirect client component
├── login/
│   └── page.tsx         # NEW: login form (client component)
└── swipe/
    └── page.tsx         # STUB: auth guard (client component) — built in Phase 3
```

No new component files needed for Phase 2. The login page is self-contained enough for a single page file. The `Navbar.tsx` and `SwipeCard.tsx` components are Phase 3 work.

---

### Pattern 1: Login Form Page (`'use client'`)

**What:** Client component that collects username, validates it's non-empty, saves to sessionStorage, redirects to `/swipe`.

**When to use:** Any form that writes to browser storage.

```tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/use-router
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) return
    sessionStorage.setItem('username', trimmed)
    router.replace('/swipe')   // replace: auth flows should not pollute back-stack
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <button type="submit">Start Sniffing</button>
    </form>
  )
}
```

**Key details:**
- `router.replace` not `router.push` — auth redirects should not pollute browser history
- Trim whitespace before storing — prevents usernames of only spaces
- `required` attribute is a second layer guard; JS validation is the primary

---

### Pattern 2: Auth Guard on `/swipe` (`'use client'` + `useEffect`)

**What:** Client component that checks sessionStorage on mount and redirects to `/login` if no username found.

**Why `useEffect` not top-level code:** sessionStorage does not exist during SSR. Calling it at the top level of a component throws `ReferenceError: sessionStorage is not defined`. The guard must run after hydration.

**Hydration state:** Use `null` (not `false`) as initial state to distinguish "not checked yet" from "checked and empty."

```tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/use-router
// app/swipe/page.tsx (Phase 2 stub — full UI in Phase 3)
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SwipePage() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('username')
    if (!stored) {
      router.replace('/login')
    } else {
      setUsername(stored)
    }
  }, [router])

  if (username === null) return null  // brief blank while checking; avoids flash

  return <div>Swipe page — Phase 3</div>
}
```

**Why `return null` not a spinner:** The check is synchronous and takes <1ms. A spinner would flash for one frame and look broken. Returning `null` is the standard pattern for auth guards.

---

### Pattern 3: Root Redirect (`app/page.tsx`)

**What:** Root page that reads sessionStorage and immediately redirects to `/login` or `/swipe`.

```tsx
// app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const username = sessionStorage.getItem('username')
    router.replace(username ? '/swipe' : '/login')
  }, [router])

  return null  // nothing to render — always redirects
}
```

---

### Pattern 4: Tailwind v4 `@theme` Design Token Setup

**What:** Replace `globals.css` with full design token definitions using v4 CSS-native `@theme` directive.

**Critical v4 syntax differences from v3:**

| v3 (tailwind.config.ts) | v4 (globals.css @theme) | Utility generated |
|------------------------|------------------------|-------------------|
| `colors: { primary: '#9b4500' }` | `--color-primary: #9b4500;` | `bg-primary`, `text-primary` |
| `spacing: { md: '24px' }` | `--spacing-md: 24px;` | `p-md`, `gap-md`, `m-md` |
| `borderRadius: { xl: '0.75rem' }` | `--radius-xl: 0.75rem;` | `rounded-xl` |
| `fontFamily: { display: ['Quicksand'] }` | `--font-display: "Quicksand", sans-serif;` | `font-display` |
| `fontSize: { display: ['40px', { lineHeight: '1.2', fontWeight: '700' }] }` | `--text-display: 40px;` + `--text-display--line-height: 1.2;` + `--text-display--font-weight: 700;` + `--text-display--letter-spacing: -0.02em;` | `text-display` |

**IMPORTANT — Naming collision analysis:**
- The design uses `font-display` (font-family utility) AND `text-display` (font-size utility).
- In v4: `--font-display` → generates `font-display` (font-family); `--text-display` → generates `text-display` (font-size).
- These are SEPARATE namespaces and do NOT conflict. `font-*` maps to font-family utilities; `text-*` maps to font-size utilities. [VERIFIED: tailwindcss.com/docs/font-family, tailwindcss.com/docs/font-size]

**Complete `globals.css` token block:**

```css
/* Material Symbols: must come before @import "tailwindcss" */
/* Quicksand loaded via next/font/google in layout.tsx — no @import needed */
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap");

@import "tailwindcss";

@theme {
  /* === Colors === */
  --color-primary: #9b4500;
  --color-primary-container: #ff8c42;
  --color-primary-fixed: #ffdbc9;
  --color-primary-fixed-dim: #ffb68d;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #6a2d00;
  --color-on-primary-fixed: #331200;
  --color-on-primary-fixed-variant: #763300;
  --color-surface: #fbf9f8;
  --color-surface-bright: #fbf9f8;
  --color-surface-dim: #dcd9d9;
  --color-surface-variant: #e4e2e1;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f6f3f2;
  --color-surface-container: #f0eded;
  --color-surface-container-high: #eae8e7;
  --color-surface-container-highest: #e4e2e1;
  --color-on-surface: #1b1c1c;
  --color-on-surface-variant: #564338;
  --color-background: #fbf9f8;
  --color-on-background: #1b1c1c;
  --color-secondary: #665d50;
  --color-secondary-container: #ede1d0;
  --color-secondary-fixed: #ede1d0;
  --color-secondary-fixed-dim: #d1c5b5;
  --color-on-secondary: #ffffff;
  --color-on-secondary-container: #6c6356;
  --color-on-secondary-fixed: #211b11;
  --color-on-secondary-fixed-variant: #4d463a;
  --color-tertiary: #3c6a00;
  --color-tertiary-container: #83ba48;
  --color-tertiary-fixed: #b8f47a;
  --color-tertiary-fixed-dim: #9dd761;
  --color-on-tertiary: #ffffff;
  --color-on-tertiary-container: #274700;
  --color-on-tertiary-fixed: #0e2000;
  --color-on-tertiary-fixed-variant: #2c5000;
  --color-error: #ba1a1a;
  --color-error-container: #ffdad6;
  --color-on-error: #ffffff;
  --color-on-error-container: #93000a;
  --color-outline: #897266;
  --color-outline-variant: #ddc1b3;
  --color-surface-tint: #9b4500;
  --color-inverse-surface: #303030;
  --color-inverse-on-surface: #f3f0f0;
  --color-inverse-primary: #ffb68d;

  /* === Spacing (named scale) === */
  --spacing-xs: 4px;
  --spacing-base: 8px;
  --spacing-sm: 12px;
  --spacing-md: 24px;
  --spacing-lg: 40px;
  --spacing-xl: 64px;
  --spacing-container-padding: 20px;
  --spacing-card-gutter: 16px;

  /* === Border Radius === */
  --radius-xl: 0.75rem;      /* inputs: 12px */
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;      /* cards: 24px */
  --radius-full: 9999px;     /* buttons: pill */

  /* === Font Families === */
  /* next/font/google injects --font-quicksand via variable: '--font-quicksand' in layout.tsx */
  --font-display: var(--font-quicksand), sans-serif;
  --font-headline-lg: var(--font-quicksand), sans-serif;
  --font-headline-md: var(--font-quicksand), sans-serif;
  --font-body-lg: var(--font-quicksand), sans-serif;
  --font-body-md: var(--font-quicksand), sans-serif;
  --font-label-lg: var(--font-quicksand), sans-serif;
  --font-label-sm: var(--font-quicksand), sans-serif;

  /* === Font Sizes with bundled properties === */
  /* display: 40px / lh 1.2 / weight 700 / tracking -0.02em */
  --text-display: 40px;
  --text-display--line-height: 1.2;
  --text-display--font-weight: 700;
  --text-display--letter-spacing: -0.02em;

  /* headline-lg: 32px / lh 1.2 / weight 700 */
  --text-headline-lg: 32px;
  --text-headline-lg--line-height: 1.2;
  --text-headline-lg--font-weight: 700;

  /* headline-md: 24px / lh 1.3 / weight 600 */
  --text-headline-md: 24px;
  --text-headline-md--line-height: 1.3;
  --text-headline-md--font-weight: 600;

  /* body-lg: 18px / lh 1.6 / weight 500 */
  --text-body-lg: 18px;
  --text-body-lg--line-height: 1.6;
  --text-body-lg--font-weight: 500;

  /* body-md: 16px / lh 1.6 / weight 400 */
  --text-body-md: 16px;
  --text-body-md--line-height: 1.6;
  --text-body-md--font-weight: 400;

  /* label-lg: 14px / lh 1.2 / weight 600 / tracking 0.01em */
  --text-label-lg: 14px;
  --text-label-lg--line-height: 1.2;
  --text-label-lg--font-weight: 600;
  --text-label-lg--letter-spacing: 0.01em;

  /* label-sm: 12px / lh 1.2 / weight 700 */
  --text-label-sm: 12px;
  --text-label-sm--line-height: 1.2;
  --text-label-sm--font-weight: 700;
}

/* Material Symbols variation settings */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-family: 'Material Symbols Outlined';
}
.material-symbols-outlined.fill {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

**IMPORTANT NOTE about `--spacing-base`:**

The design uses `base` as a spacing key (e.g., `mt-base`, `gap-base` = 8px). However, Tailwind v4's default scale uses a numeric `--spacing` base unit (multiplied by number). Defining `--spacing-base: 8px` creates `p-base`, `m-base` etc. — verify during implementation that this doesn't collide with Tailwind's built-in `base` size if any exists. [ASSUMED — no explicit v4 docs found for this edge case]

---

### Pattern 5: Rewritten `layout.tsx`

**What:** Replace boilerplate with Quicksand font + Pawnder metadata. Material Symbols loaded via CSS (not `next/font`).

```tsx
// Source: https://nextjs.org/docs/app/getting-started/fonts
// app/layout.tsx
import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-quicksand',  // injects --font-quicksand CSS var; referenced in @theme tokens
})

export const metadata: Metadata = {
  title: 'Pawnder',
  description: 'Find your perfect furry match',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Use quicksand.variable (not .className) so --font-quicksand is injected as a CSS var
    // enabling @theme tokens like --font-display: var(--font-quicksand) to resolve
    <html lang="en" className={quicksand.variable}>
      <body>{children}</body>
    </html>
  )
}
```

**Why `.variable` not `.className`:** `quicksand.className` applies the font directly but does not expose a CSS variable. `quicksand.variable` injects `--font-quicksand` as a CSS custom property on the `<html>` element, which is what the `@theme` tokens (`--font-display: var(--font-quicksand)`) need to resolve. Without `.variable`, all Quicksand font-family tokens fall through to `sans-serif`.

**Material Symbols:** Loaded via `@import url(...)` in `globals.css` only — `next/font/google` does NOT support variable icon fonts with custom axes. [VERIFIED: github.com/vercel/next.js/discussions/42881]

---

### Pattern 6: Login Page Design Translation (Mobile + Desktop)

**Adapted from design:** The Stitch design has email + password fields. Per CLAUDE.md and REQUIREMENTS.md: username-only, no password, no "Forgot password", no "Create an account" link.

**What to keep from design:**
- Mobile: `h-screen flex flex-col`, top half hero image (`h-1/2 w-full object-cover`), bottom half `bg-surface rounded-t-[32px] -mt-6` overlapping card with shadow
- Desktop: `min-h-screen flex flex-row`, left `md:w-3/5` full-height image with gradient, right `md:w-2/5` centered form
- CTA button: `bg-primary text-on-primary rounded-full` (desktop design) with `arrow_forward` icon

**Hero image:** Design HTML uses `lh3.googleusercontent.com` URLs (Google's AIDA public image CDN). These URLs may not be stable long-term. Use `next/image` with `unoptimized` prop or use a `/public` placeholder. Recommend: use the URL as `src` for `<img>` (not `next/image`) for the workshop prototype — avoids configuring `remotePatterns` in `next.config.ts`. [ASSUMED: suitable for workshop; production would use next/image with remotePatterns]

---

### Anti-Patterns to Avoid

- **Reading sessionStorage at module scope:** `const username = sessionStorage.getItem(...)` at the top of a component (outside useEffect) throws `ReferenceError` during SSR. Always read in `useEffect`.
- **Using `router.push` for auth redirects:** Adds entries to browser history stack — user can navigate "back" to the unprotected page. Use `router.replace`.
- **Using Next.js middleware for sessionStorage auth:** Middleware runs on the server/edge where Web Storage APIs don't exist.
- **Importing `useRouter` from `next/router`:** Only works with Pages Router. App Router requires `import { useRouter } from 'next/navigation'`. [VERIFIED: nextjs.org/docs/app/api-reference/functions/use-router]
- **Putting `tailwind.config.ts` with v4:** `@tailwindcss/postcss` v4 ignores `tailwind.config.ts` by default. All customization belongs in `globals.css` `@theme` block.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading optimization | Custom font preload logic | `next/font/google` for Quicksand | Eliminates layout shift, self-hosts, prevents Google tracking |
| Icon font (Material Symbols) | Copy/paste SVG icons | CSS `@import` or `material-symbols` npm | Icons are ligature-based; the font file handles all variants |
| Client-side navigation | `window.location.href = '/swipe'` | `router.replace('/swipe')` | Preserves React state, uses client-side routing, no full page reload |
| Username validation | Complex regex | `value.trim().length > 0` | Username is purely for record-keeping — no format requirements |

**Key insight:** The auth guard in this project is intentionally minimal — it's an identifier, not authentication. Don't add complexity (JWT, cookies, httpOnly headers) that the spec explicitly excluded.

---

## Common Pitfalls

### Pitfall 1: sessionStorage SSR ReferenceError
**What goes wrong:** Component crashes during server-side render with `ReferenceError: sessionStorage is not defined`.
**Why it happens:** `sessionStorage` is a browser API. Next.js renders components on the server during SSR/prerendering. Any code that runs synchronously at the module or component function scope will execute on the server.
**How to avoid:** All sessionStorage reads/writes go inside `useEffect(() => { ... }, [])` — this callback only runs in the browser after hydration.
**Warning signs:** Error in terminal during `npm run dev` mentioning `sessionStorage is not defined`.

### Pitfall 2: Flash of Unprotected Content (FOUC)
**What goes wrong:** `/swipe` briefly renders its content before the `useEffect` auth check fires and redirects to `/login`.
**Why it happens:** React renders the component first, then runs effects.
**How to avoid:** Use `useState<string | null>(null)` for username and `return null` until the check completes. `null` initial state = "not checked yet"; only render content when `username` is a non-null string.
**Warning signs:** Brief flash of the swipe page content before redirect.

### Pitfall 3: Wrong `useRouter` Import
**What goes wrong:** `useRouter` from `next/router` throws an error in App Router: "You have tried to use the router from `next/router`...".
**Why it happens:** Two different router implementations exist — Pages Router (`next/router`) and App Router (`next/navigation`).
**How to avoid:** Always `import { useRouter } from 'next/navigation'` in App Router.
**Warning signs:** Immediate runtime error on any page that imports useRouter.

### Pitfall 4: Tailwind v4 Token Not Generating Utilities
**What goes wrong:** Class like `bg-primary` or `p-md` doesn't apply any style.
**Why it happens:** Defined token name doesn't match the expected namespace prefix, or the `@theme` block is placed after `@import "tailwindcss"` in a way that conflicts.
**How to avoid:** (a) Use correct namespace: `--color-*` for colors, `--spacing-*` for spacing, `--radius-*` for border radii, `--font-*` for families, `--text-*` for sizes. (b) Ensure `@import "tailwindcss"` comes after any `@import url(...)` for external fonts in `globals.css`.
**Warning signs:** Utility class applied in HTML but no visible style effect; browser DevTools shows no matching CSS rule.

### Pitfall 5: `--spacing-base` Collision
**What goes wrong:** `--spacing-base: 8px` may collide with Tailwind v4's built-in `base` spacing key if one exists.
**Why it happens:** The design system uses `base` as a spacing scale name (8px); Tailwind's default numeric scale uses integer keys.
**How to avoid:** If `p-base` doesn't work as expected, rename to `--spacing-8` (8px by convention) or use `p-2` (8px at 4px base). Check during Wave 0.
**Warning signs:** `mt-base` applies wrong value or no value.

---

## Design Adaptation Notes (from CLAUDE.md)

The Stitch export design has several elements that MUST be adapted or removed for our app:

| Design Element | Design Has | Our App | Action |
|---------------|------------|---------|--------|
| Email field | `type="email"` | Username only | Replace with `type="text"`, change placeholder to "Username" |
| Password field | Yes (mobile design) | None | Remove entirely |
| "Forgot password?" link | Yes (mobile design) | None | Remove entirely |
| "New here? Create an account" link | Yes (both designs) | None | Remove entirely |
| CTA button | "Start Sniffing" | "Start Sniffing" | Keep |
| Hero image | `lh3.googleusercontent.com` URL | Same URL for workshop | Keep; note it may break in production |
| Desktop: floating emoji icons (pets, skeleton, favorite) | Yes | Keep | Visual decoration; no function |

**Mobile design note:** The mobile HTML shows email+password. The DESKTOP HTML (code.html) already has a username-only form with `type="text"` and `id="username"` — this is the closer reference for the adapted implementation.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 |
| Config file | `vitest.config.ts` (exists, `environment: "node"`) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Critical Gap: `environment: "node"` for Component Tests

The existing `vitest.config.ts` sets `environment: "node"`. Browser APIs (sessionStorage, DOM, React rendering) are unavailable in node environment. Component tests for Phase 2 pages would require:

1. Setting `environment: "jsdom"` or `environment: "happy-dom"` in vitest config
2. Installing `@testing-library/react` and `@testing-library/user-event`

**Recommendation for Phase 2:** Skip automated component tests. The auth guard logic is 5-10 lines of pure browser logic that is more reliably verified by manual UAT (open browser, check redirect). Automated testing of sessionStorage + router.replace in Vitest requires significant test scaffolding for marginal value in a workshop prototype.

**Alternative:** Add a single smoke test that verifies the pages exist and export a default function (no rendering, just module-level check). This preserves the TDD gate without requiring jsdom.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOGIN-01 | /login page renders username input | manual UAT | — | ❌ Wave 0 (optional) |
| LOGIN-02 | Submit sets sessionStorage['username'] | manual UAT | — | ❌ Wave 0 (optional) |
| LOGIN-03 | /swipe without username redirects to /login | manual UAT | — | ❌ Wave 0 (optional) |

### Wave 0 Gaps

- [ ] No new test files required if using manual UAT approach
- [ ] If automated tests desired: install `@testing-library/react`, update vitest.config.ts environment to `jsdom`, create `app/login/page.test.tsx`

### Sampling Rate
- **Per task commit:** `npm test` (existing 15 API tests must stay green)
- **Per wave merge:** `npm test` (same)
- **Phase gate:** All 15 existing tests green + manual UAT of 4 success criteria from ROADMAP.md

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js dev server | ✓ | 22.14.0 | — |
| Next.js | Framework | ✓ | 16.2.6 | — |
| Tailwind CSS v4 | Styling | ✓ | 4.2.4 | — |
| Google Fonts CDN | Material Symbols @import | Network required | — | npm `material-symbols` package |

All dependencies are available. [VERIFIED: Bash — `node --version`, `npm view` commands]

---

## Runtime State Inventory

Step 2.5 SKIPPED — This phase is not a rename/refactor/migration. No existing runtime state is affected. Phase 2 creates new files only.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Username-only; explicitly no auth per spec |
| V3 Session Management | Partial | sessionStorage (cleared on tab close); no sensitive data |
| V4 Access Control | No | No roles/permissions in scope |
| V5 Input Validation | Yes | Trim + non-empty check on username |
| V6 Cryptography | No | No secrets stored |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Empty/whitespace username | Tampering | `value.trim().length > 0` check before storing |
| XSS via username display | Spoofing | React JSX auto-escapes text content; no `dangerouslySetInnerHTML` |
| sessionStorage poisoning | Tampering | Username is display-only; no privilege associated; low risk |

**Note:** Per `useRouter` docs — "You must not send untrusted or unsanitized URLs to `router.push` or `router.replace`." The redirect targets (`/swipe`, `/login`) are hardcoded strings, not user input — no XSS risk. [CITED: nextjs.org/docs/app/api-reference/functions/use-router]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.ts` with theme.extend | `@theme` CSS directive in globals.css | Tailwind v4 (2025) | No config file needed; all tokens are CSS variables |
| `import { useRouter } from 'next/router'` | `import { useRouter } from 'next/navigation'` | Next.js 13.4 (App Router GA) | Different import path; old path throws in App Router |
| Geist font (create-next-app default) | Quicksand via `next/font/google` | Phase 2 | layout.tsx must be rewritten |
| `next/font/google` for all Google fonts | CSS `@import` for variable icon fonts | ongoing | Material Symbols needs `@import`; `next/font` doesn't support it |

**Deprecated in this project:**
- `app/layout.tsx` current content (Geist + demo metadata) — must be replaced
- `app/globals.css` current content (demo CSS variables, Arial font) — must be replaced
- `app/page.tsx` current content (Next.js demo page) — must be replaced

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `--spacing-base: 8px` generates `p-base`, `mt-base` etc. without colliding with built-in Tailwind v4 spacing keys | Pattern 4, Pitfall 5 | `mt-base` may not work; use `mt-2` (8px at default 4px scale) as fallback |
| A2 | Hero image URLs from `lh3.googleusercontent.com` are stable for the workshop duration | Pattern 6 | Image 404s; fallback: use a `/public/dog-hero.jpg` placeholder |
| A3 | `return null` during auth guard check (brief blank state) is acceptable UX for the workshop | Pattern 2 | Flicker may be visible on slow machines; add loading skeleton if needed |
**A4 RESOLVED:** Quicksand loaded via `next/font/google` (self-hosted). CSS `@import` used only for Material Symbols.

---

## Resolved Decisions

1. **Phase 2 MUST create `app/swipe/page.tsx` as a stub (auth guard only).**
   Without this file the redirect target for LOGIN-03 does not exist — the browser returns 404 before the guard ever fires. Phase 2 delivers the guard; Phase 3 replaces the stub body with the full swipe UI. (See Pattern 2 for the exact stub code.)

2. **Quicksand font loading: `next/font/google` with `.variable`.**
   Quicksand is loaded via `next/font/google` with `variable: '--font-quicksand'` in `layout.tsx`, and `.variable` (not `.className`) is applied to `<html>`. This self-hosts the font (no external request at render time, eliminates layout shift) and exposes `--font-quicksand` as a CSS custom property for `@theme` tokens. Material Symbols is loaded via CSS `@import url(...)` in `globals.css` — `next/font/google` does not support variable icon fonts with custom axes.

---

## Sources

### Primary (HIGH confidence)
- [nextjs.org/docs/app/api-reference/functions/use-router](https://nextjs.org/docs/app/api-reference/functions/use-router) — useRouter API, push vs replace, import path
- [nextjs.org/docs/app/getting-started/fonts](https://nextjs.org/docs/app/getting-started/fonts) — next/font/google usage pattern, version 16.2.6 docs
- [tailwindcss.com/docs/font-family](https://tailwindcss.com/docs/font-family) — --font-* CSS variable naming
- [tailwindcss.com/docs/font-size](https://tailwindcss.com/docs/font-size) — --text-* with --text-name--line-height, --font-weight, --letter-spacing
- [tailwindcss.com/docs/border-radius](https://tailwindcss.com/docs/border-radius) — --radius-* naming
- [tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide) — v4 @theme migration
- Design files: `/design/pawnder_login_mobile/code.html`, `/design/pawnder_login_desktop/code.html` — authoritative Stitch export

### Secondary (MEDIUM confidence)
- [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme) — confirmed --spacing-* for named spacing keys
- GitHub Discussion #42881 — confirmed Material Symbols not supported by next/font/google
- GitHub Discussion #18086 — confirmed --font-* and --text-* are separate namespaces (no collision)

### Tertiary (LOW confidence)
- [npm: material-symbols v0.44.6](https://www.npmjs.com/package/material-symbols) — npm package alternative for icon font

---

## Project Constraints (from CLAUDE.md)

Directives the planner must enforce:

1. **Framework:** Next.js App Router only — no Pages Router patterns
2. **Username only:** No password field, no auth, no "Forgot password" link — username is for record-keeping only
3. **sessionStorage key:** Must be exactly `"username"` (lowercase)
4. **Storage type:** sessionStorage — not localStorage (clears on tab close by design)
5. **Design source:** Use Stitch export HTML as base — do not invent UI
6. **Tailwind v4:** No `tailwind.config.ts` — all tokens in `globals.css` `@theme` block
7. **File structure:** `app/login/page.tsx`, `app/swipe/page.tsx` stub, `app/page.tsx` redirect
8. **Adaptation:** Desktop HTML (code.html) is closer to final — already has username-only form; mobile HTML has email+password (drop those fields)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from installed package.json + npm registry
- Auth guard pattern: HIGH — verified from official Next.js 16.2.6 docs
- Tailwind v4 color/spacing tokens: HIGH — verified from official tailwindcss.com docs
- Tailwind v4 font-size bundled properties: MEDIUM — syntax verified from docs; --spacing-base collision is unverified edge case
- Material Symbols loading: HIGH — limitation confirmed in GitHub discussion; CSS @import workaround documented

**Research date:** 2026-05-08
**Valid until:** 2026-06-08 (stable APIs; Tailwind v4 is evolving but core @theme syntax is stable)

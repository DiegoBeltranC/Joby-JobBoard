# Mobile-First Responsiveness

## Non-negotiable: every new UI must be mobile-friendly

All new UI — pages, layouts, components, modals/sheets — **must work on mobile, built mobile-first**.
A feature is not "done" if it only looks right on desktop. Usable from **~320px** wide up, with no
horizontal scroll and no clipped/overlapping content. Comfortable tap targets, spacing, and type on
touch devices.

## Mobile-first Tailwind

Base styles = mobile; add `md:` / `lg:` for larger screens. Never write desktop-first with overrides.

```tsx
// ❌ desktop-first
<div className="grid grid-cols-3 sm:grid-cols-1">…</div>
// ✅ mobile-first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">…</div>
```

Focus on three ranges: no prefix (mobile), `md:` (≥768, tablet), `lg:` (≥1024, desktop). Avoid `sm:`,
`xl:`, `2xl:` unless there's a real need.

## Viewport (App Router)

The viewport is configured via Next metadata, not an `index.html`. If you need safe-area support,
export `viewport` from the root layout:

```ts
// src/app/layout.tsx
import type { Viewport } from "next";
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
```

Safe-area utilities come from Tailwind v4 `@theme` tokens in `globals.css`
(`--spacing-safe-bottom: env(safe-area-inset-bottom)` → `pb-safe-bottom`).

## Navigation

Desktop sidebar (`lg:`) + mobile bottom nav; avoid a hamburger menu where a bottom nav fits. The
dashboard shells (`DashboardShell`, `Sidebar`) already follow this — match them.

```tsx
<aside className="hidden lg:flex lg:w-64 lg:flex-col border-r">…</aside>
<main className="flex-1 pb-16 lg:pb-0">{children}</main>
<nav className="fixed bottom-0 inset-x-0 pb-safe-bottom border-t bg-background lg:hidden">…</nav>
```

## Dialogs vs Sheets

Use a shadcn **`Dialog`** on desktop and a bottom **`Sheet`** on mobile for forms/actions. Add both
primitives via the shadcn CLI if missing (`npx shadcn@latest add dialog sheet`). Switch with a
`useMediaQuery`/`useIsMobile` client hook (hooks.md) and render one branch or the other (early return)
so each keeps its own typed props — don't pass a component as a prop.

## Touch targets & hover

Minimum **44×44px** touch targets on mobile; shrink on desktop (`className="size-11 lg:size-9"`).
Apply hover only where a fine pointer exists (`lg:hover:…`) so mobile taps don't get stuck hover states.

## Layout patterns

- **Cards/KPIs:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`.
- **Forms:** single column on mobile, `md:grid-cols-2` on larger; full-width fields via `md:col-span-2`.
- **Tables:** hide low-priority columns on mobile (`hidden md:table-cell`) and/or wrap in
  `overflow-x-auto` so wide content scrolls inside its own container, never the page body.
- **Images:** responsive, never fixed px — `className="w-full max-w-md h-auto"`; use `next/image`
  where appropriate.
- **Typography:** responsive sizes on headings only (`text-xl md:text-2xl lg:text-3xl`); body text
  stays fixed (`text-sm`).

## Verify before "done"

Check at ~375px, 768px, and ≥1024px: navigation, 44px tap targets, tables (hidden cols / horizontal
scroll), Dialog↔Sheet switch, forms, and no text overflow. If converting a prototype, match its
mobile frames (html-prototype.md).

See also: ui.md, design-system.md, react.md, hooks.md.

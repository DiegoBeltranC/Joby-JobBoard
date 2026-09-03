# HTML Prototype → Production React (Pixel Perfect)

## Overview

Some UI work starts from a **standalone HTML prototype/mockup** (design-tool export or hand-built
page). This project keeps such mockups under **`scratch/`** (e.g. `scratch/modelo-negocio.html`,
`scratch/diagrama-*.html`). When a task is "convert this mockup", **fidelity to the mockup is the bar**
— reproduce it, don't reinterpret it.

```
scratch/<name>.html            single self-contained HTML mockup (markup + <style> + inlined assets)
        ↓  read markup + computed styles
   map every token: spacing, type, color, border, shadow, state
        ↓
   production React (Server/Client Component) + Tailwind v4 + shadcn tokens
        ↓  review side-by-side against the original
   pixel-perfect section
```

## Golden rules

1. **The mockup is the spec.** 20px padding ships as 20px (`p-5`), not "close enough".
2. **Read the actual values.** Inspect inline `style=`, `<style>` blocks, and classes; map to the
   nearest exact Tailwind token (v4 spacing = 0.25rem steps). Large exports: grep the section, don't
   read the whole file into context.
3. **Match states, not just the static frame** — hover, focus, disabled, active/selected, transitions.
4. **Respect the system.** Reuse `@/components/ui` (shadcn) and the design tokens; a new file should
   look like it was made by the same hand as the rest of the app.
5. **Generate fast, verify by eye** — review every value against the target.

## Stack for the conversion

- **Next.js App Router + React 19 + TypeScript.** Keep it a Server Component unless it needs
  interactivity, then add `"use client"` (react.md).
- **Tailwind v4** with the token classes from `globals.css` (design-system.md) — `bg-primary`,
  `text-muted-foreground`, `border-border`, not raw hex or `bg-gray-100`.
- **shadcn/ui + Radix** primitives + `lucide-react` icons (ui.md). Add missing primitives with
  `npx shadcn@latest add …`.
- `@/` alias → `src/`. `cn()` from `@/lib/utils`.

## Workflow

1. **Read the mockup section** — DOM structure, every style source, all interactive states, and any
   responsive/mobile variant.
2. **Extract tokens** into a quick table before coding:

   | Property | Mockup value | Tailwind |
   |---|---|---|
   | container padding | 24px | `p-6` |
   | gap between cards | 16px | `gap-4` |
   | card radius | 12px | `rounded-xl` |
   | primary action bg | `#009374` | `bg-primary` |

   Prefer scale tokens when they match exactly; use arbitrary values (`gap-[18px]`) when the value
   falls between steps. Map brand colors to the **semantic tokens** (design-system.md), not raw hex.
3. **Build the component** — one component per section, extract repeated markup into sub-components,
   wire the `useState` the section needs.
4. **Reproduce every state** — `hover:`, `focus-visible:ring-ring/50`, `disabled:`, active/selected,
   `transition-*`.
5. **Review side-by-side (mandatory)** — run `npm run dev` (port 3000), open the component next to the
   mockup, and walk `fidelity.md` top to bottom. Fix every mismatch before declaring done. Verify
   mobile too (responsive.md).

## Value-mapping cheatsheet (Tailwind v4)

| px | spacing | | font px | text |
|---|---|---|---|---|
| 4 | `1` | | 12 | `text-xs` |
| 8 | `2` | | 14 | `text-sm` |
| 12 | `3` | | 16 | `text-base` |
| 16 | `4` | | 18 | `text-lg` |
| 20 | `5` | | 20 | `text-xl` |
| 24 | `6` | | 24 | `text-2xl` |

Radius: `4=rounded 6=rounded-md 8=rounded-lg 12=rounded-xl 16=rounded-2xl 9999=rounded-full`.
Weight: `400 font-normal / 500 font-medium / 600 font-semibold / 700 font-bold`.
When a value isn't on the scale, use arbitrary syntax — never round away fidelity.

See `react.md`, `ui.md`, `design-system.md`, `responsive.md` for per-layer detail, and `fidelity.md`
for the review checklist.

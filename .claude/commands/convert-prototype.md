You are a senior React engineer doing a **live, pixel-perfect conversion** of one
section of an HTML mockup into production React (Next.js App Router). Fidelity to the
mockup is the bar. Move fast with AI, but review every value against the target.

<critical>The mockup is the spec. Reproduce it exactly — do not redesign.</critical>
<critical>Match STATES (hover/focus/disabled/active) and transitions, not just the static frame.</critical>
<critical>Respect the system: reuse existing components, tokens and patterns. New file must look made by the same hand as the rest of the app.</critical>
<critical>Before declaring done, walk the full fidelity checklist (`fidelity.md`) side-by-side with the running mockup.</critical>

## Input

The user gives you one section of an HTML mockup — as a file in `scratch/` (this repo keeps
mockups there, e.g. `scratch/modelo-negocio.html`), pasted markup, or a screen-shared snippet.
If it's a file, Read it. If pasted, save it to `scratch/<name>.html` first so it stays the
reference.

## Rules to load

Read these before coding: `html-prototype.md`, `fidelity.md`, `react.md`,
`ui.md`, `responsive.md`. (The Edit/Write hook auto-injects most on `.tsx` edits.)

## Steps

### 1. Read & extract tokens
- Read the section's HTML + every style source (inline, `<style>`, classes, CSS vars).
- Produce a short value table: spacing, typography, colors, radius, shadow, states.
- Map each to the exact Tailwind v4 token; map brand colors to the **semantic tokens** from
  `globals.css` (`bg-primary` = UT green `#009374`, `text-muted-foreground`, `border-border`),
  and use arbitrary values (`p-[18px]`, `gap-[18px]`) only when the value is off-scale.
  Fidelity > clean tokens.

### 2. Plan the component
- Name it for the section (PascalCase, one component per file in `src/components/` — or the
  route's own `page.tsx`/co-located file when it belongs to a single route segment).
- Identify repeated markup → extract a sub-component, don't copy-paste.
- Keep it a **Server Component** unless it needs interactivity; add `"use client"` and
  `useState` only for tabs/toggles/selection (react.md).

### 3. Build
- Function component, typed props (`<Name>Props`), `@/` imports (`@/components/ui/*`,
  `cn()` from `@/lib/utils`).
- Tailwind classes matching the extracted values exactly.
- Give interactive elements accessible roles/labels so e2e (Playwright) can target them (tests.md).
- Render it in the relevant route's `page.tsx` (or a throwaway preview route under `src/app/`)
  so it shows in the running dev server.

### 4. Reproduce states
- `hover:` (guard with `lg:` where a fine pointer is expected), `focus-visible:ring-*`,
  `disabled:`, active/selected, `transition-*`.

### 5. Review (mandatory)
- Ensure dev server is running (`npm run dev`, port 3000); fix any TS/lint error.
- Walk `fidelity.md` top to bottom against the mockup. Fix every mismatch. Verify mobile too
  (responsive.md).

### 6. Close
- State the closing phrase from `fidelity.md`: fidelity + system + the one thing
  you'd extract into a shared component with more time.

## Environment commands
```bash
npm run dev      # dev server + HMR (http://localhost:3000)
npm run build    # next build — type-check + production compile gate
npm run lint     # eslint
```

<critical>Do not finish until the section matches the mockup on spacing, type, color, borders AND states, and the fidelity checklist passes.</critical>

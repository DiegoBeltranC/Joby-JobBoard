# Design System

**Source of truth:** `src/app/globals.css` (the `:root` + `.dark` CSS variables) and the installed
`src/components/ui/*` shadcn primitives. When in doubt, read those files — this is a quick reference.

Applies to all bolsa-trabajo (Joby) UI. The brand is **UT Chetumal**; the signature color is **UT green**.

## Golden rules

1. **Use semantic tokens, never raw colors.** `bg-primary` not `bg-green-600`; `text-muted-foreground`
   not `text-gray-500`; `border-border` not `border-gray-200`; `bg-card` not `bg-white`. Hardcoded hex
   in components is a bug.
2. **Reference before creating.** Check existing pages/components and `@/components/ui` first; add
   missing shadcn primitives with the CLI (ui.md). Don't rebuild.
3. **Both themes.** Tokens are defined for light (`:root`) and dark (`.dark`). Style with tokens so a
   component works in both; test dark mode.
4. **Implement all states** — default, hover, active, disabled, loading, empty, error.
5. **Mobile-first** — every screen works from ~320px (responsive.md).

## Token palette (`globals.css`)

| Token (class)                    | Light      | Meaning |
|----------------------------------|------------|---------|
| `primary` / `primary-foreground` | `#009374` / `#fff` | **UT green** — buttons, links, active, focus ring |
| `secondary` / `-foreground`      | `#e6f4f1` / `#009374` | soft green background + green text |
| `background` / `foreground`      | `#fff` / `#53565A` | page bg / default text (UT dark gray) |
| `card` / `card-foreground`       | `#fff` / `#53565A` | cards, popovers |
| `muted` / `muted-foreground`     | `#f8fafc` / `#A2AAAD` | subtle bg / secondary text (UT light gray) |
| `accent` / `accent-foreground`   | `#e6f4f1` / `#009374` | hover/selected surfaces |
| `destructive`                    | `#ef4444`  | errors / destructive actions |
| `border` / `input`               | `#e2e8f0`  | borders and input outlines |
| `ring`                           | `#009374`  | focus ring |
| `sidebar*`                       | —          | sidebar surface tokens (shell nav) |
| `chart-1..5`                     | —          | chart series (chart-1 = UT green) |

Dark mode (`.dark`) keeps UT green as `primary` over `#1a1b1e` / `#25262b` surfaces with `#fff` text.
Exact values live in `globals.css` — read there, don't guess.

## Radius

`--radius: 0.625rem` (10px), with the shadcn scale exposed as `rounded-sm/md/lg/xl/2xl/3xl/4xl`
(`--radius-*` in `@theme inline`). Default component radius is `rounded-md`; cards/modals go larger.

## Typography

Body font is loaded in the root layout (`Inter` / Geist via `--font-geist-sans` in the theme). Use
Tailwind's type scale (`text-sm`, `text-base`, `text-lg`, `text-2xl`, …) and `font-medium` /
`font-semibold` for emphasis. Don't introduce new font families without a design reason.

## Common mistakes

| ❌ | ✅ |
|----|----|
| `bg-green-600` / `#009374` inline | `bg-primary` |
| `text-gray-500` | `text-muted-foreground` |
| `border-gray-200` | `border-border` |
| `bg-white` | `bg-background` / `bg-card` |
| hardcoded hex | token class backed by a CSS variable |
| new primitive from scratch | `npx shadcn@latest add …` then reuse |

Exact CSS variables and component APIs: `src/app/globals.css` + `src/components/ui/`.

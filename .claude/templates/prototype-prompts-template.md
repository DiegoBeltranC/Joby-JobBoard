# UI Mockup Briefs - [Project Name]

> A tool-agnostic **UI mockup brief per screen**. Each brief fully describes one screen so it can be
> built as a self-contained HTML mockup (by hand or with any AI/design tool) and saved under
> **`scratch/<name>.html`**. Those mockups are the source of truth for the pixel-perfect React
> conversion (see `html-prototype.md` and the `/convert-prototype` command).

## Design Guidelines

[Define the visual guidelines that apply to ALL screens. Example:]

- Style: Clean, modern, minimal
- Color palette: driven by the design tokens in `src/app/globals.css` — primary = UT green
  `#009374` (`--primary`); use the semantic tokens, not raw hex (design-system.md)
- Typography: system sans-serif stack
- Component library: **shadcn/ui** (new-york) + Radix look — rounded corners, subtle borders,
  muted backgrounds; icons from `lucide-react`
- Layout: Responsive, **mobile-first** (~320px and up, no horizontal overflow — responsive.md)
- Language: **Spanish** (product language — i18n.md)

---

## Screen 1: [Screen Name]

**Route:** `/[route]` (Spanish segment, e.g. `/vacantes`, `/perfil`)
**Description:** [Brief description of the screen purpose and which role sees it (estudiante / empresa / admin)]

### Brief

```
Describe the screen so it can be built without further questions:
- Screen goal — what the user accomplishes here
- Layout structure — regions/sections and how they stack (mobile) vs. lay out (desktop)
- Components — the concrete shadcn/ui primitives to use (Card, Button, Input, Dialog/Sheet,
  Badge, Table, Tabs, etc.) and where each goes
- Data displayed — realistic Spanish mock data (vacantes, empresas, estudiantes, postulaciones…)
- Interactive elements — buttons, inputs, filters, and what they do
- Visual states — empty, loading, filled, error, disabled/selected — whichever apply
- Responsive behavior — mobile (~320–768px) vs desktop differences; Dialog on desktop / Sheet on
  mobile for forms; bottom nav on mobile
- Copy — all labels, headings, placeholders and messages verbatim, in Spanish
```

---

## Screen 2: [Screen Name]

**Route:** `/[route]`
**Description:** [Brief description of the screen purpose]

### Brief

```
[Complete brief — same structure as Screen 1]
```

---

## Screen N: [Screen Name]

**Route:** `/[route]`
**Description:** [Brief description of the screen purpose]

### Brief

```
[Complete brief — same structure as Screen 1]
```

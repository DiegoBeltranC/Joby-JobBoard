# React

Applies to bolsa-trabajo (Next.js 16 App Router + React 19).

## Server vs Client components

- Components are **Server Components by default**. Keep them server-side when they only read data and
  render markup — they can be `async` and query Prisma directly (see architecture.md).
- Add **`"use client"`** at the top of a file only when it needs interactivity: `useState`,
  `useEffect`, event handlers, browser APIs, context, or a client-only lib. Push `"use client"` to the
  leaves; don't make a whole page a client component to add one button.
- Never call `getSession()`/Prisma from a client component. Fetch on the server, pass data down as
  props. Never import server-only modules (`@/lib/prisma`, `@/lib/session`) into a `"use client"` file.
- React 19 + the **React Compiler** is enabled (`babel-plugin-react-compiler`) — you generally do not
  need manual `useMemo`/`useCallback` for referential-stability micro-optimizations; write clear code.

## Components

- One component per file. Shared components are **PascalCase** files (`ModalPostulacion.tsx`,
  `DashboardShell.tsx`); shadcn primitives in `components/ui` are **kebab-case** (`alert-dialog.tsx`).
  Match the folder you're in.
- Props communicate upward through `on*` callbacks (`onSelectVacante`, `onClose`).
- Local UI state via `useState`; forms via **`react-hook-form` + `zod`**. Don't hold server data in
  state (state-management.md).

## Styling — Tailwind v4 + shadcn tokens

Design tokens are CSS variables in `src/app/globals.css` (`:root` + `.dark`), exposed to Tailwind via
`@theme inline`. Use the **semantic token classes**, not raw palette colors:

```tsx
import { cn } from "@/lib/utils";
// ✅ semantic tokens
<div className={cn("bg-card text-foreground border border-border rounded-xl p-4")} />
<button className="bg-primary text-primary-foreground hover:bg-primary/90" />
```

- `cn()` lives at `@/lib/utils` (`twMerge(clsx(...))`).
- Primary brand color is **UT green** (`--primary: #009374`) — use `bg-primary` / `text-primary` /
  `ring-primary`, never a hardcoded hex or `bg-green-600`. See design-system.md.
- Dark mode is class-based (`.dark`, via `next-themes`) — style with tokens so both themes work; add
  `dark:` only for the rare case a token can't express.

## UI components

Primitives are **shadcn/ui (new-york style) + Radix** in `src/components/ui` (button, input, card,
dialog, alert-dialog, popover, command, checkbox, label, sonner, …). **Reuse them**; add a missing
primitive with the shadcn CLI (`npx shadcn@latest add <name>`) rather than hand-writing one. Variants
use **`cva`** + `cn()` (see ui.md):

```tsx
// components/ui/button.tsx (excerpt) — cva variant map
const buttonVariants = cva("inline-flex items-center justify-center rounded-md ...", {
  variants: { variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90", /* ... */ } },
});
```

## Icons

Use **`lucide-react`** (`import { MapPin, Briefcase } from "lucide-react"`). It is the project icon
library (also shadcn's configured `iconLibrary`). Don't add another icon set.

## Language

UI copy and domain vocabulary are **Spanish** (`"Publicar vacante"`, `correo`, `postulación`). Do not
translate to English or introduce i18n keys — see i18n.md.

See also: architecture.md, ui.md, design-system.md, responsive.md, hooks.md.

# Architecture

Applies to bolsa-trabajo (Next.js 16 App Router + React 19 client/server components).

Stack: Next.js 16 (App Router, React Compiler) + React 19 + TypeScript 5, Prisma 6 (PostgreSQL),
`zod`, Tailwind v4, shadcn/ui + Radix, `resend`, `jose` + `bcryptjs`. `@/` aliases `src/`.

## Layering

`Route segment (page/layout) → Server Component (reads) → Client Components (interactivity) → Server Actions / Route Handlers (writes & API)`.

- **Pages** (`src/app/**/page.tsx`) are **async Server Components** by default. They call
  `getSession()` and query **Prisma directly** — there is no fetch/HTTP layer between a page and the
  database. `searchParams` and `params` are **Promises** (Next 15/16) — `await` them.
  ```tsx
  // src/app/(dashboard)/inicio/page.tsx
  export const dynamic = "force-dynamic";
  export default async function InicioPage(props: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    const session = await getSession();
    const params = await props.searchParams;
    const vacantes = await prisma.vacante.findMany({ /* ... */ });
    return <FiltrosVacantes ... />; // pass server data down as props
  }
  ```
- **Layouts** (`src/app/**/layout.tsx`) wrap route groups, gate access with `getSession()`, and render
  the shell (e.g. `DashboardShell`, `DashboardShellEmpresa`, `DashboardShellAdmin`).
- **Client Components** (`"use client"`) hold interactivity: forms, modals, filters, anything using
  state/effects/browser APIs. Keep them as leaves; pass server data in as props.
- **Server Actions** (`"use server"`, `src/actions/*`) are the write/mutation layer (see services.md).
- **Route Handlers** (`src/app/api/**/route.ts`) are for things that aren't a page or a form submit:
  AI endpoints (`cv-assistant`, `cv-optimize`, `perfil/importar-ia`), QR, smartwatch device linking,
  and cron (`api/cron/*`).

## Directory map

```
src/
├── app/                  # App Router: route segments, layouts, pages, api/ route handlers
│   ├── (dashboard)/      # student area (route group)
│   ├── empresa/(dashboard)/   # company area
│   ├── admin/(dashboard)/     # admin area
│   ├── api/              # route handlers (AI, qr, smartwatch, cron)
│   ├── e/[id], p/[id]    # public pages using obfuscated ids (see auth.md / hash.ts)
│   ├── layout.tsx, page.tsx, globals.css
├── actions/              # server actions ("use server") — the data/mutation layer
├── components/           # shared components; components/ui = shadcn primitives; components/empresa/*
├── lib/                  # prisma, session, mail, hash (id obfuscation), uploadService, data/*, utils
├── hooks/                # client-only UI hooks (useCountdown, useScrollLock)
├── generated/prisma/     # generated Prisma client (do not edit by hand)
└── middleware.ts         # edge middleware (registro_pendiente gating)
```

## Conventions

- `@/` alias → `src`. Import `@/components/ui/*`, `@/lib/prisma`, `@/lib/session`, `@/lib/utils`.
- App Router filenames are framework-fixed (`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`,
  `error.tsx`, `not-found.tsx`). Route folders are the URL segments and are in **Spanish**
  (`vacantes`, `perfil`, `postulaciones`, `verificar-correo`) — see i18n.md.
- Shared component files are **PascalCase** (`DashboardShell.tsx`, `ModalPostulacion.tsx`); shadcn
  primitives are **kebab-case** in `components/ui` (`alert-dialog.tsx`). Match what's already there.
- Prisma access goes through the **singleton** `@/lib/prisma` — never `new PrismaClient()` in app code.
- Prefer Server Components; add `"use client"` only when a component needs interactivity/state/browser APIs.

## Data flow

- **Read**: Server Component → `prisma.*` → props to client components. No client-side data fetching library.
- **Write**: Client form → Server Action (`src/actions/*`) → `prisma.*` → `revalidatePath(...)` →
  the affected server components re-render with fresh data (see state-management.md, reactivity-loading.md).
- **AI / device / cron**: Route Handler under `src/app/api/*` (see services.md).

See also: services.md, state-management.md, reactivity-loading.md, auth.md, react.md, ui.md.

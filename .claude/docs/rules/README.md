# Rules Index — bolsa-trabajo (Joby)

Rules for **Joby / bolsa-trabajo** — a **Next.js 16 (App Router) + React 19 + TypeScript** job
board for UT Chetumal, with **Prisma** (PostgreSQL), **server actions**, custom **cookie/JWT auth**
(`jose` + `bcryptjs`), **shadcn/ui + Radix + Tailwind v4**, **Resend** email, and AI features
(CV assistant/optimizer). Deployed on **Vercel**. Package manager is **npm**.

Rules load on demand — the `inject-rules.sh` hook injects the path-matched set on edit/write.

## Standards & process
| Rule | Scope |
|------|-------|
| `code-standards.md` | Naming, functions, params, file/function size; **Spanish domain vocabulary** matches the DB/schema |
| `git.md` | Conventional Commits, atomic commits, staging, authorship; Vercel deploy model (`main` → prod) |
| `lint.md` | ESLint flat config (`eslint-config-next`), **npm**, React Compiler, `next build` as type gate |
| `tests.md` | **No test tooling installed yet**; policy + recommended Vitest/Playwright shape when adding it |

## Architecture & data
| Rule | Scope |
|------|-------|
| `architecture.md` | App Router layering: route segments → server components → server actions; route groups; `src/` layout |
| `services.md` | **Data layer = server actions + Prisma + zod.** No axios, no REST client, no React Query |
| `state-management.md` | Server components for reads, **server actions** for writes, `revalidatePath`; minimal client state (`useState` / `react-hook-form`). **No React Query, no Zustand** |
| `reactivity-loading.md` | `loading.tsx` / Suspense, `useTransition` / `useFormStatus`, `revalidatePath` after writes; loading state on every submit |
| `pagination.md` | `searchParams`-driven pagination (`page`/`q`) via server components; Prisma `skip`/`take` |
| `hooks.md` | Client-only UI/behavior hooks (`useCountdown`, `useScrollLock`). **Data never goes in a hook** — use server actions |
| `auth.md` | Cookie session (`jose` HS256, `session` cookie) + `bcryptjs`; roles `ESTUDIANTE`/`EMPRESA`/`ADMIN`; `getSession()` in layouts; `middleware.ts` |

## UI
| Rule | Scope |
|------|-------|
| `ui.md` | **shadcn/ui (new-york) + Radix + `cva` + `cn()`.** Add primitives with the shadcn CLI; icons = `lucide-react` |
| `design-system.md` | UT-green (`#009374`) token system in `globals.css` (`:root` + `.dark`); Tailwind v4 semantic classes |
| `react.md` | Server vs Client components (`"use client"`), React 19, `cn()`, `cva`, Tailwind v4 tokens, `lucide-react` |
| `responsive.md` | **Mobile-first is required** for all new UI — works from ~320px, shadcn `Dialog`/`Sheet`, safe areas |
| `i18n.md` | **No i18n library.** All UI copy is **Spanish**; domain terms are Spanish; don't introduce translation keys |

## Prototype-driven UI (optional)
| Rule | Scope |
|------|-------|
| `html-prototype.md` | Converting an HTML prototype (see `scratch/`) into production React, pixel perfect |
| `fidelity.md` | Pixel-fidelity checklist for prototype conversion |

## Key facts (corrections vs generic React assumptions)
- **Next.js App Router**, not a Vite SPA. Reads happen in **async server components** calling Prisma directly; writes happen in **server actions** (`"use server"`, `src/actions/*`).
- **No REST/axios, no React Query, no Zustand.** The "API" is server actions + route handlers under `src/app/api/*`.
- **Prisma** is the ORM; the generated client is imported from `@/lib/prisma` (singleton). Enums come from `@prisma/client`.
- **Auth is custom** — `jose` HS256 JWT in an httpOnly `session` cookie holding `{ userId }`, verified via `getSession()`; passwords hashed with `bcryptjs`. Not NextAuth, not Supabase, not Firebase.
- **shadcn/ui + Radix IS the component system** (opposite of a hand-rolled setup) — reuse `@/components/ui`, add new primitives with `npx shadcn@latest add <name>`. Icons: `lucide-react`.
- **Spanish** is the product language (UI copy, domain vocabulary, DB fields). Do not translate identifiers to English or add i18n.
- **npm** (there is a `package-lock.json`); deploy target is **Vercel**.
- **No test tooling yet** — add Vitest + Testing Library (and Playwright for e2e) with the first implementation that ships tests.

Keep this index in sync when you add, rename, or repurpose a rule.

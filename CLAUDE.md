# CLAUDE.md — bolsa-trabajo (Joby)

Guidance for Claude Code when working in this repository.

## What this is

**Joby** — a job board ("bolsa de trabajo") for **UT Chetumal**, connecting students (`ESTUDIANTE`)
with companies (`EMPRESA`), administered by staff (`ADMIN`). Includes AI-assisted CV building/import,
OTP email verification, QR/smartwatch device linking, and public shareable profiles/vacancies.

## Stack (ground truth)

- **Next.js 16 (App Router) + React 19 + TypeScript**, React Compiler enabled. Package manager: **npm**.
- **Prisma 6** (PostgreSQL) — singleton client at `@/lib/prisma`; generated client in `src/generated/prisma`.
- **Server Actions** (`"use server"`, `src/actions/*`) for writes; async **Server Components** read
  Prisma directly; **Route Handlers** (`src/app/api/**/route.ts`) for AI/QR/device/cron.
- **Auth**: custom cookie session via `jose` HS256 (`session` cookie = `{ userId }`) + `bcryptjs`.
  `getSession()` / `createSession()` in `@/lib/session`. Not NextAuth/Supabase/Firebase.
- **UI**: shadcn/ui (new-york) + Radix + Tailwind v4 + `cva` + `cn()` (`@/lib/utils`); icons
  `lucide-react`; toasts `sonner`; dark mode via `next-themes`.
- **Validation**: `zod` (+ `react-hook-form`). **Email**: Resend (`@/lib/mail`).
- **AI**: MiniMax / `@google/genai` from route handlers; usage logged to `prisma.aIUsageLog`.
- **Language**: Spanish (UI copy + domain vocabulary + DB fields). Deploy: **Vercel**.
- `@/` alias → `src/`. Commands: `npm run dev` (port 3000), `npm run build`, `npm run lint`.

## Rule discovery

Project rules live in **`.claude/docs/rules/`** and are auto-injected on edit/write by the
`.claude/hooks/inject-rules.sh` PreToolUse hook, matched by file path. Read the relevant rule before
working in an area. Index:

| Rule | Load when working on |
|------|----------------------|
| `architecture.md` | App Router layout, pages/layouts, where code goes |
| `services.md` | Server actions, route handlers, Prisma, AI endpoints |
| `state-management.md` | Reads vs writes, `revalidatePath`, client vs server state |
| `reactivity-loading.md` | `loading.tsx`, pending states, `useTransition`/`useFormStatus` |
| `auth.md` | Session, `getSession`, roles, `bcryptjs`, middleware, obfuscated ids |
| `react.md` | Server vs client components, styling, icons |
| `ui.md` | shadcn/Radix primitives, `cva`, adding components |
| `design-system.md` | Color/radius tokens in `globals.css` (UT green) |
| `responsive.md` | Mobile-first, Dialog/Sheet, tables/forms |
| `hooks.md` | Client-only UI hooks |
| `pagination.md` | `searchParams` + Prisma `skip`/`take` |
| `i18n.md` | Spanish copy, no i18n library |
| `code-standards.md` | Naming, functions, Spanish domain vocabulary |
| `lint.md` | ESLint (next), npm, `next build` type gate |
| `tests.md` | Testing policy (no tooling yet) |
| `git.md` | Conventional Commits, `main` + Vercel deploy |
| `html-prototype.md`, `fidelity.md` | Converting `scratch/*.html` mockups to React |

Start at `.claude/docs/rules/README.md` for the full index.

## Workflow commands & templates

`.claude/commands/` holds an engineering workflow (PRD → tech spec → tasks → execute → QA/security/
review), with `.claude/templates/` and the `task-reviewer` agent. These were ported from another
project's baseline and are being adapted to this stack — treat their examples as illustrative and
defer to the rules above and the real code when they conflict.

## Conventions

- Never commit secrets; build absolute URLs from `NEXT_PUBLIC_APP_URL` / `VERCEL_*`, not hardcoded hosts.
- Reuse `@/components/ui`; add missing primitives with `npx shadcn@latest add <name>`.
- Run `npm run lint` and `npm run build` before considering a change done; `npx prisma generate` after
  schema changes.
- Commits: Conventional Commits, no AI attribution (see `git.md`).

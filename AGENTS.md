# AGENTS.md — Bolsa de Trabajo UT Chetumal

Next.js 16 App Router monolith with Server Actions as the only backend layer. PostgreSQL via Prisma 6.

## Setup (first run, in order)

```bash
npm install
npx prisma generate          # regenerates @prisma/client into node_modules
npx prisma db push           # applies schema to PostgreSQL (no migrations dir for dev)
npx prisma db seed           # seeds Universidad UTCH, 4 Carreras, Super Admin
npm run dev
```

`prisma/migrations/` exists but `db push` is the source of truth during dev. The seed command is wired via `package.json` `prisma.seed` (uses `tsx prisma/seed.ts`).

## Verification commands

- **Lint:** `npm run lint` — ESLint 9 with `eslint-config-next`. **9 pre-existing TS errors** in `src/app/login/page.tsx`, `src/app/perfil-estudiante-snapshot/[id]/page.tsx`, `src/app/perfil/editar/paso-1/FormPaso1.tsx`, `src/app/perfil/editar/paso-2/FormPaso2.tsx`, `src/actions/cvGenerator.ts`, `src/lib/pdf/PlantillaCV.tsx` — do not treat as regressions.
- **Typecheck:** `npx tsc --noEmit` — same 9 pre-existing errors, no others.
- **No tests exist.** No `vitest`/`jest`/`playwright` configured. `package.json` has no `test` script.

Run lint and typecheck in that order before declaring any change done.

## Architecture — read this before touching anything

### Three user roles, three route groups, three sidebars
Route groups under `src/app/`: `(dashboard)/` (student), `empresa/(dashboard)/` (company), `admin/(dashboard)/`. Each has a `layout.tsx` that does session + role guard inline and renders `<DashboardShell>` (single unified component) wrapping the appropriate `<Sidebar>` / `<SidebarEmpresa>` / `<SidebarAdmin>`.

- **`DashboardShell`** is the only dashboard shell. Accepts `sidebar` (ReactNode), `brandColorClass`, optional `brandBadgeText/Class/BgClass`, `breakpoint` (`md` | `lg`, default `md`), `contentMaxWidth` (default `true`).
- **Sidebars share** `ConfirmLogoutModal` (with `useLogoutModal` hook) and `MobileCloseButton` from `src/components/ConfirmLogoutModal.tsx`. **Admin sidebar does NOT use the logout modal** — it calls `logoutAdminAction()` directly. Do not "fix" this.
- Colors are hardcoded per role: `teal-700` (student), `violet-700` (company), `text-primary` (admin, CSS var). Brand badges: company shows "Empresa", admin shows "Admin", student shows nothing.

### Server Actions are the backend
`src/actions/` is the entire API surface. **Only one REST route exists:** `src/app/api/cron/cleanup-users/route.ts` (scheduled account deletion, 15-day grace period).

Action files and their domain:
- `auth.ts` — login, logout (`logoutAction` for student/company, `logoutAdminAction` for admin), `verificarOTPAction`, `reenviarOTPAction` (progressive cooldown: 1min/5min/15min/1hr, then blocked)
- `registro.ts` / `registroEmpresa.ts` — registration with OTP email flow, "limbo" user cleanup
- `validacionesRegistro.ts` — pre-step validation (email/matricula/RFC)
- `perfil.ts` / `perfilEmpresa.ts` — 3-step profile wizards, photo/logo upload, account suspension
- `vacantes.ts` — only file using Zod schemas for validation
- `postulaciones.ts` — job applications with **immutable CV/profile snapshots**
- `cv.ts` / `cvGenerator.ts` — CV upload + PDF generation via `@react-pdf/renderer`
- `recovery.ts` — password reset with hashed tokens, 15-min expiry, 2-min resend cooldown
- `adminEmpresas.ts` / `adminConfig.ts` — admin operations (approve/reject/suspend)

### Auth/session conventions
- JWT via `jose` library, HS256, 7-day cookie, secret from `SESSION_SECRET` env var (has hardcoded fallback `"super-secreto-joby-ut-2026"` — flag this in PRs).
- `src/lib/session.ts` — `createSession()`, `getSession()`. Note: `getSession()` returns `{ userId }` only — no `rol` field. The `perfil-estudiante-snapshot/[id]/page.tsx` errors stem from code expecting `rol` on session.
- `src/lib/auth-helpers.ts` — `setRegistroPendienteCookie(email)` and `generateOTP()` (returns `{ code, expiresAt }`, 15-min expiry). **Use these** instead of inlining `cookieStore.set(...)` or `Math.floor(100000 + Math.random() * 900000)`.

### Hash/ID obfuscation
- `src/lib/utils/hash.ts` — Sqids-based `encodeId(id: number)` / `decodeId(hash: string): number | null`. **Single source of truth.** The old XOR+Base36 `src/lib/hash.ts` was removed in refactor.
- Used in public URLs: `/perfil-publico-empresa/[id]`, `/empresa/candidatos/[vacanteHashId]`, etc.

### Email
- `src/lib/mail.ts` — `sendEmail({ to, subject, title, message, buttonText?, buttonUrl?, type?, subtitle?, otpCode?, extraFooterNote? })`. The `from` address is hardcoded: `"Joby <no-reply@jobychetumal.online>"`.
- `type` controls color theme: `SUCCESS` (teal, used for student OTP and reactivation), `INFO` (indigo, used for company registration).
- `otpCode` renders the dashed-border OTP box (company uses this, student puts OTP in `message` text).
- `subtitle` overrides the header subtitle (company passes `"Portal para Empresas"`).
- `extraFooterNote` replaces the default transactional footer note (company uses this for "Si usted no solicitó este registro...").

### Middleware (`src/middleware.ts`)
Edge runtime. Only handles the `registro_pendiente` cookie: propagates it when `/verificar-correo?email=...` is hit, redirects root/login/registro to `/verificar-correo` when present. **Does NOT do session validation** — that's in the layouts. Matcher: `["/", "/login", "/registro", "/verificar-correo"]`.

## File upload abstraction
- `src/lib/uploadService.ts` — `guardarArchivo()` / `eliminarArchivo()`. Used by `perfil.ts` and `perfilEmpresa.ts` for photos and logos.
- **`cv.ts`, `cvGenerator.ts`, `postulaciones.ts` still use raw `fs.writeFileSync`/`fs.unlinkSync`** — bypass the abstraction. Migrating to S3 later would only cover photos/logos unless these are refactored.

## Configuration & env

`.env` is **committed to the repo** (contains `DATABASE_URL`, `RESEND_API_KEY`, `SESSION_SECRET` fallback). Treat as a security finding in PRs.

Required env vars:
- `DATABASE_URL` — PostgreSQL connection
- `RESEND_API_KEY` — Resend email service
- `SESSION_SECRET` — JWT signing (optional, has hardcoded fallback)
- `NEXT_PUBLIC_APP_URL` — used in email button URLs
- `CRON_SECRET` — protects `/api/cron/cleanup-users` (optional bearer)

## Styling & UI
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin. No `tailwind.config.js` — config is in `src/app/globals.css` (CSS variables for design tokens, light/dark themes).
- **shadcn/ui** (New York style) in `src/components/ui/`. Generated, do not hand-edit themes.
- **React Compiler enabled** in `next.config.ts` (`reactCompiler: true`).
- Primary color: `#009374` (UT Chetumal green).

## Things agents commonly get wrong here

1. **Adding a new sidebar or shell copy** — there is exactly one of each. Extend the existing component or use the slots (`sidebar` prop on `DashboardShell`, the shared `ConfirmLogoutModal`/`MobileCloseButton`/`LogoutButton` exports).
2. **Inlining `cookieStore.set("registro_pendiente", ...)`** — use `setRegistroPendienteCookie()` from `auth-helpers.ts`.
3. **Inlining `Math.floor(100000 + Math.random() * 900000)`** — use `generateOTP()`.
4. **Importing from `@/lib/hash`** — that file no longer exists. Use `@/lib/utils/hash`.
5. **Adding Zod schemas to a new action** — only `vacantes.ts` uses Zod today. New actions can add it, but existing ones don't have it (intentional or not — check the action before assuming).
6. **Adding `rol` to `getSession()`** — it's intentionally minimal (`{ userId }` only). For role checks, fetch the user via Prisma in the action/layout.
7. **Treating the 9 pre-existing TS errors as regressions** — they predate Phase 1 refactor. Mention them in PRs as known issues.
8. **Replacing the admin logout button with the modal** — admin does logout-direct intentionally, by design.
9. **Creating a new "shell" or "sidebar" component** — there is one of each. If a new role needs one, it should reuse the existing component with new props/content.
10. **Forgetting to run `npx prisma generate` after pulling schema changes** — `node_modules/.prisma/client` gets stale silently.

## Branch / PR conventions (observed)
- Default branch appears to be `develop` (or similar — verify before PR). Feature branches named like `feat/<number>`.
- `git log --oneline` shows merge commits from `feat/5` into `develop` — feature branches are merged, not rebased.
- No CI workflow, no required checks. Lint+typecheck is the de facto gate, run manually.

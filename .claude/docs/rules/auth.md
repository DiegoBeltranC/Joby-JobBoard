# Authentication (cookie session: jose + bcryptjs)

> Scope: how auth works in bolsa-trabajo. Sessions are a **custom HS256 JWT** (`jose`) stored in an
> httpOnly **`session`** cookie holding `{ userId }`; passwords are hashed with **`bcryptjs`**. It is
> **NOT NextAuth, NOT Supabase Auth, NOT Firebase.** Cross-refs: `services.md`, `state-management.md`.

## Big picture

```
Browser
  cookie: session (httpOnly JWT { userId }, 7d)  + registro_pendiente (pre-verification, 15m)
        │
Server Components / Layouts / Server Actions / Route Handlers
  getSession() -> verifies the JWT -> { userId } | null
  prisma.user.findUnique(...) -> role + entity (estudiante / empresa / admin)
  middleware.ts -> only gates the registro_pendiente flow
```

## Session helpers — `src/lib/session.ts`

```ts
// createSession is called after a successful login/verification
await createSession(user.id);          // signs { userId } with HS256, sets httpOnly `session` cookie (7d)

// getSession is called wherever you need the current user
const session = await getSession();     // -> { userId: number } | null
if (!session) redirect("/login");
```

- The signing key is `process.env.SESSION_SECRET` (set it in `.env`; the code has a dev fallback —
  **do not rely on the fallback in production**).
- The cookie is `httpOnly`, `sameSite: "lax"`, `secure` in production, `path: "/"`.
- `getSession()` returns only `{ userId }`. To get the role or profile, query Prisma:
  `prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true, empresa: true } })`.

## Passwords — `bcryptjs`

```ts
import bcrypt from "bcryptjs";
const hash = await bcrypt.hash(password, 10);          // on registration
const ok = await bcrypt.compare(password, user.password_hash);  // on login
```

Never store or log a plaintext password. The hash column is `user.password_hash`.

## Roles & authorization

`user.rol` is the `RolUsuario` enum: `ESTUDIANTE`, `EMPRESA`, `ADMIN`. Authorization is checked
**server-side** in the layout/page/action for each area:

- Student area: `src/app/(dashboard)/*` — requires a session; entity in `user.estudiante`.
- Company area: `src/app/empresa/(dashboard)/*` — `rol === "EMPRESA"`; entity in `user.empresa`.
- Admin area: `src/app/admin/(dashboard)/*` — `rol === "ADMIN"`.

Login (`loginAction`) enforces that the selected login type matches `user.rol` and returns a friendly
Spanish error otherwise. Always re-check the role in the action/layout that performs the sensitive
work — never trust the client to have restricted the UI.

## Account states to respect

The `User` model carries several lifecycle flags — handle them the way `loginAction` already does:

- `verifiedAt` — email not verified yet ⇒ send the user through the **OTP** flow
  (`/verificar-correo`), setting the `registro_pendiente` cookie.
- `deletedAt` / `scheduledDeletionAt` — soft-deleted / suspended ⇒ offer reactivation, don't log in.
- OTP fields (`otpCode`, `otpExpiresAt`, `intentos_reenvio`, `ultimo_reenvio_at`) — 6-digit code,
  15-min expiry, progressive resend cooldown. Codes are emailed via `sendEmail` (see services.md).

## Middleware — `src/middleware.ts`

Middleware is **narrow**: it only manages the `registro_pendiente` cookie (propagating it to
`/verificar-correo?email=…`, and redirecting `/`, `/login`, `/registro` to verification while a
registration is pending). Its `matcher` is `["/", "/login", "/registro", "/verificar-correo"]`.
**Route protection for dashboards is done in layouts via `getSession()`, not in middleware** — keep
it that way unless you deliberately expand the middleware matcher.

## Public / obfuscated URLs

Public pages (`/e/[id]`, `/p/[id]`, `perfil-publico-empresa/[id]`, snapshots) use **obfuscated ids**
from `@/lib/hash` (`encodeId` / `decodeId`) so raw DB ids aren't exposed or enumerable. Decode at the
page boundary and 404 on an invalid hash.

## Password recovery

`/recuperar-contrasena` uses the `PasswordResetToken` model + emailed link (`recovery.ts` action).
Tokens are single-use and time-limited — validate and consume them server-side.

See also: services.md (actions/route handlers), state-management.md, architecture.md.

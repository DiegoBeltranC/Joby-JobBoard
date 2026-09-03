# Data Layer (Server Actions + Prisma)

Applies to bolsa-trabajo.

There is **no axios, no REST client, and no React Query.** The data layer is:

1. **Reads** — async Server Components query **Prisma** directly (see architecture.md).
2. **Writes / mutations** — **Server Actions** (`"use server"`) in `src/actions/*`.
3. **Non-form endpoints** — **Route Handlers** in `src/app/api/**/route.ts` (AI, QR, device linking, cron).

## Prisma

The client is a **singleton** at `@/lib/prisma`:

```ts
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- Import `{ prisma }` from `@/lib/prisma` everywhere. **Never** `new PrismaClient()` in app code (it
  leaks connections in dev with HMR and on serverless).
- Enums come from `@prisma/client` (`EstatusVacante`, `RolUsuario`, `TipoContrato`, …). Import them,
  don't re-declare string unions.
- Schema lives in `prisma/schema.prisma`; the generated client is emitted to `src/generated/prisma`.
  After changing the schema: `npx prisma migrate dev` (dev) and `npx prisma generate`. Seed via
  `npm run` (seed script is `tsx prisma/seed.ts`).
- Models are PascalCase (`Vacante`, `Postulacion`, `Estudiante`, `Empresa`, `User`, `AIUsageLog`);
  scalar fields follow the DB (`password_hash`, `intentos_reenvio`, `verifiedAt`) — match the schema.

## Server Actions — `src/actions/*`

```ts
"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const vacanteSchema = z.object({
  titulo: z.string().min(5).max(100),
  tipo_contrato: z.enum(["ESTADIA", "MEDIO_TIEMPO", "TIEMPO_COMPLETO"]),
  // ...
});

export async function crearVacanteAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  const parsed = vacanteSchema.safeParse(/* build object from formData */);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.vacante.create({ data: { /* ... */ } });
  revalidatePath("/empresa/vacantes");
  return { success: true };
}
```

Conventions that the existing actions follow — keep them:

- Start with `getSession()` and reject unauthenticated/unauthorized callers early
  (`return { error: "No autorizado" }`).
- **Validate input with `zod`** (`safeParse`); never trust `FormData` shape.
- **Return a plain result object**, never throw to the client. The established shapes are:
  `{ error: string }`, `{ success: true, ... }`, and `{ redirect: "/path" }` when the client should
  navigate. Returning `{ redirect }` is deliberate — it avoids the client catching Next's
  `NEXT_REDIRECT` error. Only call `redirect()` directly for terminal actions like logout.
- **Revalidate after a write** with `revalidatePath(...)` (or `revalidateTag`) so server components
  re-render — do not ask the client to reload. See reactivity-loading.md.
- Wrap the body in `try/catch`, `console.error` the real error, and return a friendly Spanish
  `{ error }` message. Never leak internals or stack traces to the client.

## Route Handlers — `src/app/api/**/route.ts`

Use these for non-form endpoints (AI, QR, device/smartwatch linking, cron). Authenticate with
`getSession()`, use `NextResponse.json(...)` with proper status codes:

```ts
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  // ...
  return NextResponse.json({ success: true, data });
}
```

### AI endpoints
AI calls go out via `fetch` (MiniMax) or `@google/genai` (Gemini) from a route handler — keys from
`process.env` (`MINIMAX_API_KEY`, `GEMINI_API_KEY`). Two non-negotiables, already in place in
`api/cv-assistant`:
- **Guardrails / jailbreak prevention** in the system prompt, and **user data wrapped in delimiters**
  (`<PERFIL_ESTUDIANTE>…</PERFIL_ESTUDIANTE>`) with an explicit instruction to treat it as data, not
  instructions.
- **Log usage** to `prisma.aIUsageLog` (`{ usuarioId, action, modelUsed }`) and cap tokens.

## Uploads & email

- File uploads go through `@/lib/uploadService` and land under `public/uploads/` (or the configured
  store). Image cropping via `@/lib/cropImage`.
- Transactional email is `sendEmail()` from `@/lib/mail` (Resend) — pass `{ to, subject, title,
  message, buttonText?, buttonUrl?, type? }`. Absolute URLs must be built from
  `NEXT_PUBLIC_APP_URL` / `VERCEL_*` env, never hardcoded.

See also: architecture.md, state-management.md, auth.md, reactivity-loading.md.

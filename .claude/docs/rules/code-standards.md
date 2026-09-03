# Coding Standards

Applies to bolsa-trabajo (TypeScript + Next.js). These are language/craft rules; the stack-specific
patterns live in architecture.md, services.md, react.md, ui.md.

## Language & domain vocabulary

This codebase is **Spanish-domain**. The database schema, enums, and existing identifiers use Spanish
(`correo`, `contraseña`, `estudiante`, `empresa`, `vacante`, `postulación`, `password_hash`,
`intentos_reenvio`). **Match the existing vocabulary** — do not translate domain terms to English.

- Keep new fields/functions consistent with the schema and surrounding code. If a model field is
  `verifiedAt`, use `verifiedAt`; if it's `password_hash`, use `password_hash`.
- Framework/library APIs stay in their original form (`revalidatePath`, `getSession`, `useTransition`).
- Mixing is the reality here: Spanish domain nouns + English framework verbs (e.g.
  `crearVacanteAction`, `getSession`). That's fine — consistency with neighbors beats purity.
- User-facing copy is Spanish (see i18n.md).

## Naming conventions

- **camelCase** — variables, functions, action names, props, hooks (`crearVacanteAction`, `isPending`,
  `onSelectVacante`).
- **PascalCase** — React components and shared component files (`ModalPostulacion.tsx`,
  `DashboardShell.tsx`). shadcn primitives in `components/ui` are kebab-case (`alert-dialog.tsx`) —
  match the folder.
- **App Router files** are framework-fixed: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`,
  `error.tsx`. Route folders are the URL segment (Spanish).
- **UPPER_SNAKE_CASE** — module-level constants and magic numbers (`const PAGE_SIZE = 20;`).

## Functions

- Start function names with a **verb** (`getUser`, `crearVacante`, `enviarCorreo`), never a noun.
- **Query or mutation, not both** — avoid hidden side effects in a "get". (Server actions are the
  explicit mutation boundary.)
- **≤ 3 positional params**; beyond that pass an object. Server actions typically take `FormData` or a
  single typed argument.
- **No flag params** that switch behavior — split into two functions.
- Prefer **early returns** over nested `if`; never nest more than two levels.

## Values & syntax

- `const` by default; `let` only when reassigned; never `var`.
- Strict equality `===` / `!==` always.
- Optional chaining `?.` and nullish coalescing `??` for safe access and defaults.
- Destructure props and objects. One variable declaration per line.
- Simple ternaries only; use a lookup map for multiple cases.
- Declare variables close to first use.

## Size guidance

- Functions ideally < 50 lines; components < ~300 lines (split when a page/component grows — extract
  sub-components or move logic to a server action / `lib` helper).
- Keep server actions focused: validate → authorize → mutate → revalidate → return.

## Comments

Prefer self-explanatory code over comments. The existing code uses explanatory Spanish comments in
places; that's acceptable, but don't narrate the obvious — name things well instead.

## Validation

Validate all external input (form data, route-handler bodies, `searchParams`) with **`zod`** before
use. Never trust `FormData`/JSON shape.

See also: react.md, services.md, i18n.md.

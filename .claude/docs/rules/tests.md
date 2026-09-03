# Tests

Scope: testing policy for bolsa-trabajo and the conventions to follow when adding tests.

## Current state

**There is no test tooling installed yet** — no Vitest, no Jest, no Playwright in `package.json`, and
no test files. This is the starting point, not a target to preserve. The type gate today is
`npm run build` (`next build`) plus `npm run lint`.

## Policy for new work

- **Prefer to add tests with new, non-trivial logic** — especially pure functions and server-side
  logic where a test is cheap and high-value: validation schemas (`zod`), `lib/` helpers
  (`vacanteEstatus`, `vacanteFechaLimite`, `perfilEstudiante`, `hash` encode/decode), and server
  actions' branching (auth/role checks, OTP cooldown, error paths).
- Tests should **assert real behavior** (success, error, edge/boundary), be **well-described**
  (`describe` names the unit; `it` states the expected behavior in plain Spanish/English), and follow
  Arrange → Act → Assert, one behavior per test. Coverage counters are a floor, not the goal.
- Adding tests to a change that has none is encouraged but not a hard blocker while there is no tooling
  and no CI gate — don't claim a change is "tested" if it isn't.

## Recommended tooling (when you add it)

Pick per layer and add the config with the first test:

- **Unit / integration (functions, actions, components):** **Vitest** + `@vitest/coverage-v8` +
  `@testing-library/react` + `jsdom`. Colocate as `*.test.ts` / `*.test.tsx`, or under `src/**`.
  Mock Prisma at the boundary (e.g. inject/mocked `@/lib/prisma`) — don't hit a real database in unit
  tests.
- **End-to-end:** **Playwright** against `npm run dev` (port 3000), covering the key flows per role
  (registro + OTP, login, publicar vacante, postularse, admin).

```jsonc
// package.json (when adding Vitest)
"scripts": { "test": "vitest run", "test:watch": "vitest", "test:coverage": "vitest run --coverage" }
```

## Summary

- No tooling yet; `next build` + `eslint` are the current gates.
- When you add tests: Vitest + Testing Library (unit), Playwright (e2e), meaningful and
  well-described, mock Prisma at the boundary.

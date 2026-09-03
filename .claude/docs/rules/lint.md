# Lint (ESLint) & Type-check

## Configuration

bolsa-trabajo uses ESLint **flat config** (`eslint.config.mjs`) built on **`eslint-config-next`**
(`core-web-vitals` + `typescript`). There is no `.eslintrc.*`.

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

This bundles the Next.js rules (`@next/next/*`, Core Web Vitals), React Hooks rules, and
`typescript-eslint` recommendations.

## Commands (npm)

The package manager is **npm** (there is a `package-lock.json`). Do **not** use pnpm or yarn.

```bash
npm run lint        # eslint  (the "lint" script)
npx eslint . --fix  # auto-fix
npm run build       # next build — this is the real type-check + compile gate
```

- `npm run build` runs `next build`, which type-checks the whole app with the project's `tsconfig`
  (strict mode). Treat a green build as the type gate; `tsc --noEmit` can be used for a faster
  type-only check.
- The **React Compiler** is enabled (`babel-plugin-react-compiler`); write code that follows the
  Rules of Hooks so the compiler can optimize it.

## Conventions

- Fix lint errors rather than disabling rules. Never disable `react-hooks/rules-of-hooks`.
- Prefix intentionally-unused args with `_` to satisfy `no-unused-vars`.
- Prefer the `@/` alias over deep `../../` relative chains.
- Keep `"use client"` only where needed — an accidental client boundary can trip Next lint/build.
- Don't import server-only modules (`@/lib/prisma`, `@/lib/session`) into client components.

## After implementing

Run `npm run lint` (fix what it reports) and `npm run build` before considering a change done. If you
touched the Prisma schema, also run `npx prisma generate`.

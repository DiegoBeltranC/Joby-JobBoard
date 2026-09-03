# Hooks

Applies to bolsa-trabajo.

## Hooks are for client UI/behavior only

This project has **no data-fetching hooks** — data is read in server components and written through
server actions (see services.md, state-management.md). Custom hooks exist purely for **client-side UI
behavior** and live in `src/hooks/` as `useX.ts` (`"use client"` consumers). Current examples:

- `useCountdown` — countdown timer (OTP resend cooldown, deadlines).
- `useScrollLock` — lock body scroll while a modal/sheet is open.

## When to write a hook

Write a client hook only when you have **reusable stateful UI logic** that more than one component
needs (a media-query listener, a debounced value, a controllable disclosure). If it's used once, keep
it inline in the component.

```ts
// src/hooks/useMediaQuery.ts
"use client";
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false); // false on the server → no hydration mismatch
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}
```

## What must NOT go in a hook

- **No data fetching / Prisma / server actions inside a hook.** Reads belong in server components;
  writes belong in server actions called from an event handler (wrapped in `useTransition`).
- **No server-only imports** (`@/lib/prisma`, `@/lib/session`) — hooks run on the client.
- **No mirroring of server data into hook state** — it goes stale on `revalidatePath`
  (state-management.md).

## Form state

Forms use **`react-hook-form` + `zod`** (`@hookform/resolvers`) rather than a bespoke form hook.
Reach for `useTransition` / `useFormStatus` for submit pending state (reactivity-loading.md).

## Rules of hooks

Follow the Rules of Hooks (enforced by `eslint-plugin-react-hooks` via `eslint-config-next`):
call hooks unconditionally at the top level; keep `useEffect` dependency arrays complete. With the
React Compiler enabled you rarely need manual `useMemo`/`useCallback` — prefer clear code.

See also: react.md, state-management.md, reactivity-loading.md.

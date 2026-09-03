# Reactivity and Loading States

## Golden rule

Reads come from **server components**; writes go through **server actions** and refresh the UI with
**`revalidatePath`** — never a full page reload. Every control that triggers a mutation MUST show a
pending state. Never copy server data into client `useState` (it desyncs the moment a revalidation
lands — see state-management.md).

## Loading UI

Use the App Router's built-in loading primitives instead of hand-rolled spinners at the page level:

- **`loading.tsx`** next to a `page.tsx` renders instantly while the async server component streams.
- **`<Suspense fallback={…}>`** around a slow server subtree for finer-grained skeletons.
- **`error.tsx`** (a client component) catches render/data errors for that segment;
  **`not-found.tsx`** + `notFound()` for missing records (e.g. an invalid obfuscated id).

```tsx
// src/app/(dashboard)/inicio/loading.tsx
export default function Loading() {
  return <ListaVacantesSkeleton />;
}
```

## Pending state on mutations (required)

Every button/form that calls a server action must be disabled + show a spinner while it runs. Use
`useTransition` or `useFormStatus` — **do not** hand-roll a `const [loading, setLoading] = useState`.

```tsx
"use client";
import { useTransition } from "react";
import { postularAction } from "@/actions/postulaciones";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PostularButton({ vacanteId }: { vacanteId: number }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await postularAction(vacanteId);
          if (res?.error) return toast.error(res.error);
          toast.success("¡Postulación enviada!");
        })
      }
    >
      {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
      Postularme
    </Button>
  );
}
```

For a plain `<form action={serverAction}>`, use `useFormStatus` inside a `SubmitButton` child:

```tsx
"use client";
import { useFormStatus } from "react-dom";
function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</Button>;
}
```

## Reactive update after writes — revalidate, don't reload

The **server action** calls `revalidatePath(...)` (or `revalidateTag`) after a successful write; the
affected server components re-render with fresh data on the next navigation/transition. The client
reads the returned `{ success } / { error }` and shows a toast — it does not re-fetch or reload.

```ts
// in the server action
await prisma.postulacion.create({ data: { /* ... */ } });
revalidatePath("/mis-postulaciones");
return { success: true };
```

When you need the client to move to a new URL after an action, return `{ redirect: "/…" }` and
`router.push` it (avoids catching Next's `NEXT_REDIRECT`), or call `redirect()` for terminal flows
like logout.

## Explicit prohibitions

```tsx
// ❌ FORBIDDEN — reload after a write
window.location.reload();
router.refresh(); // as a substitute for the action revalidating

// ❌ FORBIDDEN — copying server data into client state
const [vacantes, setVacantes] = useState(props.vacantes);

// ❌ FORBIDDEN — mutation control with no pending state
<Button onClick={handleSubmit}>Guardar</Button>

// ❌ FORBIDDEN — hand-rolled loading boolean instead of useTransition/useFormStatus
const [loading, setLoading] = useState(false);
```

> `router.refresh()` is fine for the rare case where you truly need to re-pull server data without a
> mutation; it is **not** a replacement for the action revalidating its own paths.

## Verification checklist

- [ ] Page-level loading via `loading.tsx` / `<Suspense>`; errors via `error.tsx` / `notFound()`
- [ ] No server data copied into `useState`
- [ ] Every mutation control is `disabled` + spinner via `useTransition` / `useFormStatus`
- [ ] Writes refresh via `revalidatePath` in the action — no `reload()`
- [ ] Client drives UI from the action's returned `{ success } / { error } / { redirect }`

See also: services.md, state-management.md, react.md.

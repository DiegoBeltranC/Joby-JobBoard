# State Management

> Scope: what holds state in bolsa-trabajo. **Reads = Server Components (Prisma). Writes = Server
> Actions + `revalidatePath`. Client state = `useState` / `react-hook-form` only, for UI.**
> No React Query, no Zustand, no Redux. Cross-refs: `services.md`, `reactivity-loading.md`, `auth.md`.

## Rule of thumb

Don't reach for a client-side state or data library. Decide by where the state actually lives:

- **Server data** (anything from Prisma / the DB): fetch it in an **async Server Component** and pass
  it down as props. The "cache" is Next's router cache; you refresh it with `revalidatePath` after a
  mutation — not by re-fetching in the client.
- **URL state** (search, filters, current tab, page number): put it in **`searchParams`** and read it
  in the server component. This keeps deep-links and back/forward working (see `VacantesSearchClient`,
  `FiltrosVacantes`, pagination.md).
- **Ephemeral UI state** (modal open, form fields, selected item, countdown): local **`useState`** in
  a `"use client"` component. Forms use **`react-hook-form` + `zod`** (`@hookform/resolvers`).
- **Cross-tree UI state** that several client components share: React Context is fine, but keep it to
  **UI** concerns (theme via `next-themes`, a wizard step). **Never mirror server data into Context or
  `useState`** — it goes stale the moment a server action revalidates.

There is **no Zustand and no React Query** in `package.json` — do not introduce them.

## Writes: Server Actions, then revalidate

The write path is always: client submits → server action mutates via Prisma → `revalidatePath(...)`
→ the server component re-renders with fresh data. The client does not reload the page and does not
hold a second copy of the data.

```tsx
"use client";
import { useTransition } from "react";
import { crearVacanteAction } from "@/actions/vacantes";
import { toast } from "sonner";

export function NuevaVacanteForm() {
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await crearVacanteAction(formData);
      if (res?.error) return toast.error(res.error);
      toast.success("Vacante publicada");
    });
  }

  return <form action={onSubmit}>{/* fields */}<SubmitButton pending={isPending} /></form>;
}
```

- `useTransition` (or `useFormStatus` inside the `<form>`) gives you the pending state — see
  reactivity-loading.md. Don't hand-roll a `const [loading, setLoading] = useState(false)`.
- Read the action's returned `{ error }` / `{ success }` / `{ redirect }` and drive UI from it
  (toast via `sonner`, `router.push`, etc.).

## Reads: pass server data as props

```tsx
// server component
const postulaciones = await prisma.postulacion.findMany({ where: { estudianteId } });
return <ListaPostulaciones items={postulaciones} />;   // client component just renders props
```

```tsx
// ❌ Avoid — copying server data into client state; it desyncs on revalidate
const [items, setItems] = useState(props.items);
```

## Session / auth state

The session is a server concern: `getSession()` reads the `session` cookie in layouts/pages/actions
(see auth.md). Don't build a client-side auth context that duplicates it; if a client component needs
the current user, pass the needed fields down as props from the server component.

See also: services.md, reactivity-loading.md, architecture.md, auth.md.

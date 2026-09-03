# Pagination

Scope: how to paginate lists in bolsa-trabajo (App Router + Prisma).

## Reality

Most lists are short and unpaginated today; filtering (search/modalidad/contrato) is done with
**`searchParams`** read in the server component (see `InicioPage`, `VacantesSearchClient`). There is
no client-side data library, so pagination is a **server + URL** concern, not a client cache concern.

## Convention (when a list needs paging)

Drive pagination from the URL so it deep-links and works with back/forward, and page with Prisma
`skip`/`take`:

```tsx
// server component
const PAGE_SIZE = 20;
export default async function Page(props: { searchParams?: Promise<{ page?: string; q?: string }> }) {
  const sp = await props.searchParams;
  const page = Math.max(1, Number(sp?.page ?? "1") || 1);
  const q = typeof sp?.q === "string" ? sp.q : "";

  const where = q ? { titulo: { contains: q, mode: "insensitive" as const } } : {};
  const [items, total] = await Promise.all([
    prisma.vacante.findMany({ where, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, orderBy: { createdAt: "desc" } }),
    prisma.vacante.count({ where }),
  ]);

  return <ListaVacantes items={items} page={page} pageSize={PAGE_SIZE} total={total} />;
}
```

- **Params:** `page` (1-based) and any filters (`q`, `modalidad`, `contrato`) in `searchParams`.
- **Pager UI:** a client component that updates the URL (`router.push`/`<Link>`) — it does not hold
  the list in state.
- **Count once:** run `findMany` + `count` in a single `Promise.all`.
- For very long feeds, prefer cursor pagination (`cursor` + `take`) over large `skip` offsets.

Match whatever an adjacent list already does rather than introducing a second scheme.

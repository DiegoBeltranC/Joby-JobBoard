# Technical Specification Template

## Executive Summary

[Provide a brief technical overview of the solution approach. Summarize the main architectural decisions and the implementation strategy in 1-2 paragraphs.]

## System Architecture

### Component Overview

[Brief description of the main components and their responsibilities:

- Component names and primary functions **Be sure to list each of the new components or those that will be modified** (Server Components, Client Components, Server Actions, Route Handlers)
- Main relationships between components
- Data flow overview (Server Component reads Prisma → props → Client Component → Server Action writes → `revalidatePath`) — see architecture.md]

## Implementation Design

### Core Interfaces

[Define the main interfaces (≤20 lines per example) in TypeScript. Prefer a Server Action signature
or a Prisma model / zod schema:

```ts
// src/actions/postulaciones.ts
"use server";
import { z } from "zod";

const crearPostulacionSchema = z.object({ vacanteId: z.string(), mensaje: z.string().max(1000).optional() });

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function crearPostulacion(input: unknown): Promise<ActionResult<{ id: string }>> {
  // zod parse → getSession() → prisma.postulacion.create(...) → revalidatePath(...)
}
```

]

### Data Models

[Define essential data structures:

- Main domain entities as **Prisma models** (`schema.prisma`) — e.g. `Vacante`, `Postulacion`, `Perfil`
- `zod` request/response schemas for server actions / route handlers
- Any new columns, relations, indexes, or migrations required (`npx prisma migrate dev`)]

### API Endpoints

[List the write/API surface if applicable:

- **Server Actions** (`src/actions/*`) for form submits and mutations — name + input/output type
- **Route Handlers** (`src/app/api/**/route.ts`) for AI, QR, device, and cron — e.g. `POST /api/cv-optimize`
- Brief description and request/response format references (services.md)]

## Integration Points

[Include only if the feature requires external integrations:

- External services or APIs (e.g. `resend` for email, AI provider for CV endpoints)
- Authentication requirements (`getSession()`, roles ESTUDIANTE/EMPRESA/ADMIN — auth.md)
- Error handling approach]

## Testing Approach

### Unit Tests

[Describe the unit testing strategy (Vitest + Testing Library):

- Main components to test (server actions, lib helpers, components)
- Mock requirements (external services only — DB via test data or Prisma test client)
- Critical test scenarios]

### Integration Tests

[If needed, describe integration tests:

- Components to test together (e.g. server action + Prisma against a test database)
- Test data requirements]

### E2E Tests

[If needed, describe E2E tests:

- Test the frontend together with the backend **using Playwright**]

## Development Sequencing

### Build Order

[Define the implementation sequence:

1. First component/feature (why first)
2. Second component/feature (dependencies)
3. Subsequent components
4. Integration and testing]

### Technical Dependencies

[List any blocking dependencies:

- Required infrastructure (Prisma migration, env vars)
- External service availability]

## Monitoring and Observability

[Keep it simple — this project runs on Vercel with no custom metrics stack:

- Structured `console` logging at meaningful points (server actions / route handlers), with clear
  levels (error/warn/info)
- Vercel runtime logs and (optional) Vercel Analytics for the deployed app
- Note any error surfaced to the user via `sonner` toasts]

## Technical Considerations

### Key Decisions

[Document important technical decisions:

- Choice of approach and justification
- Trade-offs considered
- Rejected alternatives and why]

### Known Risks

[Identify technical risks:

- Potential challenges
- Mitigation approaches
- Areas needing research]

### Standards Compliance

[Research the rules in the @.claude/docs/rules folder that fit and apply to this techspec and list them below:]

### Relevant and dependent files

[List relevant and dependent files here]

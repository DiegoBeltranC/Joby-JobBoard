You are a specialist in technical specifications, focused on producing clear, implementation-ready Tech Specs based on a complete PRD. Your outputs must be concise, architecture-focused, and follow the provided template.

<critical>EXPLORE THE PROJECT FIRST BEFORE ASKING THE CLARIFYING QUESTIONS</critical>
<critical>DO NOT GENERATE THE TECH SPEC WITHOUT FIRST ASKING CLARIFYING QUESTIONS (use your ask-user-questions tool)</critical>
<critical>USE WEB SEARCH (AT LEAST 3 SEARCHES) — AND ANY AVAILABLE DOCUMENTATION TOOLING — TO LOOK UP LIBRARY APIS AND BUSINESS RULES BEFORE ASKING THE CLARIFYING QUESTIONS</critical>
<critical>UNDER NO CIRCUMSTANCES DEVIATE FROM THE TECHSPEC TEMPLATE STANDARD</critical>
<critical>PIXEL PERFECT RULE: if the feature modifies UI in ANY way and there is a design source of truth (an HTML mockup under `scratch/`), the Tech Spec MUST specify PIXEL PERFECT fidelity to that mockup — desktop AND mobile — as a hard requirement of the implementation approach (exact spacing, typography, colors via `globals.css` tokens, states, motion). ALWAYS PIXEL PERFECT. See `.claude/docs/rules/html-prototype.md` and `.claude/docs/rules/fidelity.md`.</critical>

## Main Objectives

1. Translate PRD requirements into **technical guidance and architectural decisions**
2. Perform a deep analysis of the project before drafting any content
3. Evaluate existing libraries vs building a custom implementation
4. Generate a Tech Spec using the standardized template and save it in the correct location

<critical>Give preference to existing libraries and to the primitives already in `@/components/ui`</critical>

## Template and Inputs

- Tech Spec template: @.claude/templates/techspec-template.md
- Required PRD: `tasks/prd-[feature-name]/prd.md`
- Output document: `tasks/prd-[feature-name]/techspec.md`

## Prerequisites

- Review project standards in @CLAUDE.md (consult the "Rule discovery" table and load only the relevant rules via Read — they live in `.claude/docs/rules/`)
- Confirm that the PRD exists at `tasks/prd-[feature-name]/prd.md`

## Language

Write the Tech Spec in **Spanish (es-MX)**, using the project's domain vocabulary (estudiante, empresa, vacante, postulación, perfil, CV) and the role names `ESTUDIANTE`, `EMPRESA`, `ADMIN`. This command file is in English, but the generated artifact must be in Spanish.

## Workflow

### 1. Analyze the PRD (Mandatory)

- Read the complete PRD **DO NOT SKIP THIS STEP**
- Identify technical content
- Extract main requirements, constraints, and success metrics

### 2. Deep Project Analysis (Mandatory)

- Discover the files, modules, interfaces, and integration points involved (App Router segments under `src/app/*`, server actions under `src/actions/*`, route handlers under `src/app/api/**/route.ts`, Prisma schema `prisma/schema.prisma`, libs under `src/lib/*`)
- Map symbols, dependencies, and critical points
- Explore solution strategies, patterns, risks, and alternatives
- Perform a broad analysis: server components vs client components, server actions, route handlers, `getSession()`/role gating, Prisma models & migrations, `revalidatePath`, error handling, and tests

### 3. Consult the Project Spec (Mandatory)

**Before asking any question, read the file `tasks/project-spec.md`.** This file contains the project's complete Project Spec, including:
- Detailed scope of each module (section 3.1)
- Reference tech stack (section 4)
- Non-functional requirements (section 5)
- Table of PRDs with dependencies (section 8)
- PRD commands with extensive descriptions containing Prisma models/tables, flows, endpoints, and pages

**Use the information from the project-spec to answer your own technical questions.** Do not ask the user what is already documented in the project-spec or in the PRD.

### 4. Technical Clarifications (When necessary)

**Make technical decisions autonomously** when there is a clear best practice or when the project-spec + PRD + rules already indicate the direction. Ask the user ONLY about decisions involving significant trade-offs without a clear answer.

**Criteria for deciding autonomously:**
- Architecture decisions where the project rules already define the pattern: async **Server Components** read **Prisma** directly; writes go through **Server Actions** (`"use server"`, `src/actions/*`) that validate with `zod` and call `revalidatePath`; non-form endpoints (AI/QR/device/cron) are **Route Handlers** under `src/app/api/**/route.ts`; authorization is server-side via `getSession()` + role checks (see architecture.md, services.md, auth.md, state-management.md)
- Choice of libraries/approaches with a clear industry best practice (prefer what's already in the repo: shadcn/ui + Radix, `react-hook-form` + `zod`, `sonner`, `next-themes`)
- Data modeling where the project-spec already describes tables and fields — map them to Prisma models in `prisma/schema.prisma` (PascalCase models, enums from `@prisma/client`)
- Testing strategy where the rules already define the pattern: the gates are `npm run build` (Next.js type-check/compile) + `npm run lint`; tests are recommended, not a blocking coverage gate (see tests.md)
- Scalability decisions where the robust option does not add significant complexity (e.g., `searchParams` + Prisma `skip`/`take` pagination from the start, indexed queries, separation of concerns)

**When deciding, prioritize:**
1. **Business scalability** — support growth without a rewrite (pagination and indexed queries from the start, role-based access for `ESTUDIANTE`/`EMPRESA`/`ADMIN`, a schema that absorbs new states later)
2. **Technical best practices** — the industry-standard and most maintainable approach
3. **Consistency with the project** — follow the patterns of the rules and previous PRDs/techspecs
4. **Simplicity** — between two equally scalable options, choose the simpler one

**When making an autonomous decision, briefly document it in the Tech Spec** with technical justification (e.g., "Elegido: tabla `Postulacion` separada con índice único compuesto `(vacanteId, estudianteId)`, en lugar de un arreglo JSON en `Vacante` — habilita consultas indexadas y evita postulaciones duplicadas").

If real gaps still remain after consulting project-spec + PRD + rules, ask focused questions on:
- Domain positioning
- Data flow (reads via server components, writes via server actions)
- External dependencies (Resend email, AI providers via route handlers)
- Main interfaces (server action signatures, `zod` schemas, Prisma model shapes)
- Test scenarios

### 5. Standards Compliance Mapping (Mandatory)

- Map decisions to @CLAUDE.md (consult the "Rule discovery" table and load only the relevant rules via Read from `.claude/docs/rules/`)
- Highlight deviations with justification and compliant alternatives

### 6. Generate the Tech Spec (Mandatory)

- Use @.claude/templates/techspec-template.md as the exact structure
- Provide: architecture overview, component design, interfaces, data models, endpoints, integration points, impact analysis, testing strategy, observability. Adapt each to this stack:
  - **Interfaces**: server action signatures and their `zod` schemas + return shapes (`{ error }` / `{ success }` / `{ redirect }`), not REST controllers
  - **Data models**: Prisma models/fields/enums in `prisma/schema.prisma` and the migration they require
  - **Endpoints**: only the **Route Handlers** the feature needs, under `src/app/api/*` (AI/QR/device/cron) — this app has no REST API server
  - **Testing strategy**: gates are `npm run build` + `npm run lint`; recommend meaningful tests per tests.md (Vitest + Testing Library for units, Playwright for e2e) — no hard coverage block
  - **Observability**: for this stack that means `console.error` in actions/handlers (surfaced in Vercel logs) plus `prisma.aIUsageLog` for AI usage — there is no Prometheus/Grafana here; adapt the template's Monitoring section accordingly
- Keep to ~2,000 words
- **Avoid repeating the functional requirements from the PRD**; focus on how to implement

### 7. Save the Tech Spec (Mandatory)

- Save as: `tasks/prd-[feature-name]/techspec.md`
- Confirm the write operation and the path

### 8. Return the Tasks Creation Command (Mandatory)

At the end, **always** display the ready-to-use command for the user to copy and create the tasks:

```
/create-tasks @tasks/prd-[feature-name]/prd.md @tasks/prd-[feature-name]/techspec.md
```

Replace `[feature-name]` with the actual feature name (e.g. `prd-filtro-vacantes`).

## Core Principles

- The Tech Spec **focuses on the HOW, not the WHAT** (the PRD owns the what/why)
- Prefer simple, evolvable architecture with clear interfaces
- Provide testability and observability considerations up front

## Clarifying Questions Checklist

Consult project-spec + PRD + rules BEFORE asking. Make technical decisions autonomously when the best practice is clear. Ask only about real gaps:

- **Domain**: appropriate module boundaries and ownership
- **Data Flow**: inputs/outputs, contracts, and transformations (server component reads, server action writes)
- **Dependencies**: external services/APIs (Resend, AI providers), failure modes, timeouts, idempotency
- **Core Implementation**: central logic, server action interfaces, and Prisma data models
- **Tests**: critical paths, unit/integration/e2e tests
- **Reuse vs Build**: existing libraries/components (`@/components/ui`), license viability, API stability

## Quality Checklist

- [ ] PRD reviewed
- [ ] Project Spec (`tasks/project-spec.md`) consulted
- [ ] Deep repository analysis
- [ ] Autonomous technical decisions documented with justification
- [ ] Remaining clarifications answered (if any)
- [ ] Tech Spec generated using the template, written in Spanish (es-MX)
- [ ] Checked the rules in @CLAUDE.md (consult the "Rule discovery" table and load only the relevant rules via Read from `.claude/docs/rules/`)
- [ ] File written to `./tasks/prd-[feature-name]/techspec.md`
- [ ] Final output path provided and confirmation

<critical>EXPLORE THE PROJECT FIRST BEFORE ASKING THE CLARIFYING QUESTIONS</critical>
<critical>DO NOT GENERATE THE TECH SPEC WITHOUT FIRST ASKING CLARIFYING QUESTIONS (use your ask-user-questions tool)</critical>
<critical>USE WEB SEARCH (AT LEAST 3 SEARCHES) TO LOOK UP LIBRARY APIS AND BUSINESS RULES BEFORE ASKING THE CLARIFYING QUESTIONS</critical>
<critical>UNDER NO CIRCUMSTANCES DEVIATE FROM THE TECHSPEC TEMPLATE STANDARD</critical>

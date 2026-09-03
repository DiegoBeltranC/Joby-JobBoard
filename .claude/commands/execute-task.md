You are an AI assistant responsible for implementing tasks correctly. Your job is to identify the next available task, perform the necessary setup, prepare to start the work, AND IMPLEMENT it.

<critical>After completing the task, **mark it as complete in tasks.md**</critical>
<critical>You must not rush to finish the task; always check the necessary files, verify the gates, and go through a reasoning process to ensure both understanding and execution (you are not lazy)</critical>
<critical>THE TASK CANNOT BE CONSIDERED COMPLETE UNTIL `npm run build` AND `npm run lint` PASS CLEANLY, and any tests that exist pass</critical>
<critical>You cannot finish the task without running the @task-reviewer review agent; if it does not pass you must resolve the issues and review again</critical>
<critical>PIXEL PERFECT RULE: if the task modifies UI in ANY way, the implementation MUST match the product's prototype/design source of truth — compare against it directly (spacing, typography, colors via the tokens in `src/app/globals.css`, states, motion), desktop AND mobile. See `fidelity.md`, `html-prototype.md`, and `design-system.md`. A UI task is NOT complete while any visual deviation remains.</critical>

## Information Provided

## File Locations

- PRD: `./tasks/prd-[feature-name]/prd.md`
- Tech Spec: `./tasks/prd-[feature-name]/techspec.md`
- Tasks: `./tasks/prd-[feature-name]/tasks.md`
- Project Rules: @CLAUDE.md (consult the "Rule discovery" table and load only the relevant rules via Read)

## Steps to Execute

### 1. Pre-Task Setup

- Read the task definition
- Review the PRD context
- Check the tech spec requirements
- Understand dependencies from previous tasks

### 2. Task Analysis

Analyze considering:

- The task's main objectives
- How the task fits into the project context
- Alignment with project rules and standards
- Possible solutions or approaches

### 3. Task Summary

```
Task ID: [ID or number]
Task Name: [Name or brief description]
PRD Context: [Main points from the PRD]
Tech Spec Requirements: [Main technical requirements]
Dependencies: [List of dependencies]
Main Objectives: [Primary objectives]
Risks/Challenges: [Identified risks or challenges]
```

### 4. Approach Plan

```
1. [First step]
2. [Second step]
3. [Additional steps as needed]
```

### 5. Review

1. Run the @task-reviewer review agent
2. Address the issues indicated
3. Do not finish the task until they are resolved

<critical>DO NOT SKIP ANY STEP</critical>

## Reactivity and Loading Verification (MANDATORY)

Before marking the task as complete, run this verification against `reactivity-loading.md`:

1. **Pending states:** does every button/form that calls a server action have `disabled` + a spinner via `useTransition` / `useFormStatus` (not a hand-rolled `useState` loading boolean)? If not → fix it.
2. **No page reload:** was any `window.location.reload()`, `location.reload()`, or `router.refresh()` (used as a substitute for the action revalidating) introduced? If so → replace it with `revalidatePath` in the server action.
3. **No server data in client state:** is any server-fetched data copied into client `useState`? If so → read it from the server component and pass it down, letting revalidation keep it fresh.
4. **Reactive refresh after writes:** does the server action call `revalidatePath(...)` (or `revalidateTag`) after a successful write, and does the client drive the UI from the returned `{ success } / { error } / { redirect }`? If not → adjust it.
5. **Page-level loading/errors:** for new async pages, is there a `loading.tsx` / `<Suspense>` fallback and, where relevant, `error.tsx` / `notFound()`? If not → add it.

Consult `reactivity-loading.md` for examples and mandatory patterns.

<critical>The task CANNOT be considered complete if mutation controls lack a pending state or if there are page reloads after write operations instead of `revalidatePath`</critical>

## Important Notes

- Always check the PRD, tech spec, and task file
- Implement proper solutions **without using hacks**
- Follow all established project standards
- **Database migrations (Prisma):** If the task changes the data model, edit `prisma/schema.prisma` and create a migration with `npx prisma migrate dev --name <description>`; the migration files land under `prisma/migrations/`. Run `npx prisma generate` afterward so the generated client (`src/generated/prisma`) stays in sync. **The task CANNOT be considered complete if the schema change is not migrated** — verify the migration applied successfully before proceeding.
- **Seeding data:** If the task introduces new models that the app or manual QA needs data for, update the Prisma seed and run `npx prisma db seed` so there is realistic data to work against.

## Implementation

After providing the summary and approach, **immediately begin implementing the task**:
- Run the necessary commands
- Make code changes
- Follow established project standards
- Ensure all requirements are met

## Quality Gates

Before marking the task complete, the real gates must be green (see `lint.md`, `tests.md`):

- `npm run build` — `next build`, the type-check + compile gate (a faster `npx tsc --noEmit` can be used during iteration).
- `npm run lint` — ESLint; use `npx eslint . --fix` to auto-fix.
- If the task added non-trivial logic (zod schemas, `lib/` helpers, server-action branching), **add tests** for it (Vitest + Testing Library for units, Playwright for E2E) per `tests.md`, and make sure existing tests still pass. There is no test tooling installed yet and no hard coverage gate — don't claim a change is "tested" if it isn't, but do add tests where they're cheap and high-value.

## Commits

Create atomic commits throughout the implementation following Conventional Commits (see `git.md`):
- Commit upon finishing each logical unit (e.g. zod schema + server action, `.tsx` form/component, route handler, Prisma schema/migration, tests)
- Format: `<type>(<scope>): <description>` (e.g., `feat(vacantes): agrega esquema zod y acción de creación`, then `feat(vacantes): agrega formulario de nueva vacante`)
- Do not write AI-generated attributions in the commit body (e.g., "Generated with Claude").
- Add only the relevant files (never `git add .`)

<critical>**YOU MUST** start the implementation right after the process above.</critical>
Optionally, look up official documentation for the frameworks and libraries involved (Next.js, Prisma, zod, shadcn/Radix) when a detail is unclear — this is a nice-to-have, not a blocker.
<critical>After completing the task, mark it as complete in tasks.md</critical>
<critical>You cannot finish the task without running the @task-reviewer review agent; if it does not pass you must resolve the issues and review again</critical>

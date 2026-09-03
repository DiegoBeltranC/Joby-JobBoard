---
description: Automatically iterates over project-spec.md running the full pipeline for each pending PRD (create-prd → create-techspec → create-tasks → execute-tasks).
argument-hint: "[count] [PRD: N]"
---

# Execute AI Workflow

You are the **orchestrator** that executes PRDs autonomously, iterating over
`project-spec.md`. You run in the **main window**.

## Why NOT delegate the entire PRD to a subagent

The `execute-tasks` command launches **one subagent per task** (sequentially). These
subagents need to be **direct children of this main window** to work. If you delegated the
entire PRD to a subagent and it called `execute-tasks` inside there, it would create
nesting that is too deep (main → subagent-PRD → subagent-task), which is not
reliable in Claude Code.

**Therefore: you run the `create-prd`, `create-techspec`, `create-tasks`, and
`execute-tasks` commands YOURSELF, in this window, in sequence.** The isolation of heavy
context is already handled by `execute-tasks` itself (each task runs in its own subagent and
returns only a summary). The critical state between PRDs lives **on disk** (prd.md,
techspec.md, tasks, project-spec.md), not in your window — so accumulating context across
the PRDs does not lose essential information.

## Parameters (`$ARGUMENTS`)

- **Number of PRDs** (standalone number, e.g., `2`). Default: **2**. This is the **hard limit**
  of PRDs this run will execute.
- **Initial PRD** (`PRD: 16` or `16`). Optional. If absent, start from the first
  `[ ] Pending` in the table of the `## 8. Project PRDs` section.

Examples:
- `/execute-ai-workflow` → 4 PRDs starting from the next pending one.
- `/execute-ai-workflow 6` → 6 PRDs starting from the next pending one.
- `/execute-ai-workflow PRD: 16` → 4 PRDs starting at 16.
- `/execute-ai-workflow 1 PRD: 16` → only PRD-16 (recommended for the first test).

## Step 0 — Plan

1. Read the table of section 8 of `project-spec.md`.
2. Determine the initial PRD (parameter, or first `[ ] Pending`).
3. Build the queue: the next N pending PRDs in ascending order, skipping `[x] Completed`.
   **N is a fixed ceiling.** The queue has at most N PRDs and this number NEVER increases during the
   run, even if new PRDs are created (see Step 5).
4. Print the queue (e.g., "I will execute (maximum 2): PRD-16, PRD-17").
5. Execute **one PRD at a time, sequentially** (each one depends on the state of the previous one).
   For each PRD, do Steps 1–7 below, in order, completing each step before the next.

## For EACH PRD in the queue — execute these steps yourself

Read from project-spec.md the number `{N}`, the slug `{SLUG}` (e.g., `vacantes-filtros`), and the
full line of the `/create-prd PRD-{N}-...` command (in the "Commands to create each PRD" block).

**General autonomy rule:** NEVER ask the user. In any clarification of
any command, assume the **best technical decision** that does not violate the project's rules.

**Deterministic resumption (continue where you left off):** each PRD may be partially
processed from a previous run. BEFORE executing the steps, do a **state probe**
in `tasks/prd-{SLUG}/` and enter exactly at the first step whose artifact does not yet
exist. Do not re-run steps already completed.

Probe (in this order):
1. Does `tasks/prd-{SLUG}/prd.md` exist (non-empty)? If **not** → start at **Step 1**.
2. Does `tasks/prd-{SLUG}/techspec.md` exist (non-empty)? If **not** → skip Step 1, start at **Step 2**.
3. Do **task** files generated in `tasks/prd-{SLUG}/` exist (e.g., `tasks.md` or
   `1_*.md`, `2_*.md`, or whatever `create-tasks` produces in this project)? If **not** → skip
   Steps 1–2, start at **Step 3**.
4. The tasks exist but **not all have been executed/approved** (there are tasks without a
   completed marking, or the pipeline did not run)? → skip Steps 1–3, start at **Step 4**
   (`execute-tasks` resumes from the first pending task — it is already idempotent per task).
5. All tasks completed but the PRD is **not yet `[x] Completed`** in the table of
   section 8 (closure/marking was missing)? → skip Steps 1–4, start at **Step 5**.
6. PRD already `[x] Completed` with ✅ on the command? → **skip the entire PRD**, go to the next in the queue.

Probe rules:
- Treat "exists but empty/truncated" as **does not exist** (re-generate that step).
- The probe decides only the **entry point**; from there, execute the following steps
  normally, in order, up to Step 7.
- If the file structure of `create-tasks`/`execute-tasks` in this project differs
  from the one assumed above, **adapt the detection to the actual format** found in `tasks/prd-{SLUG}/`
  and in already-completed PRDs (use them as a reference for what "complete" means).
- When in doubt about whether an artifact is really complete, prefer to **inspect the content**
  (open the file) rather than relying only on the existence of the name.

### Step 1 — create-prd
Run the full command line: `{CREATE_PRD_COMMAND}`.
Clarifications → best technical decision. If something can be addressed in a later PRD,
**record it in project-spec.md** by updating the **table of section 8** AND the **corresponding
`/create-prd` command** in the commands block. Capture the path (`tasks/prd-{SLUG}/prd.md`).

### Step 2 — create-techspec
Run: `/create-techspec @tasks/prd-{SLUG}/prd.md`.
Clarifications → best technical decision. Capture `tasks/prd-{SLUG}/techspec.md`.

### Step 3 — create-tasks
Run: `/create-tasks @tasks/prd-{SLUG}/prd.md @tasks/prd-{SLUG}/techspec.md`.
When it asks for approval of the structure, ALWAYS answer:
"I approve the structure, but make everything sequential".
Tasks MUST be sequential (no parallel worktrees).

### Step 4 — execute-tasks (full pipeline)
Run: `/execute-tasks tasks/prd-{SLUG} full pipeline`.
This command will launch one subagent per task, sequentially — let it work and wait for
ALL of them to complete with the full pipeline (QA, security, review).

### Step 5 — closing out pending items

Execute the closing prompt below. It has the autonomy to resolve issues in the current PRD,
re-address carry-overs to other PRDs, AND create entirely new PRDs when necessary.

Prompt to execute:
"If there is anything left pending or any caveat that must be addressed in another
PRD, do it, modify the project-spec. If there is anything that needs to be resolved in this PRD,
resolve it; if there is any issue, resolve it. Do not leave anything pending and unaddressed. If
you identify a need that does not fit into any existing PRD, you MAY create a new PRD
in project-spec.md (e.g., PRD-32) to cover it."

**Rules for creating a new PRD (e.g., PRD-32):**
- The new PRD must be created **complete** in `project-spec.md`:
  1. New row in the **table of section 8** (#, slug, description, dependencies, Status
     `[ ] Pending`).
  2. New line in the **`/create-prd` commands block** following the pattern of the others (slug
     prefixed, description, coverage criterion). **No ✅** — it has not been executed.
  3. Update of the **dependencies** of any affected PRD and of the new PRD.
  4. Line in the **Revision History (section 11)** recording the creation.
- ⚠️ **The new PRD NEVER enters the queue of this run.** It is always added to the **end
  of the PRD list** (highest number), stays `[ ] Pending`, and will only be executed in a
  **future** invocation of `/execute-ai-workflow`. The ceiling of N PRDs for this run is hard:
  if you requested a maximum of 4 and a new PRD was created, it is **not** executed now.
- In the final report, **explicitly highlight** any new PRD created, so the user
  knows it exists and is left pending for the next run.

### Step 6 — mark completed (TWO markings + history)
In `project-spec.md`:
1. **Table of section 8:** change the Status of PRD-{N} to `[x] Completed` with a short summary
   in parentheses in the pattern of the already-completed rows (number of tasks, pipeline,
   carry-overs).
2. **`/create-prd` commands block:** add **✅** to the end of the PRD-{N} line
   (same visual pattern as the completed ones).
3. **Section 11 (Revision History):** add a line with the current date, new version
   number, and a summary of what was delivered.

### Step 7 — record and continue
Note 1 summary line for this PRD in your context and go to the next in the queue.
**If this PRD failed** (unrecoverable error or pipeline rejected without resolution), **STOP**:
do not advance to the next ones (they depend on this one). Report where and why you stopped.

## Final step — consolidated report

When you finish the queue (or stop due to failure), print:
- PRDs completed successfully (1 line each).
- The PRD where you stopped, if any, and the reason.
- New carry-overs recorded in project-spec.md.
- **New PRDs created** during the run (e.g., PRD-32), marked as pending for the
  next run — highlighted separately.

## Non-negotiable principles
- **Always sequential** — PRDs and tasks, one after the other. Never parallelize.
- **Never ask the user** during execution. Decide technically.
- **Deterministic resumption** — always probe the state on disk and enter at the first step
  with a missing artifact; never re-run an already-completed step.
- **The ceiling of N PRDs is hard.** The run executes at most N PRDs. PRDs created during
  closure go to the **end of the list** as `[ ] Pending` and are **never** executed
  in this same run — only in the next invocation.
- **Respect the infrastructure NFRs** defined in the project-spec — in particular, never run
  destructive Prisma/Postgres operations (`prisma migrate reset`, dropping tables) against a
  production database. Migrations move forward with `npx prisma migrate dev` in development only.
- Let `execute-tasks` manage the heavy context via its per-task subagents.

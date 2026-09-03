You are a task orchestrator. Your responsibility is to execute ALL pending tasks of a PRD, delegating each one to an isolated subagent. The whole run happens inside a **dedicated git worktree on its own branch**, so several PRDs can be executed at the same time in parallel worktrees without ever touching each other's files.

<critical>The ENTIRE run happens in a DEDICATED WORKTREE + BRANCH created for this PRD (see step 0) — NEVER run tasks in the user's main checkout</critical>
<critical>Each task MUST be executed by an isolated Agent (subagent) — NEVER execute the task directly in the main context</critical>
<critical>Tasks ALWAYS run SEQUENTIALLY — one agent at a time, never two in the same message. Parallelism comes from the user running ANOTHER PRD in ANOTHER worktree, not from parallel tasks inside one PRD</critical>
<critical>If a subagent fails, STOP the execution and report to the user</critical>

## Input

The user provides the path to the PRD folder. Example:
```
/execute-tasks tasks/prd-feature-name
```

## Expected Files

- PRD: `{folder}/prd.md`
- Tech Spec: `{folder}/techspec.md`
- Tasks: `{folder}/tasks.md`
- Individual tasks: `{folder}/1_task.md`, `{folder}/2_task.md`, etc.

## Process

### 0. Dedicated Worktree + Branch (Mandatory)

Every `/execute-tasks` run gets **its own git worktree on its own branch**, cut from `main`. This is
what makes it safe to run another PRD at the same time in another worktree: two runs never share a
working directory, an index, or a checked-out branch.

**Naming (derive, don't invent):**

- **Branch** — if the PRD or techspec already names one, use it **verbatim**. Otherwise derive it from
  the PRD folder slug: `tasks/prd-vacantes-filtros` → `feat/vacantes-filtros` (`prd-` dropped,
  kebab-case). Short feature branches (`feat/…`, `fix/…`) are the repo convention — see `git.md`.
- **Worktree directory** — the branch name with `/` replaced by `-`, under a neutral sibling path
  `../.worktrees/<repo>/`: e.g. `.worktrees/bolsa-trabajo/feat-vacantes-filtros`.
- **Base branch** — always **`main`** (the default and production branch on Vercel). Always
  `git fetch origin main` before cutting so the worktree starts from the current remote head.

**Bootstrap:**

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
WS_ROOT=$(dirname "$REPO_ROOT")
SLUG="<prd-slug>"                                  # e.g. vacantes-filtros (from tasks/prd-<slug>)
BRANCH="feat/$SLUG"                                # from the rule above
WT="$WS_ROOT/.worktrees/$REPO_NAME/${BRANCH//\//-}"

BASE=main
git -C "$REPO_ROOT" fetch origin "$BASE"

if [ -d "$WT" ]; then
  echo "reusing existing worktree"                # resumed run — do NOT recreate
elif git -C "$REPO_ROOT" show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git -C "$REPO_ROOT" worktree add "$WT" "$BRANCH"          # branch already exists
else
  git -C "$REPO_ROOT" worktree add -b "$BRANCH" "$WT" "origin/$BASE"
fi
```

**Rules for this step:**

1. **Never steal a checked-out branch.** If `$BRANCH` is already checked out in the main checkout,
   `git worktree add` fails. Report it and ask the user to switch that checkout to `main` — do
   **not** force it while there are uncommitted changes.
2. **Carry the PRD folder in.** The `tasks/<prd-folder>/` docs often live untracked in the main
   checkout, so they will not exist in a fresh worktree. Copy them before launching any agent:
   `mkdir -p "$WT/tasks" && cp -R "$REPO_ROOT/tasks/<prd-folder>" "$WT/tasks/"`.
3. **Install deps in the worktree.** A fresh worktree has no `node_modules`: `cd "$WT" && npm install`.
   If the tasks will touch `prisma/schema.prisma`, also run `cd "$WT" && npx prisma generate` so the
   generated client exists.
4. **Every path from here on is inside `$WT`.** The orchestrator, every subagent, every build/lint run,
   and every commit operate there and nowhere else.
5. **Announce it** before starting:

```
═══════════════════════════════════════════
  WORKTREE  {WT}
  BRANCH    {BRANCH}  (from main)
═══════════════════════════════════════════
```

### 1. Task Discovery and Execution Order

1. Read the `tasks.md` file from the provided folder
2. Identify all pending tasks (lines with `- [ ]`)
3. Read the **Execution Order** section — it defines the **order** the tasks run in. Tasks grouped
   in the same step share no ordering constraint between them, but they still run **one at a time**
   (see the critical rules): the group only tells you they may run in any order within the step.
4. Display the summary:

```
═══════════════════════════════════════════
  PRD: {PRD name}
  Total: {N} tasks | Pending: {X} | Complete: {Y}

  Execution Order (always sequential):
  - step 1: tasks [1]
  - step 2: tasks [2, 3]
  - step 3: tasks [4]
═══════════════════════════════════════════
```

**If the "Execution Order" section does not exist**, execute all pending tasks in numeric order.

### 2. Execution by Steps

For each step (in order):

#### 2.1 Filter Pending Tasks of the Step

From the current step, filter only the tasks that are still pending (`- [ ]`). If all tasks of the step are already complete, skip to the next step.

#### 2.2 Display Progress

```
═══════════════════════════════════════════
  STEP {S}/{TOTAL_STEPS}
  Tasks: {list of task numbers of the step}
  Worktree: {WT}
═══════════════════════════════════════════
```

#### 2.3 Launch Agents

Launch **one Agent at a time**, in task order, with `subagent_type: "general-purpose"`. Wait for it
to finish before launching the next — even when the step lists several tasks.

Do **NOT** pass `isolation: "worktree"`: the run already lives in the dedicated worktree from step 0,
and a nested worktree would fragment the branch and force merges. The worktree IS the isolation.

**Agent Prompt:**
```
You are an AI assistant responsible for correctly implementing the task below.

WORKTREE: {WT}
BRANCH: {BRANCH}
Work ONLY inside this worktree. Every file you read, edit, or create is under {WT}; every command
runs there (cd {WT} && …, git -C {WT} …). NEVER touch the repo's main checkout, another worktree,
or a sibling repo — another PRD may be executing there right now.

TASK: {full content of the N_task.md file}

MANDATORY RULES:
1. Read the PRD at {WT}/tasks/{prd-folder}/prd.md and the techspec at {WT}/tasks/{prd-folder}/techspec.md BEFORE implementing
2. Read the project rules in .claude/docs/rules/ (code-standards.md, architecture.md, services.md, lint.md). The remaining rules are injected automatically by the PreToolUse hook according to the edited path.
3. Check dependencies from previous tasks
4. Implement the task following all project standards
5. Optionally consult official docs (Next.js, Prisma, zod, shadcn/Radix) when a detail is unclear
6. QUALITY GATES: `npm run build` (type-check + compile) and `npm run lint` MUST pass cleanly. Add tests for non-trivial logic (zod schemas, lib helpers, server-action branching) per tests.md — there is no hard coverage gate yet, but don't claim a change is tested if it isn't.
7. CREATE ATOMIC COMMITS following Conventional Commits: format `<type>(<scope>): <description>`. One commit per logical unit (e.g. zod schema + server action, `.tsx` component/form, route handler, Prisma schema/migration, tests). Do not write AI-generated attributions in the commit body (e.g., "Generated with Claude"). Never use git add . — add only the relevant files.
8. DATABASE MIGRATIONS (Prisma): If the task changes the data model, edit prisma/schema.prisma and create the migration with `npx prisma migrate dev --name <description>` (files land in prisma/migrations/), then run `npx prisma generate`. The task is NOT complete if the schema change is not migrated.
9. Run the review agent (task-reviewer) and fix the issues found
10. After everything passes, mark the task as complete in {WT}/tasks/{prd-folder}/tasks.md

Do not rush. Check files, gates, and go through a complete reasoning process.
Implement proper solutions without hacks.
```

#### 2.4 Evaluate Step Results

When the last agent of the step returns:

1. No merge is ever needed — every task committed straight onto `{BRANCH}` inside `{WT}`
2. Confirm the work landed where it should: `git -C {WT} log --oneline -n {tasks in step}` and
   `git -C {WT} status --short` (a dirty tree means an agent left work uncommitted — treat as failure)
3. Re-read `{WT}/tasks/{prd-folder}/tasks.md` to verify that all tasks of the step were marked as `[x]`
4. If **all ok**: display the step summary and proceed to the next
5. If **any failed**: STOP and report the failure to the user (task number + name + a 1-line reason).
   Leave the worktree in place so the user can inspect it

### 3. Finalization

After all steps:

```
═══════════════════════════════════════════
  ALL TASKS COMPLETED
  Total: {N} tasks executed
  PRD: {PRD name}
  Branch: {BRANCH}
  Worktree: {WT}
═══════════════════════════════════════════
```

**Do NOT remove the worktree.** It holds the branch the user reviews and opens the PR from (a PR into
`main` gets a Vercel Preview automatically). Print the cleanup line so they can drop it when done:

```bash
git -C {REPO_ROOT} worktree remove {WT}    # after the PR is merged
```

#### 3.1 Tech Debt Sweep (Mandatory)

Before the final summary, sweep the execution for tech debt **created or discovered while implementing
these tasks** — shortcuts taken, `TODO`/`FIXME`/`HACK` left in the diff, skipped tests,
temporary workarounds, missing validation, hardcoded values, deferred refactors, or anything
the agents flagged as "out of scope for now".

1. Review the tasks' diffs/notes and grep the touched files for `TODO|FIXME|HACK|XXX`.
2. For **each** debt found, register it with `/add-tech-debt` (see `.claude/commands/add-tech-debt.md`)
   — it assigns the ID and writes it into the `TECH_DEBT.md` registry under the right section.
3. If nothing was found, state "No new tech debt introduced." explicitly — don't skip silently.
4. Include the registered IDs in the finalization output and in the final summary.

<critical>Do NOT fix the debt here — only record it. The point is that nothing gets left behind.</critical>

**If NOT a full pipeline**, print the final summary (see the "Final Summary" section) and stop.

### 4. Full Pipeline (optional)

This phase **only runs if the user includes "full pipeline" in the invocation**. Example:
```
/execute-tasks tasks/prd-feature-name full pipeline
```

If the user did NOT mention "full pipeline", stop at step 3.

When activated, execute the phases below **sequentially** after all tasks are completed. Each phase runs in an isolated Agent so as not to pollute the main context.

<critical>Every pipeline phase below also runs inside `{WT}` on `{BRANCH}`. Prefix each phase prompt with the same `WORKTREE: {WT}` preamble used in step 2.3, and run any direct command with `cd {WT} && …`. The `{folder}` referenced in the phase prompts means `{WT}/tasks/{prd-folder}`.</critical>

#### 4.0 Environment Preparation (Mandatory before QA)

Before starting QA, run directly (without an Agent):

```bash
cd {WT} && npx prisma migrate dev && npx prisma generate
```

This ensures the schema created by the tasks is applied to the database and the generated client is
in sync. Without this, QA fails with missing-table/column Prisma errors when it exercises the real data
layer. If the migrate fails, report to the user and **stop** — QA cannot run against an out-of-date
database.

#### 4.0.1 Reactivity and Loading Verification (Mandatory)

Launch an Agent with:
```
prompt: "Audit of reactivity and loading states in the files changed by this PRD.

Read the rule .claude/docs/rules/reactivity-loading.md to understand the mandatory patterns.

Then, identify ALL `.tsx` and `.ts` files under src/ that were changed in this PRD (use git diff --name-only from the base branch to HEAD).

For EACH changed file involved in a write (server action / route handler mutation and its client caller), verify:

1. PENDING STATES: does every button/form that calls a server action have `disabled` + a spinner via `useTransition` / `useFormStatus` (NOT a hand-rolled `useState` loading boolean)? If NOT → list it as a violation.

2. PAGE RELOADS: is there any `window.location.reload()`, `location.reload()`, `location.href = …`, or `router.refresh()` used as a substitute for the action revalidating? If SO → list it as a violation.

3. SERVER DATA IN CLIENT STATE: is server-fetched data copied into client `useState` (which desyncs on revalidation)? If SO → list it as a violation.

4. REVALIDATION AFTER WRITES: does the server action call `revalidatePath(...)` / `revalidateTag(...)` after a successful write, and does the client drive the UI from the returned `{ success } / { error } / { redirect }` (instead of re-fetching or reloading)? If NOT → list it as a violation.

If ZERO violations: report 'APPROVED — Reactivity and loading OK'.

If ANY violation found: report ALL violations with file + line + description + suggested fix. Do NOT fix — just report."
```

**If violations are found:** launch an Agent to fix ALL of them:
```
prompt: "Read the reactivity/loading violations reported below and fix ALL of them following the patterns in .claude/docs/rules/reactivity-loading.md.

Violations:
{list of violations from the previous agent}

For each violation:
- Missing pending state → add `useTransition`/`useFormStatus` + disabled + spinner
- Page reload → replace with `revalidatePath` in the server action (and a `router.push` of a returned `{ redirect }` when navigation is needed)
- Server data in client state → read it from the server component and pass it down as props
- Missing revalidation → call `revalidatePath`/`revalidateTag` in the action and return `{ success } / { error }`

Create atomic commits with the format: `fix(reactivity): agrega estado de carga en {componente}` or `fix(reactivity): revalida en vez de recargar en {acción}`.

Run `npx eslint . --fix` and `npm run build` after the fixes (plus any existing tests)."
```

Re-run the verification after the fix (maximum 2 attempts). If there are still violations, report to the user and **continue** to QA.

#### 4.1 Generate QA Test Cases

Launch an Agent with:
```
prompt: "Execute the /create-qa-test-cases skill {folder}"
```

Wait for the agent to return. If it fails, report to the user and **continue** to the next phase (it is not blocking).

#### 4.2 Execute QA

Launch an Agent with:
```
prompt: "Execute the /execute-qa skill {folder}"
```

Wait for the agent to return. Display the result (approved/failed + bugs found).

**If FAILED:** enter the fix cycle (maximum 3 attempts):

1. Launch an Agent to fix the bugs:
```
prompt: "Execute the /execute-bugfix skill {folder}"
```
2. After the fix, re-run QA by launching a new Agent:
```
prompt: "Execute the /execute-qa skill {folder}"
```
3. If approved, proceed to the next phase. If it fails again, repeat the cycle (up to 3 attempts).
4. If after 3 attempts it is still failing, report to the user and **continue** to the next phase.

#### 4.3 Execute Security Audit

Launch an Agent with:
```
prompt: "Execute the /execute-security skill {folder}"
```

Wait for the agent to return. Display the result (secure/risks identified + vulnerabilities found).

**If ANY vulnerability is found (including Medium, Low, and pre-existing):** enter the fix cycle (maximum 3 attempts):

1. Launch an Agent to fix ALL vulnerabilities:
```
prompt: "Read the security report at {folder}/security-report.md and fix ALL listed vulnerabilities — Critical, High, Medium, Low, and Informational. ZERO issues may remain open, not even pre-existing ones. This includes: dependencies with CVEs (use npm `overrides` in package.json until `npm audit` reports 0), missing security headers (configure them via `next.config` `headers()` or `middleware.ts` — this is a Next.js app, do NOT add a separate Node server framework or a headers middleware library), `dangerouslySetInnerHTML` without sanitization (use `isomorphic-dompurify`), incomplete input validation (validate with `zod` in server actions / route handlers), and broken authorization (enforce `getSession()` + role checks server-side). After fixing, run `npx eslint . --fix` and `npm run build` (plus any existing tests) to ensure lint and types pass. Create atomic commits with the format `fix(security): <description>`."
```
2. After the fix, re-run the security audit by launching a new Agent:
```
prompt: "Execute the /execute-security skill {folder}"
```
3. If ZERO vulnerabilities, proceed to the next phase. If there is still any issue, repeat the cycle (up to 3 attempts).
4. If after 3 attempts there are still issues, report to the user and **continue** to the next phase.

#### 4.5 Execute Review

Launch an Agent with:
```
prompt: "Execute the /execute-review skill {folder}"
```

Wait for the agent to return. Display the result (approved/failed + issues found).

**If FAILED:** enter the fix cycle (maximum 3 attempts):

1. Launch an Agent to fix the problems found in the review:
```
prompt: "Read the review report at {folder}/code-review-report.md and fix all listed problems. After fixing, run `npx eslint . --fix` and `npm run build` (plus any existing tests) to ensure lint and types pass. Create atomic commits for each fix."
```
2. After the fix, re-run the review by launching a new Agent:
```
prompt: "Execute the /execute-review skill {folder}"
```
3. If approved, proceed to the summary. If it fails again, repeat the cycle (up to 3 attempts).
4. If after 3 attempts it is still failing, report the remaining problems to the user.

#### 4.5.1 Closure and Addressing of Pending Items (Mandatory)

Before the summary, ensure that **nothing is left pending and unaddressed**. Launch an Agent with:

```
prompt: "You are responsible for providing the final closure of the PRD in {folder}, ensuring that nothing is left pending or unaddressed.

Context: all tasks have been implemented and the quality pipeline (reactivity/loading, QA, security, review) has already run. Read the reports in the folder ({folder}/qa-report.md, {folder}/security-report.md, {folder}/code-review-report.md, and the *_task_review.md) and the {folder}/prd.md + {folder}/techspec.md to gather ALL pending items, caveats, carry-overs, follow-ups, and issues mentioned.

Apply the following user directive:
'If there is something that was left pending or some caveat that must be addressed in another PRD, do it, modify the project-spec. If there is something that needs to be resolved in this PRD, resolve it. If there is any issue, resolve it. Do not leave anything pending and unaddressed.'

Concretely:
1. Items that belong to OTHER PRDs (carry-overs, caveats, dependencies, follow-ups): record them in tasks/project-spec.md — both in the current PRD's line (marking it as Completed with a summary + list of carry-overs in the pattern of the already-completed lines) and in the target PRD(s)' line (with 📌/⚠️ indicating what was inherited and what should be reused/not reimplemented). ALSO mark the current PRD as done in the 'Commands to create each PRD' code block: append a trailing ` ✅` to this PRD's `/create-prd …` command line (matching the convention already used on the completed PRD command lines). Both the Section 8 status column AND the create-prd command line must carry the ✅.
2. Items that belong to THIS PRD and are still open (issues, residual bugs, in-scope hardening, parity gaps): RESOLVE them now, with tests where practical, keeping lint and types clean (run `npx eslint . --fix` and `npm run build`; run `npx prisma migrate dev` / `npx prisma generate` if the schema changed).
3. Do NOT treat intentional 1:1 parity that is already documented as pending (just confirm it is documented). Do NOT modify pre-existing files outside the PRD's scope or files from other PRDs.
4. Create atomic commits (Conventional Commits, without mention of AI, without git add .): use docs(tasks) for the project-spec/artifacts update and fix(...)/feat(...) for code fixes. Commit the current PRD's documentation artifacts (prd/techspec/tasks/reports) that are still untracked, without including files from other PRDs or unrelated pre-existing changes.

At the end, report: (a) what was resolved in-scope, (b) the carry-overs recorded in the project-spec and their target PRDs, (c) what is a non-issue/intentional parity, and (d) the commits created."
```

Wait for the agent to return. If it resolves in-scope code, the changes are already on the current branch (committed by the agent itself). Display a summary of the closure (in-scope resolved + carry-overs recorded). If the agent reports that it needed to reopen some fix and it failed, report to the user and **continue** to the summary (non-blocking).

#### 4.6 Pipeline Summary

```
═══════════════════════════════════════════
  FULL PIPELINE FINISHED
  PRD: {PRD name}

  Tasks:      {N}/{N} completed ✓
  QA Cases:   {generated | failed}
  QA:         {approved | failed | error}
  Security:   {secure | risks identified | critical risks | error}
  Review:     {approved | failed | error}
  Closure:    {in-scope resolved + carry-overs in project-spec}
═══════════════════════════════════════════
```

Print the final summary (see the "Final Summary" section).

## Rules

- **One worktree per PRD run**: the run is bootstrapped into `.worktrees/<repo>/<branch>` on its own branch cut from `main` (step 0). This is the isolation boundary — it is what lets the user execute another PRD simultaneously in another worktree
- **Never the main checkout**: the user's primary checkout is left untouched and free for other work
- **Isolated context**: Each task runs in a separate subagent — the heavy context (diffs, build/lint output, code) is discarded when the agent finishes
- **Always sequential**: one agent at a time, in task order, never two in the same message. Steps only express ordering, not concurrency
- **No nested worktrees**: agents never get `isolation: "worktree"` — they already run inside the PRD's worktree
- **Single branch, no merges**: every task commits directly onto the PRD branch inside the worktree. Do NOT create per-task branches
- **The worktree survives the run**: it is where the user reviews and opens the PR from; only the user removes it
- **Fail-fast**: If any task fails, stop immediately and leave the worktree as-is for inspection
- **No direct implementation**: The orchestrator NEVER implements code — it only delegates
- **Verification between steps**: After each step, re-read `tasks.md` (inside the worktree) to confirm that the tasks were marked

## Final Summary

When the run finishes — simple mode or full pipeline — give the user a short **plain-text summary
directly in your reply**. There is no external notification mechanism; the summary IS the notification.

**Simple mode (after step 3):**
```
Tasks completed — {PRD name}
Folder:    {PRD folder}
Branch:    {BRANCH}
Worktree:  {WT}
Tasks:     {N}/{N} executed
Tech debt: {none | IDs registered, e.g. TD-CORE-11}
Next:      open a PR into main from {BRANCH} for the Vercel Preview.
```

**Full pipeline (after step 4.6):**
```
Full pipeline finished — {PRD name}
Folder:    {PRD folder}
Branch:    {BRANCH}
Worktree:  {WT}
Tasks:     {N}/{N} completed
QA:        {approved | failed | error}
Security:  {secure | risks identified | critical risks | error}
Review:    {approved | failed | error}
Closure:   {in-scope resolved + carry-overs in project-spec}
Tech debt: {none | IDs registered}
```

**If a task fails (fail-fast):**
```
Task failed — {PRD name}
Folder:  {PRD folder}
Task {number}: {task name}
Reason:  {failure reason, summarized in 1 line}
Worktree left in place for inspection: {WT}
```

## Usage Example

```
# Task execution only
/execute-tasks tasks/prd-vacantes-filtros

# With full pipeline (QA test cases + QA + security + review)
/execute-tasks tasks/prd-vacantes-filtros full pipeline
```

With the following execution order in tasks.md:
```
- step 1: [1]
- step 2: [2, 3]
- step 3: [4, 5]
- step 4: [6]
```

The orchestrator:
1. Creates `.worktrees/<repo>/feat-<slug>` on `feat/<slug>` from `main`
2. Executes tasks 1 → 2 → 3 → 4 → 5 → 6, **one agent at a time**, all inside that worktree
3. Leaves the worktree and its branch in place for review / PR into `main`

Running two PRDs at once is the supported parallelism — each gets its own worktree:
```
# terminal A
/execute-tasks tasks/prd-vacantes-filtros
# terminal B (at the same time, different worktree, different branch)
/execute-tasks tasks/prd-perfil-cv-ia
```

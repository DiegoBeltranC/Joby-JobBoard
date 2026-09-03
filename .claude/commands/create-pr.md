You are an engineer opening a clear, well-structured pull request. Your job is to analyze everything that changed on the current branch and produce a standardized PR **title** and **description**, then open the PR — so a reviewer instantly understands what was done and why.

<critical>Match the repo's language convention (Spanish or English) — follow `.claude/docs/rules/git.md` and the recent commit history</critical>
<critical>NEVER mention Claude, AI, an assistant, or that this was AI-generated — in the title, body, or anywhere (see git.md "Authorship")</critical>
<critical>DO NOT DEVIATE FROM THE PR TEMPLATE STRUCTURE</critical>
<critical>Describe only what actually changed — read the real diff, do not invent or pad</critical>

## Template and Inputs

- PR template: @.claude/templates/pr-template.md
- Conventions: @.claude/docs/rules/git.md ("Conventional Commits", "Branches & Pull Requests")
- Optional arguments (`$ARGUMENTS`):
  - `base: <branch>` — the branch to open the PR against and diff from. Optional; defaults to `main`.
  - `head: <branch>` — the source branch. Optional; defaults to the current branch.
  - `--draft` — open the PR as a draft.

## Workflow

### 1. Determine the base and head

The default branch is **`main`** and PRs open into it. Git does **not** record which branch a branch was created from, so resolve the base in this order:

1. If `$ARGUMENTS` contains `base: <branch>`, use it.
2. Otherwise use the repository's **default branch** (`main`).

```bash
HEAD_BRANCH=$(git branch --show-current)   # override with head: <branch> from $ARGUMENTS
# base: use the explicit arg if given, else origin's default branch (main)
BASE=$(git remote show origin 2>/dev/null | sed -n 's/.*HEAD branch: //p')
BASE=${BASE:-main}
```

So `/create-pr` opens against `main`, and `/create-pr base: some-branch` compares against that branch instead. Diff with the three-dot form (`"$BASE...HEAD"`) so only this branch's own commits appear (compared from the merge-base). If `HEAD_BRANCH` equals `BASE`, stop and tell the user to create a feature branch first — do routine work on a short-lived branch (`feat/filtro-vacantes`, `fix/otp-cooldown`), never directly on `main`.

### 2. Gather everything that changed

Read the real changes — do not guess:

```bash
git log --oneline "$BASE..HEAD"
git diff --stat "$BASE...HEAD"
git diff "$BASE...HEAD"          # inspect the actual content for the summary
```

From this, understand: the scope, the areas/modules touched, new vs modified vs deleted files, whether any change is user-facing/UI, and whether there are **Prisma migrations**, config, or breaking changes. Group the changes logically (by area/feature), not file-by-file.

### 3. Write the title

Use **Conventional Commits** (see git.md), not any external ticket-key format:

```
<type>(<scope>): <description>
```

- `<type>`: one of `feat` · `fix` · `refactor` · `test` · `docs` · `style` · `chore` · `ci` · `perf` · `build`. If the PR spans several, pick the dominant one.
- `<scope>` (optional but recommended): the affected Joby area, read naturally in Spanish — `vacantes`, `perfil`, `auth`, `empresa`, `postulaciones`, `cv`, `admin`, `mail`.
- `<description>`: short, imperative, lowercase first letter, no trailing period; keep the first line ≤ 72 chars.
- The description may be Spanish or English — match the repo's recent history for consistency.
- Examples: `feat(vacantes): agrega filtro por modalidad en el inicio` · `fix(auth): corrige cooldown de reenvío de OTP`.

### 4. Write the description

Fill @.claude/templates/pr-template.md completely, grounded in the diff:

- **Summary** — what and why, 2–4 plain sentences.
- **Changes** — grouped bullets by area; specific, one per meaningful change.
- **Why** — motivation/context; link an issue/ticket if the branch name or commits reference one.
- **How to test** — concrete steps + expected result. Include the relevant commands (`npm run dev` on port 3000, `npm run build`, `npm run lint`, and `npx prisma migrate dev` / `npx prisma generate` when the schema changed) and the routes to visit.
- **Screenshots / demo** — keep the section for UI changes (desktop + mobile) and note that images must be added manually; delete it for non-UI PRs.
- **Notes / risks** — breaking changes, **Prisma migrations**, follow-ups, out-of-scope items, or "None".
- **Checklist** — keep the template checklist; tick items you can verify from the diff, leave the rest for the author.

Do not fabricate test steps or screenshots — if something must be filled in by a human, say so explicitly with a `[TODO: ...]` marker.

**Formatting — do NOT hard-wrap prose.** GitHub renders a single newline in a PR/issue body as a line break (`<br>`), so wrapping a paragraph across multiple source lines shows as broken lines mid-sentence even when there is horizontal space. Write **each paragraph and each bullet on one single line**, and separate blocks with a blank line. Let GitHub reflow the text.

### 5. Deployment note (Vercel)

The project deploys to **Vercel**: merging into `main` deploys **production**, and **every PR gets a Preview deployment automatically** (see git.md "Branches & Pull Requests"). In **Notes / risks**, state that a Preview will be available for review, and flag anything that behaves differently between Preview and Production — in particular, absolute URLs used in emails and QR/device flows must come from `NEXT_PUBLIC_APP_URL` / `VERCEL_*` env, not hardcoded hosts (see auth.md / services.md). Call out any Prisma migration that must run on deploy.

### 6. Open the PR

1. Make sure the branch is pushed:
   ```bash
   git push -u origin "$HEAD_BRANCH"
   ```
2. Write the body to a temp file and open the PR with `gh` (add `--draft` if requested):
   ```bash
   gh pr create --base "$BASE" --head "$HEAD_BRANCH" --title "<title>" --body-file <tmp-body-file>
   ```
3. If `gh` is not authenticated or the remote is missing, print the final title and body instead so the user can paste them, and say why it could not open automatically.

### 7. Report

Print the PR URL (or the title + body if it could not be opened), note that a Vercel Preview deployment will be created for the PR, and give a one-line summary of what the PR contains.

## Principles

- The PR should be understandable in under a minute: clear title, skimmable body, specific changes.
- Ground every statement in the actual diff.
- Match the repo's language (Spanish or English) per git.md; never reference AI/Claude anywhere in the PR.
- Follow the template exactly; do not add or remove sections beyond the documented rules.
- Keep PRs focused and reviewable — one logical change per PR.

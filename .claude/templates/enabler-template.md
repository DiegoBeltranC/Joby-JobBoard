# Development Estimate - [Feature Name]

> This estimate doubles as a ready-to-execute task breakdown. **Every task carries a single,
> self-contained description** (Task activities · Screenshots · References · scored activities ·
> Acceptance Criteria · build detail) — everything the executor needs to build it without opening
> another file. When a mockup exists (see `scratch/*.html`), capture desktop + mobile screenshots
> into `./assets/` (git-ignored, local only, optional) and reference them from the task.

## Epic Description

> Paste this into the epic / tracking issue, and link the source mockup/spec/design files.

**What this is.** [Plain-language product summary — what the feature is, where it lives, who uses it, the value it delivers.]

**Why now.** [Context and urgency.]

**Goals.**
- [Goal]
- [Goal]

**Headline changes.** [The key deltas vs the current state, one line.]

**Out of scope (separate tracks).** [What this epic does NOT cover and who owns it.]

**Delivery order.** [High-level sequencing of the tasks.]

**Linked files.** [The mockup/spec/design files linked to this epic.]

## Scope Summary

[Concise technical description of the feature scope, what will be developed, and hard requirements (e.g. pixel fidelity, mobile-friendly per responsive.md).]

## Overall Estimate

**Total: X.X points** (sum of all tasks below)

## Activity Breakdown

> **Task nomenclature:** every task title is `<NN> - [TAG] <Title> (X.X points)`.
> - `<NN>` = zero-padded sequential number: `01`, `02`, … `19`, `20` (matches the numbered task
>   files `01_task.md`, `02_task.md`).
> - `[TAG]` = the discipline: `[FRONT]`, `[BACK]`, `[DEVOPS]`, `[FULLSTACK]`, etc.
> - Example: `07 - [BACK] Persist postulación via server action + revalidatePath (2.0 points)`.
>
> Screenshots (when a mockup exists) live in `./assets/` (git-ignored, local only) — reference
> them from the task.

### 01 - [FRONT] [Title] (X.X points)

**Task activities**: [One-line technical summary of what this task builds.]

**Screenshots** (when a mockup exists):

| Desktop | Mobile |
|---|---|
| ![desc](assets/xx-desktop.png) | ![desc](assets/xx-mobile.png) |

**References:** [mockup/spec sections + the likely target files/dirs in the repo, e.g.
`src/app/(dashboard)/vacantes/page.tsx`, `src/actions/postulaciones.ts`, `src/components/…`].

- [ ] Activity 1 (X.X point)
- [ ] Activity 2 (X.X point)

**Goal:** [One sentence — what to deliver.]
**Why / where it fits:** [Short context: where this sits in the flow / product.]
**Depends on:** [Task refs that must land first, or "—".]

**What to build**
- [Granular, plain-language steps a junior dev can follow. Name the server component / server
  action / route handler / component involved.]

**Copy & data (verbatim)**
- [Inline EVERY label, option, value, table, and copy string the task needs — in **Spanish**, the
  product language (i18n.md). Omit only if the task genuinely has no data/copy.]

**States & edge cases**
- [default / selected / hover / focus / disabled / loading / error / empty — whichever apply.]
- Mobile: [specific behaviour from ~320px — touch targets, sticky bars, keyboards, no horizontal
  overflow (responsive.md).]

**Out of scope**
- [Explicit exclusions to prevent scope creep, or "—".]

**Acceptance Criteria / Done when**
- [ ] [Measurable, verifiable criterion, restated so the task stands alone.]
- [ ] `npm run build` and `npm run lint` pass.

---

[Repeat for each TASK...]

## Category Summary

| Category | Points |
|---|---|
| [Category 1] | X.X |
| [Category 2] | X.X |
| **Total** | **X.X** |

## Identified Dependencies

- [Dependency 1]
- [Dependency 2]

## Risks and Considerations

- [Risk 1]
- [Risk 2]

## Notes

- [Relevant note about assumptions, exclusions, or limitations of the estimate]

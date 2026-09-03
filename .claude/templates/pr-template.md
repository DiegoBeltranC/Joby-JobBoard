# Pull Request Template

> Standardized PR body for this repo. Fill every section; delete a section only when it truly
> does not apply (and say why). Write in English. Keep it skimmable — reviewers should
> understand *what* changed and *why* in under a minute.
>
> Every PR gets a **Vercel Preview** deployment — link it under "How to test" so reviewers can
> click through the change.
>
> Formatting: write each paragraph and bullet on **one single line** (no hard wrapping) —
> GitHub renders single newlines in PR bodies as line breaks. Separate blocks with a blank line.

## Summary

[2–4 sentences: what this PR does and the problem it solves. Plain language, no jargon.]

## Changes

[Grouped bullets of the concrete changes, by area. Be specific — name the modules/files/
features. One bullet per meaningful change, not one per file.]

- **[Area / module]** — [what changed]
- **[Area / module]** — [what changed]

## Why

[Context and motivation. Link the issue/ticket if there is one. Explain decisions or
trade-offs a reviewer would question.]

## How to test

[Step-by-step so a reviewer can verify locally or on the Vercel Preview. Include commands,
routes, and expected results.]

1. [step — e.g. `npm run dev` and open `http://localhost:3000/...`, or open the Preview URL]
2. [step]
3. [expected result]

## Screenshots / demo

[For any UI change, include before/after images or a short clip — desktop **and** mobile
(all new UI must be mobile-friendly — responsive.md). Delete this section only for non-UI changes.]

| | Before | After |
|---|---|---|
| Desktop | | |
| Mobile | | |

## Notes / risks

[Anything reviewers should watch: breaking changes, Prisma migrations, follow-ups, out-of-scope
items, or known limitations. Write "None" if there are none.]

## Checklist

- [ ] Conventional Commits, atomic commits
- [ ] New/changed logic has meaningful tests where it makes sense (tests.md)
- [ ] `npm run build` (type-check + compile) and `npm run lint` pass
- [ ] UI is mobile-friendly (works from ~320px), matches the design/mockup (responsive.md)
- [ ] Prisma migration included and checked in if the schema changed
- [ ] Docs/rules updated if behavior or conventions changed
- [ ] No secrets, credentials, or debug leftovers

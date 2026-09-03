# Project Spec - [Project Name]

## 1. Overview

### 1.1 Problem

[Describe the main problem the project solves. What pain exists today? Who suffers from it?]

### 1.2 Solution

[Describe the proposed solution at a high level. What does the project deliver as a whole?]

### 1.3 Project Objectives

[List the project's macro objectives:

- What is the expected outcome at the end?
- What are the success metrics for the project as a whole?
- What is the business value?]

---

## 2. Users and Context

### 2.1 Users

[Describe who the system's users are:

- Profiles/personas (e.g. estudiante, empresa, admin)
- Access model (roles: ESTUDIANTE, EMPRESA, ADMIN — see auth.md)
- Expected user volume]

### 2.2 Usage Context

[Describe the context in which the system will be used:

- Devices (mobile, desktop, tablet) — mobile-friendly is non-negotiable (responsive.md)
- Frequency of use
- Typical usage scenarios]

---

## 3. Project Scope

### 3.1 Modules / Functional Areas

[List all modules or functional areas that make up the project. For each module, briefly describe:

- What it does
- Why it is needed
- Dependencies with other modules]

### 3.2 Out of Scope

[Explicitly list what is NOT part of this project:

- Excluded features
- Integrations not planned
- Future evolutions]

---

## 4. Technical Stack (Reference)

> **Note:** Implementation details will be defined in the Tech Specs of each PRD. The stack below
> reflects the current bolsa-trabajo (Joby) baseline — adjust only if the project genuinely differs.

| Layer | Technology |
|--------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript, shadcn/ui + Radix + Tailwind v4 |
| Backend | Server Actions (`src/actions/*`) + Route Handlers (`src/app/api/**/route.ts`) |
| Database | PostgreSQL via Prisma 6 (singleton `@/lib/prisma`) |
| Authentication | Cookie session (`jose` + `bcryptjs`), `getSession()` in `@/lib/session` |
| Deploy | Vercel (main = production, every PR = Preview) |

---

## 5. Non-Functional Requirements

[List non-functional requirements that apply to the project as a whole:

| ID | Requirement |
|----|-----------|
| NFR-01 | |
| NFR-02 | |]

---

## 6. Assumptions

[List the assumptions made for the project:

1. ...
2. ...
3. ...]

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|-------|---------|-----------|
| | | |

---

## 8. Project PRDs

Each PRD below represents a functional deliverable of the project. The suggested order is by implementation (dependencies first).

> **PRD naming:** `<slug>-<NNN>-prd-<kebab-name>` — `<slug>` is a short kebab-case project/epic
> slug (e.g. `postulaciones`, `perfil-cv`), `<NNN>` is zero-padded and sequential in implementation
> order. When the PRDs derive from an enabler/task breakdown, reuse each task's number (task `13` →
> `<slug>-013-prd-…`) so PRDs and tasks trace 1:1.

| # | PRD | Description | Dependencies | Status |
|---|-----|-----------|--------------|--------|
| 1 | `<slug>-001-prd-[name]` | [Brief description of the PRD scope] | - | [ ] Pending |
| 2 | `<slug>-002-prd-[name]` | [Brief description of the PRD scope] | PRD 1 | [ ] Pending |
| 3 | `<slug>-003-prd-[name]` | [Brief description of the PRD scope] | PRD 1 | [ ] Pending |
| 4 | `<slug>-004-prd-[name]` | [Brief description of the PRD scope] | PRD 2, 3 | [ ] Pending |

### Commands to create each PRD

```
/create-prd <slug>-001-prd-[name] [description of PRD 1]

/create-prd <slug>-002-prd-[name] [description of PRD 2]

/create-prd <slug>-003-prd-[name] [description of PRD 3]
...
```

---

## 9. Schedule and Effort Estimate

| Phase | PRD(s) | Estimated Hours |
|------|--------|-----------------|
| 1. [Phase name] | PRD 1 | [X]h |
| 2. [Phase name] | PRD 2 | [X]h |
| 3. [Phase name] | PRD 3 | [X]h |
| **Total** | | **[X]h** |

---

## 10. Revision History

| Date | Version | Description |
|------|--------|-----------|
| | 1.0 | Initial version |

You are a Quality Assurance expert. Your task is to analyze the PRD and generate a complete document of test scenarios covering ALL functional requirements, edge cases, integration flows, and visual/accessibility checks.

<critical>READ THE ENTIRE PRD before generating any scenario</critical>
<critical>Each functional requirement (RF-XX) MUST have at least one test scenario</critical>
<critical>Edge cases and negative flows are MANDATORY</critical>
<critical>The document must be self-contained — an external QA should be able to run all tests without reading the PRD</critical>

## Input

The user provides the path to the PRD folder. Example:
```
/create-qa-test-cases tasks/prd-feature-name
```

## Expected Files

- PRD: `{folder}/prd.md`
- Tech Spec (optional): `{folder}/techspec.md`
- Tasks (optional): `{folder}/tasks.md`

## Process

### 1. PRD Analysis (Mandatory)

1. Read the entire PRD in `{folder}/prd.md`
2. If it exists, read the TechSpec in `{folder}/techspec.md` for technical context
3. **Understand the available test accounts.** Joby's seed (`prisma/seed.ts`, run with `npx prisma db seed`) creates the baseline accounts — one **ESTUDIANTE**, one **EMPRESA**, and one **ADMIN** — plus sample vacantes, postulaciones, and perfiles. Reference these accounts by role; **never** hardcode or commit real credentials. Joby is **not** multi-tenant, so isolation is enforced by **role + resource ownership** (e.g. an `EMPRESA` only sees its own vacantes/postulaciones), validated server-side via `getSession()` (see `auth.md`).
4. **MANDATORY: Verify that the seed populates the tables the module under test reads** (e.g. `vacante`, `postulacion`, `perfil`, `empresa`, `usuario`, `aIUsageLog` as relevant). The scenarios must use data that exists in the seed. If the seed does NOT generate data for the module's tables, **explicitly flag in the document that the seed MUST be updated BEFORE running the QA** — list which tables are missing and what kind of realistic data should be added.
5. Extract ALL functional requirements (RF-XX)
6. Identify all user stories
7. Identify mentioned edge cases
8. Identify dependencies between features

### 2. Test Scenario Generation (Mandatory)

For each main feature (F1, F2, etc.) of the PRD, generate scenarios organized into categories:

#### Scenario Categories

1. **Smoke Tests** — Basic checks that the feature exists and loads
2. **Functional Tests** — Tests of the main flows (happy path) mapped 1:1 to the RF-XX
3. **Negative Tests** — Invalid inputs, empty required fields, denied permissions (wrong role)
4. **Edge Cases** — Edge scenarios: limits, duplicate data, concurrency, extreme values, expired OTP
5. **Integration Tests** — Flows that cross multiple features (e.g. empresa publica una vacante + estudiante se postula + empresa ve la postulación)
6. **Async / Email / AI Tests** — Where applicable: OTP email delivery, AI CV generation/import latency and error paths, `revalidatePath` refresh after a write
7. **Visual/UI Tests** — Layout, responsiveness, empty states, loading, error
8. **Accessibility Tests** — Keyboard navigation, labels, contrast, screen reader

#### Format of Each Scenario

Each scenario must follow this format:

```markdown
#### TC-XXX: [Descriptive scenario title]

- **Feature:** F1 — Registro + verificación OTP
- **Requirement:** RF-01
- **Type:** Functional | Negative | Edge Case | Smoke | Integration | Visual | Accessibility
- **Priority:** High | Medium | Low
- **Role:** ESTUDIANTE | EMPRESA | ADMIN | (anónimo)
- **Preconditions:** [What needs to be set up before the test]
- **Steps:**
  1. [Detailed step with concrete test data]
  2. [Next step]
  3. [...]
- **Expected Result:** [What should happen — be specific]
- **Test Data:** [Concrete data: names, emails, values]
```

### 3. Traceability Matrix (Mandatory)

Generate a table mapping each RF-XX to its test scenarios:

```markdown
## Traceability Matrix

| Requirement | Scenarios | Coverage |
|-------------|-----------|----------|
| RF-01 | TC-001, TC-002, TC-003 | Functional, Negative, Edge |
| RF-02 | TC-004, TC-005 | Functional, Visual |
```

### 4. Pre-QA Checklist (Mandatory)

Include a section of automated checks that must pass BEFORE the manual tests:

```markdown
## Pre-QA Checklist

- [ ] Seed executed (`npx prisma db seed`) — ESTUDIANTE / EMPRESA / ADMIN accounts + sample data available
- [ ] `npm run build` passes (type-check + compilation gate)
- [ ] `npm run lint` — 0 errors
- [ ] Application starts without errors (`npm run dev`, port 3000)
- [ ] Browser console without errors/warnings
- [ ] (Recommended) automated tests pass — Vitest units + Playwright e2e where present (see `.claude/docs/rules/tests.md`; there is no hard coverage gate yet)
```

### 5. Test Data (Mandatory)

<critical>USE THE SEEDED ACCOUNTS AS THE BASIS FOR ALL SCENARIOS. Each scenario must specify WHICH ROLE to log in with. Test the same feature with different roles to cover permission and ownership enforcement. NEVER hardcode or commit real credentials.</critical>

Include a section with concrete datasets for use in the tests. **Reference the seeded accounts by role** (their exact email/password come from the seed script / env — do not paste real secrets):

```markdown
## Test Data

> Accounts are created by the seed (`prisma/seed.ts`). Run `npx prisma db seed` before starting the tests. Log in with the account for the role each scenario targets; do not commit real credentials.

### Test Accounts by Role

| Role | Account (from seed) | Expected access |
|------|---------------------|-----------------|
| ESTUDIANTE | cuenta estudiante del seed | Ver vacantes, postularse, editar su perfil/CV; sin acceso al panel de empresa ni de admin |
| EMPRESA | cuenta empresa del seed | Publicar/editar SUS vacantes, ver las postulaciones a SUS vacantes; no ve datos de otras empresas; sin acceso a admin |
| ADMIN | cuenta admin del seed | Gestión de empresas y usuarios; acceso a los paneles administrativos |

### Invalid Data (for negative tests)
| Scenario | Field | Value |
|----------|-------|-------|
| Correo inválido | email | correo-invalido |
| Contraseña muy corta | password | 123 |
| Campo requerido vacío | nombre | (vacío) |
| OTP incorrecto | codigo | 000000 |
| OTP expirado | codigo | (código vencido) |
```

**For each feature tested, generate scenarios with MULTIPLE ROLES:**
- **Positive scenario:** Log in with a role that HAS permission (e.g. una EMPRESA publica una vacante)
- **Negative permission scenario:** Log in with a role that does NOT have permission (e.g. un ESTUDIANTE intenta abrir el panel de empresa → redirección / 403)
- **Ownership isolation scenario:** Log in as one EMPRESA and verify it cannot see or edit another EMPRESA's vacantes/postulaciones

### 6. Save Document (Mandatory)

Save the document to: `{folder}/qa-test-cases.md`

### 7. Report Result

Display:
- Total scenarios generated
- Distribution by type (Functional, Negative, Edge, etc.)
- Distribution by priority
- Coverage: how many RF-XX have mapped scenarios vs total RF-XX

## Document Template

```markdown
# QA Test Cases — [Feature Name]

> Generated from the PRD: `{folder}/prd.md`
> Total scenarios: [N]
> Requirements covered: [X]/[Y] (100%)

## Pre-QA Checklist

- [ ] Seed executed (`npx prisma db seed`) — ESTUDIANTE / EMPRESA / ADMIN accounts available
- [ ] `npm run build` passes (type-check + compilation)
- [ ] `npm run lint` — 0 errors
- [ ] Application starts without errors (`npm run dev`, port 3000)
- [ ] Console without errors/warnings

## Test Data

[concrete datasets — seeded accounts by role + invalid data]

---

## F1 — [Feature Name]

### Smoke Tests

#### TC-001: [title]
[complete scenario]

### Functional Tests

#### TC-002: [title]
[complete scenario]

### Negative Tests

#### TC-010: [title]
[complete scenario]

### Edge Cases

#### TC-020: [title]
[complete scenario]

---

## F2 — [Feature Name]

[same structure]

---

## Integration Tests

[scenarios that cross features]

## Visual/UI Tests

[layout and responsiveness checks]

## Accessibility Tests

[keyboard navigation, labels, contrast]

---

## Traceability Matrix

| Requirement | Scenarios | Types Covered |
|-------------|-----------|---------------|
| RF-01 | TC-001, TC-002, TC-010, TC-020 | Smoke, Functional, Negative, Edge |

## Summary

| Type | Count |
|------|-------|
| Smoke | [N] |
| Functional | [N] |
| Negative | [N] |
| Edge Case | [N] |
| Integration | [N] |
| Async/Email/AI | [N] |
| Visual/UI | [N] |
| Accessibility | [N] |
| **Total** | **[N]** |
```

> **Typical Joby modules to cover:** registro + verificación OTP, login/logout, publicar/editar vacante (EMPRESA), postularse a una vacante (ESTUDIANTE), CV (crear / importar / optimizar con IA), perfil público del estudiante, gestión de empresas (ADMIN).

## Principles

- **Specificity**: each scenario must have concrete data, never "enter a valid value"
- **Self-contained**: the QA should be able to run it without consulting the PRD
- **Traceable**: every scenario maps to an RF-XX
- **Complete**: happy path + sad path + edge cases for each requirement
- **Role-aware**: every feature is tested from the roles that can and cannot reach it, plus ownership isolation
- **Prioritizable**: prioritized scenarios allow partial QA when needed
- **Reproducible**: steps detailed enough for anyone to reproduce

## Quality Checklist

- [ ] PRD read completely
- [ ] All RF-XX have at least 1 scenario
- [ ] Negative scenarios for each user input
- [ ] Permission + ownership scenarios per role (ESTUDIANTE / EMPRESA / ADMIN)
- [ ] Edge cases documented
- [ ] Concrete test data included (seeded accounts by role, no committed credentials)
- [ ] Traceability matrix complete
- [ ] Document saved to `{folder}/qa-test-cases.md`

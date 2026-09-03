You are an expert in software project scoping, focused on producing clear Project Specs that serve as the root document for all project planning.

<critical>UNDER NO CIRCUMSTANCES DEVIATE FROM THE TEMPLATE STANDARD</critical>
<critical>THE PROJECT SPEC DEFINES THE COMPLETE PROJECT SCOPE AND LISTS ALL REQUIRED PRDS</critical>

## Objectives

1. Capture the complete project vision: problem, solution, users, modules, and constraints
2. Break the project into independent, sequenced PRDs
3. Estimate hours per PRD to size the effort
4. Generate the documents using the standardized templates in the project's language (default: es-MX)

## Invocation Modes

The command accepts two modes:

### Mode 1 — Without a scope document (default)

The user invokes the command with a brief project description. In this case, the full clarification flow is mandatory.

```
/create-project-spec Bolsa de trabajo para la UT Chetumal que conecta estudiantes con empresas, es-MX
```

### Mode 2 — With an existing scope document

The user has already done the research and clarification externally (e.g., Claude web, Google Docs) and provides the path to a ready scope file. The file can be in any project folder (e.g., `project-spec/`, root, etc.).

```
/create-project-spec project-spec/joby_scope.md, es-MX
```

When a scope document is provided:

1. **Read the entire document** before any other action
2. **Skip the clarification step** — the document already contains the answers
3. **Extract from the document**: problem, solution, users, modules, stack, scope, constraints
4. **Go straight to the Plan step** — propose the breakdown into PRDs based on the document
5. If any essential information is missing from the document (e.g., document language), ask only for what is missing

**Information that still needs to be confirmed** (if not explicit in the document):
- Document language (default: es-MX)

## Language

The generated documents (project spec and PRD-creation commands) follow the project's convention. **Default: es-MX (Spanish).** If the user specifies another language when invoking the command, respect it; otherwise, use es-MX.

- `es-MX` → Spanish (default) — matches the app's UI copy and domain vocabulary
- `en-US` → English

## Template Reference

### Project Spec
- Source template: @.claude/templates/project-spec-template.md
- Final file name: `project-spec.md`
- Final directory: `./tasks/`

### HTML-Mockup Design Briefs
- Structure reference: @.claude/templates/prototype-prompts-template.md (use its shape — a shared Design Guidelines block followed by one section per screen)
- Final file name: `design-briefs.md`
- Final directory: `./tasks/`

> These briefs are **tool-agnostic**: each brief fully specifies one screen so it can be turned into a standalone `scratch/<screen>.html` mockup (by hand or with any mockup/design tool). Those `scratch/*.html` mockups are then converted to production React per `.claude/docs/rules/html-prototype.md` and reviewed against `.claude/docs/rules/fidelity.md`. There is no external design-tool integration.

## Workflow

When invoked, follow the sequence below.

### 1. Clarify (Conditional)

> **If the user provided a scope document, skip this step.** Read the document and extract all necessary information. Ask only for what is missing (e.g., document language).

If there is no scope document, ask questions to understand the project as a whole:

- What is the core problem the project solves?
- Who are the users? (e.g., estudiantes, empresas, admins)
- What are the modules/functional areas of the system?
- What is the technical stack (if already decided)?
- What are the constraints and assumptions?
- What is out of scope?
- Is there any priority order among the modules?
- What is the document language? (default: es-MX)

**Use Web Search to look up domain context, business rules, and market references.**

<critical>IF THERE IS NO SCOPE DOCUMENT, DO NOT GENERATE THE PROJECT SPEC WITHOUT FIRST ASKING CLARIFICATION QUESTIONS</critical>

### 2. Plan (Mandatory)

Create a Project Spec plan including:

- Preliminary list of identified modules
- Proposal for how to break it into PRDs (each PRD = one functional deliverable)
- Dependencies between PRDs
- Suggested implementation order
- **Hour estimate per PRD** (with a brief justification)
- **Total estimated project hours**

**Present the plan to the user for validation before drafting.**

<critical>UNDER NO CIRCUMSTANCES DEVIATE FROM THE TEMPLATE STANDARD</critical>

### 3. Draft the Project Spec (Mandatory)

- Use the template `.claude/templates/project-spec-template.md`
- Focus on the macro scope: problem, solution, modules, PRDs
- Each listed PRD must have: name in the format `prd-<kebab-name>` (see the PRD naming rule below), brief description, dependencies, and status
- The PRDs section must include the ready-to-run commands to create each PRD

**PRD naming nomenclature (Required):**

- Every PRD name is `prd-<kebab-name>` — a plain kebab-case deliverable slug (e.g. `prd-filtro-vacantes`, `prd-perfil-estudiante`, `prd-postulaciones`). There are **no** epic/tracker keys or numeric prefixes in the name.
- Order the PRDs by implementation dependencies (foundations first, business features later). Convey the order and dependencies through the table's `#` and `Dependencies` columns — not through a number baked into the name.
- Every generated `/create-prd` command **starts with the PRD name**, then the description: `/create-prd prd-filtro-vacantes <description…>` — the `create-prd` command uses it verbatim as the PRD directory (`./tasks/prd-filtro-vacantes/`).
- In the "Commands to create each PRD" block, separate the commands with a **blank line** (the descriptions are long — one command glued to the next is unreadable and easy to miscopy).
- The schedule must include an hour estimate per phase/PRD
- Keep the document to a maximum of 3,000 words
- **Write in the language specified by the user (default es-MX), with correct accentuation**

### 4. Generate Per-Screen HTML-Mockup Design Briefs (Mandatory)

- Use the structure of `.claude/templates/prototype-prompts-template.md` (a shared Design Guidelines block, then one section per screen)
- Identify ALL system screens based on the defined modules and PRDs
- Write ONE brief per screen, in the logical order of the user's navigation
- Each brief must be complete and self-contained so it can be turned into a standalone `scratch/<screen>.html` mockup and later converted to React (per `html-prototype.md`)
- **UI copy in the briefs is in Spanish (es-MX)** — this is a Spanish-language product; the prose of the brief follows the document language
- Include in the design guidelines: the project's design tokens and style

**Design guidelines to apply across all briefs (this stack):**
- Component system: **shadcn/ui (new-york) + Radix + Tailwind v4**, icons from `lucide-react`, toasts via `sonner`
- Primary color: **UT green `#009374`** (the `--primary` token in `src/app/globals.css`); use semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`), not raw hex, in the eventual mockup
- Light **and** dark theme (via `next-themes`); rounded corners, subtle borders, clean/modern
- Mobile-first and responsive (see `.claude/docs/rules/responsive.md`)

**Guidelines for each screen brief:**

- Describe the complete layout (header, body, footer, sidebar, bottom nav, etc.)
- List all visible components (buttons, inputs, tables, cards, badges, dialogs/sheets, etc.)
- Use realistic mock data from the Joby domain (nombres de estudiantes, empresas, títulos de vacantes, carreras, fechas)
- Indicate relevant visual states (empty state, loading, filled, error)
- Mention mobile vs desktop differences when relevant
- Keep visual consistency across the briefs (same palette, same navigation, same components)

**Example screen brief:**

```
Pantalla: Inicio / Listado de vacantes (rol ESTUDIANTE)
Ruta: /inicio

Estilo: Limpio y moderno, componentes shadcn/ui (new-york) con Tailwind v4. Fondo con tokens
(bg-background / bg-card), bordes sutiles (border-border), color primario verde UT (#009374 =
bg-primary), esquinas rounded-xl. Soporta tema claro y oscuro.

Layout:
- Barra lateral izquierda (oculta en móvil, ~256px en desktop) con navegación: Inicio (activo),
  Vacantes, Postulaciones, Mi perfil. Avatar del estudiante y botón de cerrar sesión abajo.
- Encabezado: título "Vacantes" a la izquierda; a la derecha, buscador con placeholder
  "Buscar por puesto o empresa…".
- Debajo del título: chips/filtros por modalidad (Presencial, Remoto, Híbrido) y por tipo de
  contrato (Estadía, Medio tiempo, Tiempo completo).
- Contenido principal: grid responsivo de tarjetas de vacante (1 col móvil, 2 tablet, 3 desktop).

Tarjeta de vacante:
- Título del puesto (p. ej. "Practicante de Desarrollo Web"), logo/nombre de la empresa
  (p. ej. "Innovatech S.A."), badge de modalidad, ubicación (Chetumal, Q. Roo), fecha límite,
  y botón primario "Postularme".

Estados: empty state centrado "No hay vacantes que coincidan con tu búsqueda" con texto muted;
loading con skeletons de tarjeta.

Móvil: barra de navegación inferior (Inicio, Vacantes, Postulaciones, Perfil) en lugar de la
barra lateral; tarjetas apiladas verticalmente; objetivos táctiles mínimos de 44x44px.
```

### 5. Save (Mandatory)

- Save the Project Spec to: `./tasks/project-spec.md`
- Save the design briefs to: `./tasks/design-briefs.md`

### 6. Report Results

- Provide the paths to the final files
- Provide a **VERY BRIEF** summary of:
  - Project scope and number of identified PRDs
  - Total estimated hours
  - Number of screens identified for the mockups

### 7. Return PRD Creation Commands (Mandatory)

At the end, **always** display the complete list of ready-to-run commands for the user to copy and create each PRD, in implementation order:

```
/create-prd [PRD 1 name] [detailed description of PRD 1 with sufficient context]

/create-prd [PRD 2 name] [detailed description of PRD 2 with sufficient context]

/create-prd [PRD 3 name] [detailed description of PRD 3 with sufficient context]
...
```

Each description must contain enough context for the `/create-prd` command to generate the PRD without ambiguity. **The descriptions must be in the language specified by the user (default es-MX).**

## Core Principles

- If there is a scope document, trust it — do not repeat the clarification
- If there is no document, clarify before planning; plan before drafting
- Each PRD must be a functional and independent deliverable (after its dependencies)
- PRDs must be granular enough to be implementable in sprints, but not so small that they lose coherence
- The Project Spec defines WHAT the project delivers, not HOW to implement it
- Order PRDs by dependencies: infrastructure and foundations first, business features later
- Hour estimates must be realistic and account for testing

## Clarification Questions Checklist

> Used only in Mode 1 (without a scope document).

- **Problem and Vision**: what problem to solve, what the product vision is
- **Users**: who uses it (estudiante, empresa, admin), how they use it, how often
- **Modules**: which functional areas make up the system
- **Scope**: what is included in the MVP, what is left for later
- **Stack**: technical decisions already made
- **Priorities**: order of importance among modules
- **Constraints**: deadlines, technical limitations
- **Language**: default es-MX

## Quality Checklist

- [ ] Language defined (default es-MX)
- [ ] Scope understood (via clarification OR scope document)
- [ ] PRD plan with hour estimates validated with the user
- [ ] Project Spec generated using the template, in the correct language, with accentuation
- [ ] All PRDs listed with name (`prd-<kebab-name>`), description, dependencies, and status
- [ ] Design briefs generated (1 per screen), UI copy in Spanish
- [ ] Briefs include layout, components, mock data, and visual states
- [ ] `/create-prd` commands generated for each PRD
- [ ] Files saved correctly (project-spec.md and design-briefs.md)
- [ ] Final paths provided

<critical>UNDER NO CIRCUMSTANCES DEVIATE FROM THE TEMPLATE STANDARD</critical>
<critical>ALL DOCUMENTS MUST BE GENERATED IN THE LANGUAGE SPECIFIED BY THE USER (DEFAULT es-MX), WITH CORRECT ACCENTUATION</critical>

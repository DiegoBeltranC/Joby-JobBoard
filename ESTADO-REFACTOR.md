# Estado del refactor — Joby (bolsa-trabajo)

> Documento de traspaso / contexto. Resume **qué se hizo**, **qué falta** y el **estado de
> sincronización con `origin`**. Pensado para retomar el trabajo desde otra laptop tras un
> `git clone` limpio. Última actualización: **2026-09-02**.

---

## 0. TL;DR (para cambio de laptop)

- Todo el código local está respaldado en `origin` (GitLab **y** GitHub — `origin` empuja a ambos).
- La rama de trabajo actual es **`refactor/fase-2-form-configuracion`**, ya **pusheada**.
- En una laptop nueva basta con:
  ```bash
  git clone git@gitlab.com:DiegoBeltranC/bolsa-trabajo.git
  cd bolsa-trabajo
  git checkout refactor/fase-2-form-configuracion   # rama de trabajo en curso
  npm install
  npx prisma generate                                # cliente en src/generated/prisma (gitignoreado)
  cp .env.example .env  # (o recuperar tus .env; están gitignoreados, NO viajan en el repo)
  ```
- ⚠️ Lo que **NO** viaja en el repo (recuperar aparte): archivos `.env*`, `.claude/settings.local.json`
  (solo era un allowlist de permisos, se regenera solo), `src/generated/prisma` (se regenera con
  `npx prisma generate`), `node_modules`.

---

## 1. Contexto del proyecto

**Joby** es una bolsa de trabajo para **UT Chetumal** (Next.js 16 App Router + React 19 + Server
Actions + Prisma/PostgreSQL + shadcn/Radix + react-hook-form + zod + sesión JWT con `jose`). En
producción en Vercel.

- `main` → **auto-despliega a producción** en Vercel. Cada otra rama/PR = **Preview**.
- Flujo de ramas adoptado: **feature → PR a `develop` → (release) `develop` → `main` (prod)**.
  Se adoptó `develop` como rama de integración para **no** auto-desplegar cada refactor a prod.
- Push doble: `origin` apunta a GitLab (`DiegoBeltranC/bolsa-trabajo`, fetch+push) **y** GitHub
  (`DiegoBeltranC/Joby-JobBoard`, solo push). Un `git push origin` va a los dos.

**Meta del refactor:** limpiar/rearquitecturar código heredado (duplicado, God files, 0 tests).
Decisión (27-jul-2026): **"auditoría primero"**, no rearquitectura de un tiro (app en prod, sin red
de seguridad de tests). Enfoque: **rules-first + gates**, ramas cortas + Preview Vercel, test de
caracterización **antes** de cada refactor, `lint` + `build`, commits `refactor()`.

---

## 2. Plan por fases y progreso

| Fase | Objetivo | Estado |
|------|----------|--------|
| **F0 — Fundaciones** | Vitest + coverage + alias `@/`, tests de caracterización, unificar carpeta de actions, borrar código muerto | ✅ **Completa** — en `main`/prod |
| **F1 — Dedup** | Consolidar duplicación segura (URLs de vacante, selector estado/municipio, split habilidades/idiomas) | ✅ **Completa** — en `main`/prod |
| **F2 — God files** | Descomponer archivos gigantes por módulo (perfil → vacantes → CV al final) | 🔄 **En curso** |

### Fase 0 — Fundaciones ✅
- Vitest + coverage + alias, tests de caracterización (hash, `toTitleCase`, fechas/estatus de vacante, perfil).
- Se unificó `updateOpcionesCompartir` en `src/actions/perfil.ts` y se **borró la carpeta duplicada
  `src/app/actions`**.
- Se eliminó `src/actions/validacionesRegistro.ts` (**código muerto** confirmado).
- Resultado: 55 tests verdes, `tsc` 0. **Ya está fusionada en `main` (producción).**

### Fase 1 — Dedup ✅
- `src/lib/vacanteUrls.ts` — centraliza URLs públicas de vacante (`urlCortaVacante`,
  `urlPerfilPublicoVacante`); migra 5 llamadores. **Decisión:** los 2 modales de detalle de vacante
  **no** se fusionan (vistas distintas pública/estudiante vs gestión empresa); el dedup real fue la URL.
- `src/lib/ubicacionesMexico.ts` + componente `SelectorEstadoMunicipio` — migra `FormPaso1` y
  `FormPaso1Empresa`. **Decisión:** los `FormPaso*` **no** se fusionan (wizards distintos).
- `src/lib/habilidadesVacante.ts` — `separarHabilidadesEIdiomas` (split por `" - "`), dedup en
  `DetalleVacanteModal` y `FormularioVacante`.
- Deuda técnica registrada en `TECH_DEBT.md`: **TD-INFRA-01** (dos `hash.ts` XOR vs Sqids — ver §5)
  y **TD-INFRA-02** (host hardcodeado en QR de vacante).
- Tooling de tests de componente instalado: jsdom + Testing Library + user-event + jest-dom +
  `vitest.setup.ts` con polyfills para Radix/cmdk. Resultado: ~72 tests, `tsc` 0. **Ya está en `main`.**

### Fase 2 — God files 🔄 (en curso)
Orden global: **perfil → vacantes → trío CV al final**
(`MagicCVBuilder` 1220, `PlantillaCV` 990, `ImportarCVModal` 852 se dejan para el final).

- ✅ **God file #1 — `FormularioVacante.tsx` (799 → 455, −43%)** — rama
  `refactor/fase-2-formulario-vacante`, **ya en `main`/prod**. Extrajo `SelectorEstadoMunicipio`
  (compartido), `SelectorHabilidades`, `SelectorIdiomas` (en `components/empresa`) + `lib/vacanteForm.ts`
  (schema zod, `parseSueldo`, `formatFecha`). Todo testeado.

- 🔄 **God file #2 — `FormConfiguracion.tsx` (887 → 395, −55%)** — **rama actual
  `refactor/fase-2-form-configuracion`** (ver §3). **Trabajo terminado en la práctica**, pendiente
  solo de PR/merge.

---

## 3. Lo hecho en ESTA rama (`refactor/fase-2-form-configuracion`)

Base: `develop == main == 6e77259`. Objetivo: descomponer `FormConfiguracion.tsx` (config del
estudiante, acordeón de 4 secciones: datos personales/academia · seguridad-password · smartwatch ·
suspensión). **887 → 395 líneas (−55%).**

| # | Commit | Qué hace |
|---|--------|----------|
| 1 | `d8dea55` | Extrae **lógica pura** a `src/lib/configuracionEstudiante.ts` (cooldown de cambio de nombre 30 días, `validarDatosPersonales`, `validarPassword`) + 11 tests. |
| 2 | `9c4ab88` | Extrae **`SeccionSmartwatch.tsx`** (+ test jsdom). |
| 3 | `d561712` | Extrae **`SeccionSeguridad.tsx`** (password; solo UI, server action **no** tocada) (+ test jsdom). |
| 4 | `61857e5` | Extrae **`SeccionSuspension.tsx`** (Ajustes + 3 modales: suspensión/despedida/desactivación; actions `suspenderCuentaEstudiante`/`logoutAction` **no** tocadas) con su propio `loading` (+ test jsdom). |

Patrón: sub-componentes de sección **controlados** — el padre pasa `isOpen`/`onToggle` (acordeón) y
conserva lo necesario para submit/validación; el estado interno vive en cada sección; server actions
**mockeadas** en los tests. Los 4 nuevos componentes de sección quedan **co-locados** en
`src/app/(dashboard)/configuracion/`.

**Estado al último commit de refactor:** ~110 tests, `tsc` 0 *(según el registro de la sesión de
trabajo; conviene re-correr `npm test` + `npx tsc --noEmit` tras el clone).*

Además, en esta sesión (2026-09-02) se añadió un commit de **tooling/documentación** (`ae35e9b`, ver §4).

### Lo que queda de este God file (opcional)
- Sigue **inline** en `FormConfiguracion.tsx` la sección **"Datos Personales y Academia"** (perfil) +
  el modal de carrera. Con 395 líneas el archivo ya es manejable; extraerla sería un **chunk 5 opcional**.
- **Falta abrir el PR/MR** de esta rama hacia `develop` y mergear.

---

## 4. Sincronización con `origin` hecha en esta sesión (2026-09-02)

Objetivo pedido: dejar **todas las ramas de bolsa-trabajo al 100 % con `origin`** (GitLab + GitHub)
antes de cambiar de laptop, sin perder nada local.

1. **Nuevo commit de tooling** `ae35e9b` en `refactor/fase-2-form-configuracion`
   (`chore(tooling): versiona config de Claude Code, CLAUDE.md y diagramas`):
   - Se versiona `.claude/` (reglas por área en `docs/rules/`, comandos de workflow, hook
     `inject-rules.sh`, templates, agente `task-reviewer`).
   - Se versiona `CLAUDE.md` (guía del proyecto).
   - Se versionan los diagramas de dominio `scratch/*.html` (actores, flujo, modelo de negocio).
   - Se añade `.claude/settings.local.json` al `.gitignore` (config local de máquina, sin secretos).
2. **Push** de `refactor/fase-2-form-configuracion` a `origin` (GitLab + GitHub) con upstream.

### Inventario de ramas y estado vs `origin`

| Rama | Estado | Acción |
|------|--------|--------|
| `refactor/fase-2-form-configuracion` | trabajo en curso (5 commits sobre `main`) | ✅ **pusheada** en esta sesión |
| `develop` | == `origin/develop` == `main` (`6e77259`) | ✅ ya sincronizada |
| `refactor/fase-0-fundaciones` | == `origin` | ✅ ya sincronizada (fusionada en `main`) |
| `refactor/fase-2-formulario-vacante` | == `origin` | ✅ ya sincronizada (fusionada en `main`) |
| `refactor/fase-1-dedup` | **fusionada** en `origin/main`; su rama remota fue auto-borrada al mergear el MR | ✅ contenida en `main` (nada que perder); rama local queda como referencia |
| `main` (local) | detrás de `origin/main` (origin tiene más); vive en worktree aparte `/home/diego/orca/workspaces/bolsa-trabajo/main` | Sin acción: un clone nuevo la trae correcta. Opcional: `git merge --ff-only origin/main` en ese worktree |

---

## 5. Pendientes / próximos pasos

**Inmediatos**
- [ ] Abrir **PR/MR de `refactor/fase-2-form-configuracion` → `develop`** y mergear.
      *(Nota histórica: los PRs se abrían a mano por web porque no hay `glab` y el `gh` autenticado
      no tiene permiso para crear PRs en `DiegoBeltranC/Joby-JobBoard`.)*
- [ ] Igual quedaron sin abrir los PRs de **F0** y **F1** (aunque su código ya está en `main` por
      merges previos vía web).

**Fase 2 — siguientes God files** (orden: perfil → vacantes → CV)
- [ ] `src/actions/perfil.ts` (monolítico, ~623 líneas, 17 funciones).
- [ ] (opcional) chunk 5 de `FormConfiguracion`: extraer sección "Datos Personales y Academia".
- [ ] Trío CV **al final**: `MagicCVBuilder.tsx` (1220), `PlantillaCV.tsx` (990),
      `ImportarCVModal.tsx` (852). Al descomponer, reusar componentes ya extraídos.

**Deuda técnica registrada** (`TECH_DEBT.md`)
- [ ] **TD-INFRA-01** — dos `hash.ts` (`src/lib/hash.ts` XOR/base36 vs `src/lib/utils/hash.ts` Sqids),
      mismas exports pero algoritmos **incompatibles**. **Ambos en uso activo, en clusters distintos,
      cada uno internamente consistente (no hay bug latente).** Consolidar es **migración riesgosa**
      (rompería QR impresos y URLs ya compartidas) → **diferido**, no es dedup drop-in.
- [ ] **TD-INFRA-02** — host hardcodeado en el QR de vacante (`VacanteSlideQR`); construir URL desde
      `NEXT_PUBLIC_APP_URL` / `VERCEL_*`.

**Alinear documentación**
- [ ] `.claude/docs/rules/git.md` todavía dice *"no long-lived develop"*, pero el flujo real adoptado
      **sí** usa `develop` como rama de integración (feature → PR a `develop` → release a `main`).
      Actualizar la regla para reflejar el flujo real.

---

## 6. Notas operativas

- `npx prisma generate` es **obligatorio** tras cada `pull`/clone (cliente generado en
  `src/generated/prisma`, gitignoreado).
- `next build` corre ESLint y arrastra **~191 errores de lint pre-existentes** (heredados, no del
  refactor). No bloquear por ellos, pero tenerlos en cuenta.
- Trabajo dirigido por reglas: el hook `.claude/hooks/inject-rules.sh` (PreToolUse) auto-inyecta la
  regla de `.claude/docs/rules/` correspondiente al archivo que se edita.
- **NO** usar el pipeline de features (`/create-prd`, `create-techspec`, etc.) para este refactor;
  son para features nuevas. Aquí: refactor manual + gates (`execute-review`/`execute-qa`/
  `execute-security`/`simplify`), PR por fase.
- Al mergear un MR en GitLab, la rama fuente se **auto-borra**; por eso algunas ramas remotas de fase
  aparecen como "desaparecidas" en local aunque su código ya esté en `main`.

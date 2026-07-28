# Tech Debt — bolsa-trabajo (Joby)

> Priority legend: 🔴 High · 🟡 Medium · 🟢 Low.
> ID scheme: `TD-<AREA>-<NN>`. Areas: auth, vacantes, perfil, empresa, postulaciones, cv, admin, ui, infra.

## Open

- [ ] **TD-INFRA-01** 🟡 Consolidar los dos esquemas de ofuscación de IDs en una sola utilidad.
      Context: coexisten `src/lib/hash.ts` (XOR+base36) y `src/lib/utils/hash.ts` (Sqids); ambos
      exportan `encodeId`/`decodeId` con algoritmos incompatibles y están en uso activo en clusters
      distintos. XOR → compartir vacante público (`VacanteSlideQR`, `ModalDetalleVacante`,
      `empresa/DetalleVacanteModal`, `/e/[id]` redirect, `perfil-publico-empresa/[id]`,
      `(dashboard)/inicio`, `VacantesSearchClient`). Sqids → `candidatos/[vacanteHashId]`,
      `perfil-estudiante-snapshot/[id]`, `api/vacantes`, `api/smartwatch/poll`,
      `mis-postulaciones/PostulacionCard`. Cada cluster es internamente consistente (no hay bug),
      pero unificar cambia el algoritmo y rompería QR ya impresos y URLs compartidas → requiere
      migración con decodificación retrocompatible (probar esquema nuevo, caer al viejo), no un
      dedup drop-in. Diferido durante la Fase 1 de rearquitectura.

## Resolved

_Nothing yet._

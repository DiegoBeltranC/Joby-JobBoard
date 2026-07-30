import { encodeId } from "@/lib/hash";

/**
 * Construcción centralizada de las URLs públicas de una vacante.
 *
 * Ambas apuntan al mismo destino (el perfil público de la empresa resaltando la
 * vacante); `urlCortaVacante` usa el redirect corto `/e/[id]`. Los ids van
 * ofuscados con `encodeId` (esquema XOR, ver @/lib/hash). Centralizar aquí evita
 * repetir el patrón en modales, QR y páginas, y facilita la futura migración de
 * hash (TD-INFRA-01).
 *
 * `origin` por defecto "" produce una URL relativa (para `href` en server
 * components); pásalo (p. ej. `window.location.origin`) para una URL absoluta.
 */
// Los ids se aceptan como `number | undefined | null` igual que `encodeId`
// (que devuelve "" para null/undefined), para preservar el comportamiento de
// los llamadores donde el id podría no estar tipado como number estricto.
type IdVacante = number | undefined | null;

export function urlCortaVacante(empresaId: IdVacante, vacanteId: IdVacante, origin = ""): string {
  return `${origin}/e/${encodeId(empresaId)}?vacante=${encodeId(vacanteId)}`;
}

export function urlPerfilPublicoVacante(empresaId: IdVacante, vacanteId: IdVacante, origin = ""): string {
  return `${origin}/perfil-publico-empresa/${encodeId(empresaId)}?vacante=${encodeId(vacanteId)}`;
}

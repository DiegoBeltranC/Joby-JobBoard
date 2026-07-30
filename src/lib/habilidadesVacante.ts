/**
 * Convención del dominio: en una vacante, los idiomas se guardan dentro de
 * `habilidades_req` como cadenas que contienen " - " (p. ej. "Inglés - Avanzado"),
 * mientras que las habilidades técnicas no lo contienen. Este helper separa ambos
 * y fusiona los idiomas embebidos con el arreglo `idiomas_req`.
 */
export function separarHabilidadesEIdiomas(
  habilidadesReq: string[] | null | undefined,
  idiomasReq?: string[] | null,
): { habilidades: string[]; idiomas: string[] } {
  const req = habilidadesReq ?? [];
  return {
    habilidades: req.filter((h) => !h.includes(" - ")),
    idiomas: [...(idiomasReq ?? []), ...req.filter((h) => h.includes(" - "))],
  };
}

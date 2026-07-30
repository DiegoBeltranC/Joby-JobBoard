import mexicoData from "@/lib/data/mexico.json";

// Acceso centralizado al catálogo de estados y municipios de México
// (`mexico.json`), antes duplicado en cada formulario con selector de ubicación.

const ubicaciones = mexicoData as Record<string, string[]>;

/** Lista de estados disponibles (claves del catálogo). */
export const listaEstados = Object.keys(ubicaciones);

/** Municipios de un estado; arreglo vacío si el estado es nulo o desconocido. */
export function getMunicipios(estado: string | null | undefined): string[] {
  if (!estado) return [];
  return ubicaciones[estado] ?? [];
}

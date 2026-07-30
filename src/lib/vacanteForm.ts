import * as z from "zod";
import {
  esFechaCierreVacanteValida,
  getMinimaFechaCierreVacanteString,
} from "@/lib/vacanteFechaLimite";

/** Rango de horario "HH:MM - HH:MM" en formato 24h. */
export const horarioRegex =
  /^([01][0-9]|2[0-3]):[0-5][0-9] - ([01][0-9]|2[0-3]):[0-5][0-9]$/;

/** Alineado con `vacanteSchema` del servidor (mismos límites y mensajes clave). */
export const vacanteFormSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "Máximo 100 caracteres"),
  descripcion: z
    .string()
    .trim()
    .min(20, "La descripción debe ser más detallada (mín. 20 caracteres)"),
  tipo_contrato: z.enum(["ESTADIA", "MEDIO_TIEMPO", "TIEMPO_COMPLETO"], {
    message: "Selecciona un tipo de contrato",
  }),
  modalidad: z.enum(["PRESENCIAL", "HIBRIDO", "REMOTO"], {
    message: "Selecciona una modalidad",
  }),
  estado: z.string().min(2, "Selecciona un estado"),
  municipio: z.string().min(2, "Selecciona un municipio"),
  sueldo_min: z.string().optional(),
  sueldo_max: z.string().optional(),
  fecha_limite: z
    .string()
    .min(1, "Selecciona la fecha de cierre de la vacante")
    .refine(esFechaCierreVacanteValida, {
      message: "La fecha de cierre debe ser como mínimo mañana",
    }),
});

export type VacanteFormValues = z.infer<typeof vacanteFormSchema>;

/** Convierte el texto de un input numérico a número, o null si está vacío/no es finito. */
export function parseSueldo(raw: string | undefined): number | null {
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Formatea una fecha a "YYYY-MM-DD" en hora local. Si la entrada es vacía o
 * inválida, devuelve la fecha mínima permitida (mañana).
 */
export function formatFechaToLocalString(
  fechaInput: Date | string | number | null | undefined,
): string {
  if (!fechaInput) return getMinimaFechaCierreVacanteString();
  const d = new Date(fechaInput);
  if (isNaN(d.getTime())) return getMinimaFechaCierreVacanteString();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

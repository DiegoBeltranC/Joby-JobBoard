import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  parseSueldo,
  formatFechaToLocalString,
  vacanteFormSchema,
} from "./vacanteForm";

describe("parseSueldo", () => {
  it("convierte un texto numérico a número", () => {
    expect(parseSueldo("1500")).toBe(1500);
    expect(parseSueldo("12.5")).toBe(12.5);
    expect(parseSueldo("0")).toBe(0);
  });

  it("devuelve null para vacío, espacios o undefined", () => {
    expect(parseSueldo("")).toBeNull();
    expect(parseSueldo("   ")).toBeNull();
    expect(parseSueldo(undefined)).toBeNull();
  });

  it("devuelve null para un texto no numérico", () => {
    expect(parseSueldo("abc")).toBeNull();
  });
});

describe("formatFechaToLocalString", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formatea un Date local a YYYY-MM-DD", () => {
    expect(formatFechaToLocalString(new Date(2026, 5, 16))).toBe("2026-06-16");
    expect(formatFechaToLocalString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("usa la fecha mínima (mañana) para null/undefined/vacío", () => {
    expect(formatFechaToLocalString(null)).toBe("2026-06-16");
    expect(formatFechaToLocalString(undefined)).toBe("2026-06-16");
    expect(formatFechaToLocalString("")).toBe("2026-06-16");
  });

  it("usa la fecha mínima para una entrada inválida", () => {
    expect(formatFechaToLocalString("no-es-fecha")).toBe("2026-06-16");
  });
});

describe("vacanteFormSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const base = {
    titulo: "Desarrollador Backend Junior",
    descripcion: "Buscamos una persona con ganas de aprender y crecer.",
    tipo_contrato: "MEDIO_TIEMPO",
    modalidad: "REMOTO",
    estado: "Quintana Roo",
    municipio: "Chetumal",
    sueldo_min: "10000",
    sueldo_max: "15000",
    fecha_limite: "2026-06-20",
  };

  it("acepta una vacante válida", () => {
    expect(vacanteFormSchema.safeParse(base).success).toBe(true);
  });

  it("rechaza un título demasiado corto", () => {
    expect(vacanteFormSchema.safeParse({ ...base, titulo: "abc" }).success).toBe(false);
  });

  it("rechaza una fecha de cierre en el pasado", () => {
    expect(vacanteFormSchema.safeParse({ ...base, fecha_limite: "2026-06-10" }).success).toBe(false);
  });
});

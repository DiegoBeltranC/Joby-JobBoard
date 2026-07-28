import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getMinimaFechaCierreVacanteString,
  parseFechaLimiteVacanteToLocalDate,
  esFechaCierreVacanteValida,
} from "./vacanteFechaLimite";

// Caracterización de la validación de fecha de cierre de vacante.
// Depende de "hoy", así que fijamos el reloj a 2026-06-15 12:00 local.

describe("vacanteFechaLimite", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getMinimaFechaCierreVacanteString", () => {
    it("devuelve el día siguiente a hoy en formato YYYY-MM-DD", () => {
      expect(getMinimaFechaCierreVacanteString()).toBe("2026-06-16");
    });
  });

  describe("parseFechaLimiteVacanteToLocalDate", () => {
    it("construye una fecha local a partir de YYYY-MM-DD", () => {
      const d = parseFechaLimiteVacanteToLocalDate("2026-06-16");
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(5); // junio (0-indexado)
      expect(d.getDate()).toBe(16);
    });
  });

  describe("esFechaCierreVacanteValida", () => {
    it("acepta mañana (fecha mínima)", () => {
      expect(esFechaCierreVacanteValida("2026-06-16")).toBe(true);
    });

    it("acepta una fecha futura lejana", () => {
      expect(esFechaCierreVacanteValida("2026-12-31")).toBe(true);
    });

    it("rechaza hoy", () => {
      expect(esFechaCierreVacanteValida("2026-06-15")).toBe(false);
    });

    it("rechaza una fecha pasada", () => {
      expect(esFechaCierreVacanteValida("2026-06-14")).toBe(false);
    });

    it("rechaza cadena vacía", () => {
      expect(esFechaCierreVacanteValida("")).toBe(false);
    });

    it("rechaza un formato inválido", () => {
      expect(esFechaCierreVacanteValida("15/06/2026")).toBe(false);
    });
  });
});

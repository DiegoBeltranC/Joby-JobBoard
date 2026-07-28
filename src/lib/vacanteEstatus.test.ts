import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EstatusVacante } from "@prisma/client";
import {
  fechaLimiteVigente,
  esVisibleParaEstudiantes,
  esEditableCompleta,
  prioridadOrdenEstatus,
  etiquetaEstatusVacante,
  ordenarVacantesPorEstatus,
} from "./vacanteEstatus";

// Caracterización de la lógica de estatus/visibilidad de vacantes.
// Reloj fijo a 2026-06-15 para las comparaciones de fecha límite.

describe("vacanteEstatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("fechaLimiteVigente", () => {
    it("es vigente cuando no hay fecha límite (null)", () => {
      expect(fechaLimiteVigente(null)).toBe(true);
    });

    it("es vigente para una fecha futura", () => {
      expect(fechaLimiteVigente(new Date(2026, 5, 16))).toBe(true);
    });

    it("es vigente para hoy mismo", () => {
      expect(fechaLimiteVigente(new Date(2026, 5, 15))).toBe(true);
    });

    it("no es vigente para una fecha pasada", () => {
      expect(fechaLimiteVigente(new Date(2026, 5, 14))).toBe(false);
    });
  });

  describe("esVisibleParaEstudiantes", () => {
    it("visible: ABIERTA, empresa aprobada y fecha vigente", () => {
      expect(
        esVisibleParaEstudiantes({
          estatus: EstatusVacante.ABIERTA,
          fecha_limite: new Date(2026, 5, 20),
          empresa: { estatus_verificacion: "APROBADA" },
        }),
      ).toBe(true);
    });

    it("no visible: empresa no aprobada", () => {
      expect(
        esVisibleParaEstudiantes({
          estatus: EstatusVacante.ABIERTA,
          fecha_limite: new Date(2026, 5, 20),
          empresa: { estatus_verificacion: "PENDIENTE" },
        }),
      ).toBe(false);
    });

    it("no visible: estatus distinto de ABIERTA", () => {
      expect(
        esVisibleParaEstudiantes({
          estatus: EstatusVacante.PAUSADA,
          fecha_limite: new Date(2026, 5, 20),
          empresa: { estatus_verificacion: "APROBADA" },
        }),
      ).toBe(false);
    });

    it("no visible: fecha límite vencida", () => {
      expect(
        esVisibleParaEstudiantes({
          estatus: EstatusVacante.ABIERTA,
          fecha_limite: new Date(2026, 5, 1),
          empresa: { estatus_verificacion: "APROBADA" },
        }),
      ).toBe(false);
    });

    it("visible: ABIERTA sin empresa y sin fecha límite", () => {
      expect(
        esVisibleParaEstudiantes({
          estatus: EstatusVacante.ABIERTA,
          fecha_limite: null,
        }),
      ).toBe(true);
    });
  });

  describe("esEditableCompleta", () => {
    it("no editable si está VENCIDA", () => {
      expect(
        esEditableCompleta({ estatus: EstatusVacante.VENCIDA, fecha_limite: new Date(2026, 5, 20) }),
      ).toBe(false);
    });

    it("no editable si está CERRADA", () => {
      expect(
        esEditableCompleta({ estatus: EstatusVacante.CERRADA, fecha_limite: new Date(2026, 5, 20) }),
      ).toBe(false);
    });

    it("editable si está ABIERTA y vigente", () => {
      expect(
        esEditableCompleta({ estatus: EstatusVacante.ABIERTA, fecha_limite: new Date(2026, 5, 20) }),
      ).toBe(true);
    });

    it("editable si está PAUSADA y vigente", () => {
      expect(
        esEditableCompleta({ estatus: EstatusVacante.PAUSADA, fecha_limite: new Date(2026, 5, 20) }),
      ).toBe(true);
    });

    it("no editable si está ABIERTA pero vencida", () => {
      expect(
        esEditableCompleta({ estatus: EstatusVacante.ABIERTA, fecha_limite: new Date(2026, 5, 1) }),
      ).toBe(false);
    });
  });

  describe("prioridadOrdenEstatus", () => {
    it("ordena ABIERTA < PAUSADA < VENCIDA < CERRADA", () => {
      expect(prioridadOrdenEstatus(EstatusVacante.ABIERTA)).toBe(0);
      expect(prioridadOrdenEstatus(EstatusVacante.PAUSADA)).toBe(1);
      expect(prioridadOrdenEstatus(EstatusVacante.VENCIDA)).toBe(2);
      expect(prioridadOrdenEstatus(EstatusVacante.CERRADA)).toBe(3);
    });
  });

  describe("etiquetaEstatusVacante", () => {
    it("traduce cada estatus a su etiqueta en español", () => {
      expect(etiquetaEstatusVacante(EstatusVacante.ABIERTA)).toBe("Abierta");
      expect(etiquetaEstatusVacante(EstatusVacante.PAUSADA)).toBe("Pausada");
      expect(etiquetaEstatusVacante(EstatusVacante.VENCIDA)).toBe("Vencida");
      expect(etiquetaEstatusVacante(EstatusVacante.CERRADA)).toBe("Cerrada");
    });

    it("devuelve el valor tal cual para un estatus desconocido", () => {
      expect(etiquetaEstatusVacante("OTRO")).toBe("OTRO");
    });
  });

  describe("ordenarVacantesPorEstatus", () => {
    it("ordena por prioridad de estatus y luego por createdAt descendente", () => {
      const vacantes = [
        { estatus: EstatusVacante.CERRADA, createdAt: new Date(2026, 0, 1) },
        { estatus: EstatusVacante.ABIERTA, createdAt: new Date(2026, 0, 1) },
        { estatus: EstatusVacante.ABIERTA, createdAt: new Date(2026, 0, 5) },
      ];
      const ordenadas = ordenarVacantesPorEstatus(vacantes);
      expect(ordenadas.map((v) => v.estatus)).toEqual([
        EstatusVacante.ABIERTA,
        EstatusVacante.ABIERTA,
        EstatusVacante.CERRADA,
      ]);
      // Entre las dos ABIERTA, primero la más reciente.
      expect(ordenadas[0].createdAt).toEqual(new Date(2026, 0, 5));
    });

    it("no muta el arreglo original", () => {
      const vacantes = [
        { estatus: EstatusVacante.CERRADA, createdAt: new Date(2026, 0, 1) },
        { estatus: EstatusVacante.ABIERTA, createdAt: new Date(2026, 0, 2) },
      ];
      const copia = [...vacantes];
      ordenarVacantesPorEstatus(vacantes);
      expect(vacantes).toEqual(copia);
    });
  });
});

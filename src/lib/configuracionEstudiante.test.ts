import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  estaEnCooldownNombre,
  fechaFinCooldownNombre,
  validarDatosPersonales,
  validarPassword,
} from "./configuracionEstudiante";

describe("estaEnCooldownNombre", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("es false cuando el nombre nunca se modificó (null)", () => {
    expect(estaEnCooldownNombre(null)).toBe(false);
  });

  it("es true si se modificó hace menos de 30 días", () => {
    expect(estaEnCooldownNombre(new Date(2026, 5, 1))).toBe(true); // hace 14 días
  });

  it("es false si se modificó hace más de 30 días", () => {
    expect(estaEnCooldownNombre(new Date(2026, 3, 1))).toBe(false); // hace ~75 días
  });
});

describe("fechaFinCooldownNombre", () => {
  it("devuelve cadena vacía si no hay fecha", () => {
    expect(fechaFinCooldownNombre(null)).toBe("");
  });

  it("suma 30 días y formatea en es-MX", () => {
    const fecha = fechaFinCooldownNombre(new Date(2026, 0, 1)); // 1 ene -> 31 ene
    expect(fecha).toContain("31");
    expect(fecha).toContain("enero");
    expect(fecha).toContain("2026");
  });
});

describe("validarDatosPersonales", () => {
  it("no reporta errores con datos válidos", () => {
    expect(validarDatosPersonales({ nombre: "Ana", apellidoPaterno: "López", carreraId: 3 })).toEqual({});
  });

  it("reporta nombre y apellido vacíos y carrera faltante", () => {
    const errs = validarDatosPersonales({ nombre: "  ", apellidoPaterno: "", carreraId: 0 });
    expect(errs.nombre).toBeDefined();
    expect(errs.apellidoPaterno).toBeDefined();
    expect(errs.carreraId).toBeDefined();
  });
});

describe("validarPassword", () => {
  it("no reporta errores con datos válidos", () => {
    expect(
      validarPassword({ passwordActual: "vieja123", passwordNuevo: "nueva1234", confirmarPasswordNuevo: "nueva1234" }),
    ).toEqual({});
  });

  it("exige la contraseña actual", () => {
    const errs = validarPassword({ passwordActual: "", passwordNuevo: "nueva1234", confirmarPasswordNuevo: "nueva1234" });
    expect(errs.passwordActual).toBeDefined();
  });

  it("exige mínimo 8 caracteres en la nueva", () => {
    const errs = validarPassword({ passwordActual: "x", passwordNuevo: "corta", confirmarPasswordNuevo: "corta" });
    expect(errs.passwordNuevo).toBeDefined();
  });

  it("exige que la confirmación coincida", () => {
    const errs = validarPassword({ passwordActual: "x", passwordNuevo: "nueva1234", confirmarPasswordNuevo: "otra1234" });
    expect(errs.confirmarPasswordNuevo).toBeDefined();
  });
});

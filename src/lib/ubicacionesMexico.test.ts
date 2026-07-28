import { describe, it, expect } from "vitest";
import { listaEstados, getMunicipios } from "./ubicacionesMexico";

// Caracterización del catálogo de ubicaciones (estados/municipios de México).

describe("listaEstados", () => {
  it("expone una lista no vacía de estados", () => {
    expect(listaEstados.length).toBeGreaterThan(0);
  });
});

describe("getMunicipios", () => {
  it("devuelve los municipios de un estado válido", () => {
    const municipios = getMunicipios(listaEstados[0]);
    expect(Array.isArray(municipios)).toBe(true);
    expect(municipios.length).toBeGreaterThan(0);
  });

  it("devuelve arreglo vacío para un estado desconocido", () => {
    expect(getMunicipios("Estado Inexistente")).toEqual([]);
  });

  it("devuelve arreglo vacío para null/undefined/cadena vacía", () => {
    expect(getMunicipios(null)).toEqual([]);
    expect(getMunicipios(undefined)).toEqual([]);
    expect(getMunicipios("")).toEqual([]);
  });
});

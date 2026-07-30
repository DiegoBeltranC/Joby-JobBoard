import { describe, it, expect } from "vitest";
import { separarHabilidadesEIdiomas } from "./habilidadesVacante";

// Caracterización de la separación habilidades/idiomas de una vacante.
// Regla: los idiomas van embebidos en habilidades_req con " - " (p.ej. "Inglés - Avanzado").

describe("separarHabilidadesEIdiomas", () => {
  it("separa habilidades técnicas de idiomas embebidos", () => {
    const r = separarHabilidadesEIdiomas(["React", "Node", "Inglés - Avanzado"]);
    expect(r.habilidades).toEqual(["React", "Node"]);
    expect(r.idiomas).toEqual(["Inglés - Avanzado"]);
  });

  it("antepone idiomas_req a los idiomas embebidos", () => {
    const r = separarHabilidadesEIdiomas(["React", "Inglés - B2"], ["Francés - A1"]);
    expect(r.habilidades).toEqual(["React"]);
    expect(r.idiomas).toEqual(["Francés - A1", "Inglés - B2"]);
  });

  it("devuelve arreglos vacíos para null/undefined", () => {
    expect(separarHabilidadesEIdiomas(null)).toEqual({ habilidades: [], idiomas: [] });
    expect(separarHabilidadesEIdiomas(undefined)).toEqual({ habilidades: [], idiomas: [] });
  });

  it("sin idiomas_req deja idiomas solo con los embebidos", () => {
    const r = separarHabilidadesEIdiomas(["Excel", "Alemán - C1"]);
    expect(r.idiomas).toEqual(["Alemán - C1"]);
  });
});

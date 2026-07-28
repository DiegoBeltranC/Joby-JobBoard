import { describe, it, expect } from "vitest";
import { toTitleCase } from "./toTitleCase";

// Caracterización de toTitleCase: capitaliza la primera letra de cada palabra
// y pasa el resto a minúsculas. Se usa para nombres mostrados en la UI.

describe("toTitleCase", () => {
  it("capitaliza la primera letra de cada palabra", () => {
    expect(toTitleCase("diego beltran")).toBe("Diego Beltran");
  });

  it("pasa el resto de cada palabra a minúsculas", () => {
    expect(toTitleCase("hELLO wORLD")).toBe("Hello World");
  });

  it("recorta espacios al inicio y al final", () => {
    expect(toTitleCase("  hola  ")).toBe("Hola");
  });

  it("preserva acentos que no están al inicio de palabra", () => {
    expect(toTitleCase("maría josé")).toBe("María José");
  });

  it("devuelve cadena vacía para entrada vacía", () => {
    expect(toTitleCase("")).toBe("");
  });
});

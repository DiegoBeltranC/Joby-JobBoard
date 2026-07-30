import { describe, it, expect } from "vitest";
import { encodeId } from "./hash";
import { urlCortaVacante, urlPerfilPublicoVacante } from "./vacanteUrls";

// Caracterización de la construcción de URLs públicas de vacante.
// Se comparan contra la composición esperada con encodeId (esquema actual).

describe("urlCortaVacante", () => {
  it("construye el link corto /e con origin absoluto", () => {
    expect(urlCortaVacante(1, 2, "https://joby.mx")).toBe(
      `https://joby.mx/e/${encodeId(1)}?vacante=${encodeId(2)}`,
    );
  });

  it("sin origin devuelve una URL relativa", () => {
    expect(urlCortaVacante(1, 2)).toBe(`/e/${encodeId(1)}?vacante=${encodeId(2)}`);
  });

  it("tolera un id null produciendo segmento vacío (como encodeId)", () => {
    expect(urlCortaVacante(null, 2)).toBe(`/e/?vacante=${encodeId(2)}`);
  });
});

describe("urlPerfilPublicoVacante", () => {
  it("construye el link directo al perfil público con origin absoluto", () => {
    expect(urlPerfilPublicoVacante(3, 4, "https://joby.mx")).toBe(
      `https://joby.mx/perfil-publico-empresa/${encodeId(3)}?vacante=${encodeId(4)}`,
    );
  });

  it("sin origin devuelve una URL relativa", () => {
    expect(urlPerfilPublicoVacante(3, 4)).toBe(
      `/perfil-publico-empresa/${encodeId(3)}?vacante=${encodeId(4)}`,
    );
  });
});

import { describe, it, expect } from "vitest";
import { encodeId, decodeId } from "./hash";

// Tests de CARACTERIZACIÓN: documentan el comportamiento ACTUAL de la
// ofuscación de IDs, incluidas sus rarezas, para que cualquier refactor
// posterior lo preserve (encode/decode se usan en URLs públicas /e/[id], /p/[id]).

describe("hash: encodeId", () => {
  it("devuelve cadena vacía cuando el id es null", () => {
    expect(encodeId(null)).toBe("");
  });

  it("devuelve cadena vacía cuando el id es undefined", () => {
    expect(encodeId(undefined)).toBe("");
  });

  it("codifica en base36 en MAYÚSCULAS", () => {
    const code = encodeId(1);
    expect(code).toMatch(/^[0-9A-Z]+$/);
    expect(code).toBe(code.toUpperCase());
  });

  it("es determinista: el mismo id produce el mismo código", () => {
    expect(encodeId(42)).toBe(encodeId(42));
  });

  it("ids distintos producen códigos distintos", () => {
    expect(encodeId(1)).not.toBe(encodeId(2));
  });
});

describe("hash: decodeId", () => {
  it("devuelve null para cadena vacía", () => {
    expect(decodeId("")).toBeNull();
  });

  it("devuelve null para null y undefined", () => {
    expect(decodeId(null)).toBeNull();
    expect(decodeId(undefined)).toBeNull();
  });

  it("devuelve null para un hash que no es base36 válido", () => {
    expect(decodeId("!!!")).toBeNull();
  });

  it("es insensible a mayúsculas/minúsculas", () => {
    const code = encodeId(7);
    expect(decodeId(code.toLowerCase())).toBe(decodeId(code.toUpperCase()));
  });
});

describe("hash: round-trip encode -> decode", () => {
  it.each([1, 2, 7, 10, 42, 100, 999, 12345])(
    "decodeId(encodeId(%i)) recupera el id original",
    (id) => {
      expect(decodeId(encodeId(id))).toBe(id);
    },
  );
});

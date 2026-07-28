import { describe, it, expect } from "vitest";
import { calcularProgresoEstudiante, type EstudianteParaProgreso } from "./perfilEstudiante";

// Caracterización del cálculo de progreso del perfil estudiantil.
// Base 20% + ubicación/bio 20% + habilidades 20% + foto 15% + cv 15% + portafolio 10% = 100%.

const vacio: EstudianteParaProgreso = {
  estado: null,
  municipio: null,
  bio: null,
  habilidades: [],
  foto_perfil_url: null,
  cv_url: null,
  experiencias: [],
  proyectos: [],
};

describe("calcularProgresoEstudiante", () => {
  it("parte de 20% con el perfil vacío y lista los 5 faltantes", () => {
    const r = calcularProgresoEstudiante(vacio);
    expect(r.progreso).toBe(20);
    expect(r.faltantes).toHaveLength(5);
    expect(r.faltantesAlerta).toHaveLength(5);
  });

  it("llega a 100% con el perfil completo y sin faltantes", () => {
    const r = calcularProgresoEstudiante({
      estado: "Quintana Roo",
      municipio: "Chetumal",
      bio: "Estudiante de TI",
      habilidades: ["React"],
      foto_perfil_url: "/uploads/foto.png",
      cv_url: "/uploads/cv.pdf",
      experiencias: [{}],
      proyectos: [],
    });
    expect(r.progreso).toBe(100);
    expect(r.faltantes).toHaveLength(0);
    expect(r.faltantesAlerta).toHaveLength(0);
  });

  it("suma ubicación (+20%) solo cuando estado, municipio y bio están presentes", () => {
    const r = calcularProgresoEstudiante({
      ...vacio,
      estado: "Quintana Roo",
      municipio: "Chetumal",
      bio: "Hola",
    });
    expect(r.progreso).toBe(40);
    expect(r.faltantes).toHaveLength(4);
  });

  it("no suma ubicación si falta la bio", () => {
    const r = calcularProgresoEstudiante({
      ...vacio,
      estado: "Quintana Roo",
      municipio: "Chetumal",
      bio: null,
    });
    expect(r.progreso).toBe(20);
  });

  it("cuenta el portafolio (+10%) con solo proyectos (sin experiencias)", () => {
    const r = calcularProgresoEstudiante({ ...vacio, proyectos: [{}] });
    expect(r.progreso).toBe(30);
  });

  it("incluye porcentajes en faltantes y no en faltantesAlerta", () => {
    const r = calcularProgresoEstudiante(vacio);
    expect(r.faltantes.some((f) => f.includes("%"))).toBe(true);
    expect(r.faltantesAlerta.some((f) => f.includes("%"))).toBe(false);
  });
});

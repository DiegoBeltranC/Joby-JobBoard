/**
 * Cálculo de progreso del perfil estudiantil (lógica compartida servidor/cliente).
 */

export type EstudianteParaProgreso = {
    estado: string | null;
    municipio: string | null;
    bio: string | null;
    habilidades: string[];
    foto_perfil_url: string | null;
    cv_url: string | null;
    experiencias: unknown[];
    proyectos: unknown[];
};

export type ResultadoProgresoEstudiante = {
    progreso: number;
    /** Con porcentajes — barra de completar perfil (antes del hito) */
    faltantes: string[];
    /** Sin porcentajes — avisos tras el hito de completado */
    faltantesAlerta: string[];
};

const LABELS = {
    ubicacion: { conPct: "Ubicación y Biografía (+20%)", sinPct: "Ubicación y Biografía" },
    habilidades: { conPct: "Habilidades (+20%)", sinPct: "Habilidades" },
    foto: { conPct: "Foto de Perfil (+15%)", sinPct: "Foto de Perfil" },
    cv: { conPct: "Currículum Vitae (+15%)", sinPct: "Currículum Vitae" },
    portafolio: { conPct: "Experiencia o Proyectos (+10%)", sinPct: "Experiencia o Proyectos" },
} as const;

export function calcularProgresoEstudiante(estudiante: EstudianteParaProgreso): ResultadoProgresoEstudiante {
    let progreso = 20;
    const faltantes: string[] = [];
    const faltantesAlerta: string[] = [];

    if (estudiante.estado && estudiante.municipio && estudiante.bio) {
        progreso += 20;
    } else {
        faltantes.push(LABELS.ubicacion.conPct);
        faltantesAlerta.push(LABELS.ubicacion.sinPct);
    }

    if (estudiante.habilidades && estudiante.habilidades.length > 0) {
        progreso += 20;
    } else {
        faltantes.push(LABELS.habilidades.conPct);
        faltantesAlerta.push(LABELS.habilidades.sinPct);
    }

    if (estudiante.foto_perfil_url) {
        progreso += 15;
    } else {
        faltantes.push(LABELS.foto.conPct);
        faltantesAlerta.push(LABELS.foto.sinPct);
    }

    if (estudiante.cv_url) {
        progreso += 15;
    } else {
        faltantes.push(LABELS.cv.conPct);
        faltantesAlerta.push(LABELS.cv.sinPct);
    }

    if (estudiante.experiencias.length > 0 || estudiante.proyectos.length > 0) {
        progreso += 10;
    } else {
        faltantes.push(LABELS.portafolio.conPct);
        faltantesAlerta.push(LABELS.portafolio.sinPct);
    }

    return { progreso, faltantes, faltantesAlerta };
}

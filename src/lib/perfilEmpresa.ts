/**
 * Cálculo de progreso del perfil empresarial (lógica compartida servidor/cliente).
 * Hito de UI: estatus APROBADA (no se revierte la barra de completado).
 */

import type { EstatusEmpresa } from "@prisma/client";

export type EmpresaParaProgreso = {
    razon_social: string | null;
    rfc: string | null;
    estado: string | null;
    municipio: string | null;
    telefono_contacto: string | null;
    descripcion: string | null;
    logo_url: string | null;
    fotos_empresa: string[];
    estatus_verificacion?: EstatusEmpresa;
};

export type ResultadoProgresoEmpresa = {
    progreso: number;
    /** Con porcentajes — barra de completar perfil (SIN_ENVIAR / REQUIERE_CAMBIOS) */
    faltantes: string[];
    /** Sin porcentajes — avisos tras aprobación */
    faltantesAlerta: string[];
};

const LABELS = {
    legales: { conPct: "Datos legales (RFC y razón social) (+15%)", sinPct: "Datos legales" },
    ubicacion: { conPct: "Ubicación (+10%)", sinPct: "Ubicación" },
    telefono: { conPct: "Teléfono de contacto (+10%)", sinPct: "Teléfono de contacto" },
    descripcion: { conPct: "Descripción de la empresa (+25%)", sinPct: "Descripción de la empresa" },
    logo: { conPct: "Logo de la empresa (+15%)", sinPct: "Logo de la empresa" },
    fotos: { conPct: "Fotos de instalaciones (+15%)", sinPct: "Fotos de instalaciones" },
} as const;

/** Muestra barra / % de completar perfil (onboarding y correcciones). */
export function debeMostrarBarraProgreso(estatus: EstatusEmpresa): boolean {
    return estatus === "SIN_ENVIAR" || estatus === "REQUIERE_CAMBIOS";
}

/** Hito: cuenta verificada por UTCH. */
export function empresaAprobada(estatus: EstatusEmpresa): boolean {
    return estatus === "APROBADA";
}

export function calcularProgresoEmpresa(empresa: EmpresaParaProgreso): ResultadoProgresoEmpresa {
    let progreso = 10;
    const faltantes: string[] = [];
    const faltantesAlerta: string[] = [];

    if (empresa.razon_social && empresa.rfc) {
        progreso += 15;
    } else {
        faltantes.push(LABELS.legales.conPct);
        faltantesAlerta.push(LABELS.legales.sinPct);
    }

    if (empresa.estado && empresa.municipio) {
        progreso += 10;
    } else {
        faltantes.push(LABELS.ubicacion.conPct);
        faltantesAlerta.push(LABELS.ubicacion.sinPct);
    }

    if (empresa.telefono_contacto) {
        progreso += 10;
    } else {
        faltantes.push(LABELS.telefono.conPct);
        faltantesAlerta.push(LABELS.telefono.sinPct);
    }

    if (empresa.descripcion) {
        progreso += 25;
    } else {
        faltantes.push(LABELS.descripcion.conPct);
        faltantesAlerta.push(LABELS.descripcion.sinPct);
    }

    if (empresa.logo_url) {
        progreso += 15;
    } else {
        faltantes.push(LABELS.logo.conPct);
        faltantesAlerta.push(LABELS.logo.sinPct);
    }

    if (empresa.fotos_empresa.length > 0) {
        progreso += 15;
    } else {
        faltantes.push(LABELS.fotos.conPct);
        faltantesAlerta.push(LABELS.fotos.sinPct);
    }

    return { progreso, faltantes, faltantesAlerta };
}

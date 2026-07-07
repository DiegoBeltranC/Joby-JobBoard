import { revalidatePath } from "next/cache";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { calcularProgresoEstudiante } from "@/lib/perfilEstudiante";

/** Revalida páginas y layout del dashboard estudiantil */
export function revalidateDashboardEstudiante() {
    revalidatePath("/inicio", "layout");
    revalidatePath("/perfil", "layout");
    revalidatePath("/inicio");
    revalidatePath("/perfil");
}

/**
 * Si el perfil alcanza 100% y aún no tiene hito, guarda perfil_completado_at.
 * @returns true si se marcó por primera vez en esta llamada
 */
export async function marcarPerfilCompletoSiAplica(estudianteId: number): Promise<boolean> {
    const estudiante = await prisma.estudiante.findUnique({
        where: { id: estudianteId },
        include: { experiencias: true, proyectos: true },
    });

    if (!estudiante || estudiante.perfil_completado_at) {
        return false;
    }

    const { progreso } = calcularProgresoEstudiante(estudiante);

    if (progreso < 100) {
        return false;
    }

    await prisma.estudiante.update({
        where: { id: estudianteId },
        data: { perfil_completado_at: new Date() },
    });

    revalidateDashboardEstudiante();
    return true;
}

/** Obtiene estudiante con relaciones necesarias y sincroniza el hito si aplica */
export const obtenerEstudianteYSincronizarHito = cache(async (usuarioId: number) => {
    const usuarioInfo = await prisma.user.findUnique({
        where: { id: usuarioId },
        include: {
            estudiante: {
                include: {
                    universidad: true,
                    carrera: true,
                    experiencias: true,
                    proyectos: true,
                },
            },
        },
    });

    const estudiante = usuarioInfo?.estudiante;
    if (!estudiante) return null;

    let perfilCompletadoAt = estudiante.perfil_completado_at;

    if (!perfilCompletadoAt) {
        const { progreso } = calcularProgresoEstudiante(estudiante);
        if (progreso >= 100) {
            const marcado = await marcarPerfilCompletoSiAplica(estudiante.id);
            if (marcado) {
                perfilCompletadoAt = new Date();
            }
        }
    }

    return { estudiante: { ...estudiante, perfil_completado_at: perfilCompletadoAt } };
});

/** Obtiene estudiante con su perfil base, cacheado por request */
export const obtenerEstudianteBasico = cache(async (usuarioId: number) => {
    return prisma.user.findUnique({
        where: { id: usuarioId },
        include: { estudiante: true },
    });
});

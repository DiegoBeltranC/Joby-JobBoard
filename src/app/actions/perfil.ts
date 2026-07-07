"use server";

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOpcionesCompartir(data: {
    perfil_publico?: boolean;
    compartir_experiencia?: boolean;
    compartir_proyectos?: boolean;
    compartir_habilidades?: boolean;
    compartir_idiomas?: boolean;
    compartir_educacion?: boolean;
}) {
    const session = await getSession();
    if (!session || !session.userId) {
        throw new Error("No autorizado");
    }

    // Buscamos el registro del estudiante correspondiente al usuario de la sesión
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { estudiante: true }
    });

    if (!user || !user.estudiante) {
        throw new Error("Perfil de estudiante no encontrado");
    }

    // Actualizamos las preferencias de privacidad
    await prisma.estudiante.update({
        where: { id: user.estudiante.id },
        data
    });

    // Revalidamos la ruta del perfil para que la UI se actualice
    revalidatePath("/perfil");
    
    return { success: true };
}

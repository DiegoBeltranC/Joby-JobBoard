"use server"

import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

function capitalizar(texto: string | null | undefined) {
    if (!texto) return "";
    return texto.trim().toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
}

export async function completarPerfilAdmin(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "No autorizado." }

    const nombre = capitalizar(formData.get("nombre") as string);
    const apellidoPaterno = capitalizar(formData.get("apellidoPaterno") as string);
    const apellidoMaterno = capitalizar(formData.get("apellidoMaterno") as string);
    const telefono = formData.get("telefono") as string;

    if (!nombre || !apellidoPaterno) {
        return { error: "Nombre y Apellido Paterno son obligatorios." }
    }

    try {
        const adminData = await prisma.admin.findUnique({
            where: { usuarioId: session.userId }
        });

        if (!adminData) {
             return { error: "Tu usuario no tiene asignado el rol de jerarquía para completar perfil." }
        }

        await prisma.admin.update({
            where: {
                usuarioId: session.userId
            },
            data: {
                nombre,
                apellidoPaterno,
                apellidoMaterno: apellidoMaterno || null,
                telefono: telefono || null
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Error al completar perfil admin:", error);
        return { error: "Ocurrió un error al guardar tus datos de administrador." }
    }
}

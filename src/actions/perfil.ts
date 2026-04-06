"use server"
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { guardarArchivo } from "@/lib/uploadService";

export async function guardarPaso1(data: { bio?: string; ubicacion: string }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        await prisma.estudiante.update({
            where: { usuarioId: session.userId },
            data: {
                bio: data.bio || "",
                ubicacion: data.ubicacion,
            }
        });
    } catch (error) {
        console.error("Error guardando paso 1:", error);
        return { error: "Error al guardar los datos" };
    }

    return { success: true };
}

// En actions/perfil.ts (Añade esta función al final)

export async function guardarPaso2(data: { habilidades: string[]; idiomas: string[] }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        await prisma.estudiante.update({
            where: { usuarioId: session.userId },
            data: {
                // Prisma recibe los arreglos limpios directamente
                habilidades: data.habilidades,
                idiomas: data.idiomas,
            }
        });
    } catch (error) {
        console.error("Error guardando paso 2:", error);
        return { error: "Error al guardar los datos" };
    }

    return { success: true };
}

// En actions/perfil.ts (Añade al final)

export async function guardarPaso3(data: { linkedin?: string; github?: string }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        await prisma.estudiante.update({
            where: { usuarioId: session.userId },
            data: {
                // Guardamos los links dentro del objeto Json 'enlaces'
                enlaces: {
                    linkedin: data.linkedin || "",
                    github: data.github || ""
                }
            }
        });
    } catch (error) {
        console.error("Error guardando paso 3:", error);
        return { error: "Error al guardar los enlaces" };
    }

    return { success: true };
}


export async function agregarProyecto(data: { nombre: string; url_enlace?: string; puntos_clave: string[]; fechaInicio: string; fechaFin: string | null }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.proyecto.create({
            data: {
                estudianteId: usuario.estudiante.id,
                nombre: data.nombre,
                url_enlace: data.url_enlace || null,
                puntos_clave: data.puntos_clave,
                fechaInicio: new Date(data.fechaInicio + "T12:00:00Z"), // T12 Evita desfases de día
                fechaFin: data.fechaFin ? new Date(data.fechaFin + "T12:00:00Z") : null,
            }
        });
        revalidatePath("/perfil");
        return { success: true };
    } catch (error) {
        console.log(error);
        return { error: "Error al guardar el proyecto" };
    }
}

export async function editarProyecto(id: number, data: { nombre: string; url_enlace?: string; puntos_clave: string[]; fechaInicio: string; fechaFin: string | null }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.proyecto.update({
            where: { id: id, estudianteId: usuario.estudiante.id }, // Doble validación de seguridad
            data: {
                nombre: data.nombre,
                url_enlace: data.url_enlace || null,
                puntos_clave: data.puntos_clave,
                fechaInicio: new Date(data.fechaInicio + "T12:00:00Z"),
                fechaFin: data.fechaFin ? new Date(data.fechaFin + "T12:00:00Z") : null,
            }
        });
        revalidatePath("/perfil");
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar el proyecto" };
    }
}

// En actions/perfil.ts
export async function eliminarProyecto(proyectoId: number) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        // Borramos el proyecto asegurándonos de que pertenezca al usuario logueado
        // (Por seguridad, primero buscamos el estudianteId)
        const usuario = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { estudiante: true }
        });

        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.proyecto.delete({
            where: {
                id: proyectoId,
                estudianteId: usuario.estudiante.id // 👈 Doble candado de seguridad
            }
        });

        revalidatePath("/perfil");
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar proyecto:", error);
        return { error: "No se pudo eliminar el proyecto" };
    }
}

// En actions/perfil.ts

export async function agregarExperiencia(data: { puesto: string; empresa: string; logros: string[]; fechaInicio: string; fechaFin: string | null }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.experiencia.create({
            data: {
                estudianteId: usuario.estudiante.id,
                puesto: data.puesto,
                empresa: data.empresa, // 👈 Nuevo campo
                logros: data.logros,   // 👈 Equivalente a puntos_clave
                fechaInicio: new Date(data.fechaInicio + "T12:00:00Z"),
                fechaFin: data.fechaFin ? new Date(data.fechaFin + "T12:00:00Z") : null,
            }
        });
        revalidatePath("/perfil");
        return { success: true };
    } catch (error) {
        return { error: "Error al guardar la experiencia" };
    }
}

export async function editarExperiencia(id: number, data: { puesto: string; empresa: string; logros: string[]; fechaInicio: string; fechaFin: string | null }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.experiencia.update({
            where: { id: id, estudianteId: usuario.estudiante.id },
            data: {
                puesto: data.puesto,
                empresa: data.empresa,
                logros: data.logros,
                fechaInicio: new Date(data.fechaInicio + "T12:00:00Z"),
                fechaFin: data.fechaFin ? new Date(data.fechaFin + "T12:00:00Z") : null,
            }
        });
        revalidatePath("/perfil");
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar la experiencia" };
    }
}

export async function eliminarExperiencia(experienciaId: number) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.experiencia.delete({
            where: { id: experienciaId, estudianteId: usuario.estudiante.id }
        });

        revalidatePath("/perfil");
        return { success: true };
    } catch (error) {
        return { error: "No se pudo eliminar la experiencia" };
    }
}

export async function actualizarFotoPerfil(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    const archivo = formData.get("foto") as File;
    if (!archivo || archivo.size === 0) return { error: "No se recibió ninguna imagen" };

    // Validar peso (Ej. máximo 2MB)
    if (archivo.size > 2 * 1024 * 1024) return { error: "La imagen no debe pesar más de 2MB" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        // 1. Usamos nuestro servicio escalable para guardar la imagen
        const urlFoto = await guardarArchivo(archivo, "avatars", `avatar-${usuario.estudiante.id}`);

        // 2. Actualizamos la base de datos
        await prisma.estudiante.update({
            where: { id: usuario.estudiante.id },
            data: { foto_perfil_url: urlFoto }
        });

        revalidatePath("/perfil");
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar foto:", error);
        return { error: "Error interno al guardar la foto" };
    }
}

export async function eliminarFotoPerfil() {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.estudiante.update({
            where: { id: usuario.estudiante.id },
            data: { foto_perfil_url: null }
        });

        revalidatePath("/perfil");
        return { success: true };
    } catch (error) {
        return { error: "No se pudo eliminar la foto" };
    }
}
"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Esquema de validación para la vacante
const vacanteSchema = z.object({
    titulo: z.string().min(5, "El título debe tener al menos 5 caracteres").max(100),
    descripcion: z.string().min(20, "La descripción debe ser más detallada (mín. 20 caracteres)"),
    tipo_contrato: z.enum(["ESTADIA", "MEDIO_TIEMPO", "TIEMPO_COMPLETO"]),
    modalidad: z.enum(["PRESENCIAL", "HIBRIDO", "REMOTO"]),
    estado: z.string().min(2, "Selecciona un estado"),
    municipio: z.string().min(2, "Selecciona un municipio"),
    habilidades_req: z.array(z.string()).min(1, "Añade al menos una habilidad requerida"),
    sueldo_min: z.number().optional().nullable(),
    sueldo_max: z.number().optional().nullable(),
    horario: z.string()
        .regex(/^([01][0-9]|2[0-3]):[0-5][0-9] - ([01][0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido. Usa: HH:mm - HH:mm (24h)")
        .optional().nullable(),
    fecha_limite: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
})

export async function crearVacanteAction(datos: any) {
    try {
        const session = await getSession();
        if (!session) {
            throw new Error("Sesión expirada o no válida. Por favor, inicia sesión de nuevo.");
        }

        // 1. BUSCAR EMPRESA Y VERIFICAR ESTATUS (BLOQUEO CERO CONFIANZA)
        const usuario = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { empresa: true }
        });

        if (!usuario || !usuario.empresa) {
            throw new Error("No se encontró un perfil empresarial asociado a esta cuenta.");
        }

        // === LOGICA DE SEGURIDAD BACKEND (ZERO TRUST) ===
        if (usuario.empresa.estatus_verificacion !== "APROBADA") {
            console.warn(`🔐 Intento de creación de vacante bloqueado para empresa ID: ${usuario.empresa.id} (Estatus: ${usuario.empresa.estatus_verificacion})`);
            throw new Error("Acceso Denegado: Su cuenta corporativa aún no ha sido validada por la administración de la UTCH.");
        }

        // 2. VALIDAR ESTRUCTURA DE DATOS
        console.log("📝 Procesando datos de vacante para empresa ID:", usuario.empresa.id);
        
        const validacion = vacanteSchema.safeParse(datos);
        if (!validacion.success) {
            const issues = validacion.error.issues || [];
            const erroresDetallados = issues.map(e => `${(e.path || []).join(".") || "campo"}: ${e.message}`).join(" | ");
            console.error("❌ Fallo de validación Zod en crearVacanteAction:", erroresDetallados);
            throw new Error(`Datos inválidos: ${erroresDetallados}`);
        }

        const data = validacion.data;

        // 3. CREAR REGISTRO (CONSERVANDO EL SCHEMA ACTUAL)
        try {
            await prisma.vacante.create({
                data: {
                    empresaId: usuario.empresa.id,
                    titulo: data.titulo,
                    descripcion: data.descripcion,
                    tipo_contrato: data.tipo_contrato,
                    modalidad: data.modalidad,
                    estado: data.estado,
                    municipio: data.municipio,
                    // Guardamos habilidades e idiomas juntos en el arreglo habilidades_req
                    habilidades_req: data.habilidades_req || [],
                    sueldo_min: data.sueldo_min,
                    sueldo_max: data.sueldo_max,
                    horario: data.horario,
                    fecha_limite: data.fecha_limite,
                    activa: true,
                }
            });
            console.log("✅ Vacante creada exitosamente para:", usuario.empresa.nombre_comercial);
        } catch (dbError: any) {
            console.error("🚨 Error de Prisma al insertar vacante:", dbError.message);
            throw new Error("Error en la base de datos al intentar guardar la vacante.");
        }

        revalidatePath("/empresa/vacantes");
        return { success: true, message: "¡Vacante publicada exitosamente!" };

    } catch (error: any) {
        console.error("🔒 Error en crearVacanteAction:", error.message);
        return { success: false, error: error.message || "Error interno del servidor" };
    }
}

export async function getEstatusEmpresaAction() {
    const session = await getSession();
    if (!session) return "SIN_ENVIAR";

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { empresa: true }
    });

    return usuario?.empresa?.estatus_verificacion || "SIN_ENVIAR";
}

export async function obtenerVacantesEmpresa() {
    const session = await getSession();
    if (!session) return [];

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { empresa: true }
    });

    if (!usuario?.empresa) return [];

    return await prisma.vacante.findMany({
        where: { empresaId: usuario.empresa.id },
        orderBy: { createdAt: "desc" }
    });
}

// === NUEVAS ACCIONES DE GESTIÓN (DETALLES) ===

export async function cambiarEstatusVacanteAction(id: number, activa: boolean) {
    try {
        const session = await getSession();
        if (!session) throw new Error("Sesión expirada");

        const usuario = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { empresa: true }
        });

        if (!usuario?.empresa) throw new Error("No autorizado");

        // Validar propiedad
        const vacante = await prisma.vacante.findUnique({
            where: { id, empresaId: usuario.empresa.id }
        });

        if (!vacante) throw new Error("Vacante no encontrada o no pertenece a tu empresa");

        await prisma.vacante.update({
            where: { id },
            data: { activa }
        });

        revalidatePath("/empresa/vacantes");
        return { success: true, message: activa ? "Vacante reactivada" : "Vacante pausada" };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function eliminarVacanteAction(id: number) {
    try {
        const session = await getSession();
        if (!session) throw new Error("Sesión expirada");

        const usuario = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { empresa: true }
        });

        if (!usuario?.empresa) throw new Error("No autorizado");

        // Validar propiedad antes de borrar
        const vacante = await prisma.vacante.findUnique({
            where: { id, empresaId: usuario.empresa.id }
        });

        if (!vacante) throw new Error("No puedes eliminar esta vacante");

        await prisma.vacante.delete({
            where: { id }
        });

        revalidatePath("/empresa/vacantes");
        return { success: true, message: "Vacante eliminada exitosamente" };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

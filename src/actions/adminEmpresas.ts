"use server"

import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// Extraemos lógica repetitiva de validar admin
async function validateAdmin() {
    const session = await getSession();
    if (!session) throw new Error("No autorizado.");

    const admin = await prisma.admin.findUnique({
        where: { usuarioId: session.userId }
    });

    if (!admin) throw new Error("No eres administrador");

    return admin;
}

export async function aprobarEmpresa(empresaId: number) {
    try {
        await validateAdmin();
        
        await prisma.empresa.update({
            where: { id: empresaId },
            data: {
                estatus_verificacion: "APROBADA",
                motivo_rechazo: null // limpiamos en caso de que venga de un rechazo previo
            }
        });

        // Opcional: Aquí se podría enviar email de Bienvenida a la empresa.

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Error al aprobar empresa" };
    }
}

export async function rechazarEmpresa(empresaId: number, motivo: string) {
    try {
        const admin = await validateAdmin();

        if (!motivo.trim()) return { error: "El motivo es obligatorio." };

        await prisma.empresa.update({
            where: { id: empresaId },
            data: {
                estatus_verificacion: "RECHAZADA",
                motivo_rechazo: motivo
            }
        });

        // Lo guardamos en el historial del Ping-Pong
        await prisma.historialComunicacion.create({
            data: {
                empresaId,
                adminId: admin.id,
                asunto: "Cuenta Rechazada",
                mensaje: motivo,
                tipo: "RECHAZO"
            }
        });

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Error al rechazar empresa" };
    }
}

export async function solicitarCorreccion(empresaId: number, asunto: string, mensaje: string) {
    try {
        const admin = await validateAdmin();

        if (!mensaje.trim()) return { error: "Debes escribir un mensaje de corrección." };

        await prisma.empresa.update({
            where: { id: empresaId },
            data: {
                estatus_verificacion: "REQUIERE_CAMBIOS",
                motivo_rechazo: mensaje, // Para mostrarlo rápido en la UI de empresa o en correos
            }
        });

        await prisma.historialComunicacion.create({
            data: {
                empresaId,
                adminId: admin.id,
                asunto,
                mensaje,
                tipo: "CORRECCION_DATOS"
            }
        });

        // Simulación envío de Email
        console.log(`[EMAIL SIMULADO]: Para empresa #${empresaId} | Asunto: ${asunto} | Mensaje: ${mensaje}`);

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Error al solicitar corrección" };
    }
}

export async function suspenderEmpresa(empresaId: number, motivo: string) {
    try {
        const admin = await validateAdmin();

        if (!motivo.trim()) return { error: "El motivo de suspensión es obligatorio." };

        // 1. Damos de baja la empresa (Suspensión)
        await prisma.empresa.update({
            where: { id: empresaId },
            data: {
                estatus_verificacion: "SUSPENDIDA",
                motivo_rechazo: motivo
            }
        });

        // 2. Apagamos todas sus vacantes automáticamente
        await prisma.vacante.updateMany({
            where: { empresaId },
            data: { activa: false }
        });

        // 3. Registramos la suspensión
        await prisma.historialComunicacion.create({
            data: {
                empresaId,
                adminId: admin.id,
                asunto: "AVISO IMPORTANTE: Cuenta Suspendida",
                mensaje: motivo,
                tipo: "SUSPENSION"
            }
        });

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Error al suspender empresa" };
    }
}

export async function reactivarEmpresa(empresaId: number) {
    try {
        const admin = await validateAdmin();

        await prisma.empresa.update({
            where: { id: empresaId },
            data: {
                estatus_verificacion: "PENDIENTE",
                motivo_rechazo: null
            }
        });

        await prisma.historialComunicacion.create({
            data: {
                empresaId,
                adminId: admin.id,
                asunto: "Reactivación de Proceso",
                mensaje: "El administrador ha reactivado el proceso de validación. La empresa vuelve a estar en evaluación.",
                tipo: "AVISO_GENERAL"
            }
        });

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Error al reactivar empresa" };
    }
}

"use server"

import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/mail"
import { revalidatePath } from "next/cache"

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

// Helper interno para notificar sin bloquear la UI
async function triggerNotification(empresaId: number, subject: string, title: string, message: string, type: "SUCCESS" | "WARNING" | "DANGER" | "INFO") {
    try {
        const empresa = await prisma.empresa.findUnique({
            where: { id: empresaId },
            include: { usuario: true }
        });

        if (empresa?.usuario?.correo) {
            // Nota: No usamos await aquí para que sea "fire and forget" 
            // y no retrasar la respuesta al Administrador.
            sendEmail({
                to: empresa.usuario.correo,
                subject,
                title,
                message,
                type,
                buttonText: "Ir a mi Panel",
                buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
            });
        }
    } catch (error) {
        console.error("Critical error triggering notification:", error);
    }
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
        triggerNotification(
            empresaId, 
            "¡Felicidades! Cuenta Aprobada en Joby", 
            "¡Tu empresa ha sido verificada!", 
            "Nos complace informarte que tu perfil ha sido aprobado por la administración. Ya puedes comenzar a publicar vacantes y conectar con el talento de la UT Chetumal.",
            "SUCCESS"
        );

        revalidatePath("/admin/dashboard");
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

        triggerNotification(
            empresaId, 
            "Actualización sobre tu cuenta - Joby", 
            "Cuenta no aprobada", 
            `Lamentamos informarte que tu solicitud de registro ha sido rechazada por el siguiente motivo:\n\n"${motivo}"\n\nSi consideras que esto es un error, por favor contacta a soporte técnico.`,
            "DANGER"
        );

        revalidatePath("/admin/dashboard");
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
        triggerNotification(
            empresaId, 
            `Acción Requerida: ${asunto}`, 
            "Se requieren correcciones en tu perfil", 
            `El administrador ha revisado tu perfil y solicita realizar los siguientes cambios para poder aprobar tu cuenta:\n\n"${mensaje}"\n\nPor favor, ingresa a tu panel para realizar las correcciones solicitadas.`,
            "WARNING"
        );

        revalidatePath("/admin/dashboard");
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

        triggerNotification(
            empresaId, 
            "AVISO IMPORTANTE: Cuenta Suspendida", 
            "Tu cuenta ha sido suspendida", 
            `Te informamos que tu cuenta y todas tus vacantes activas han sido suspendidas por el siguiente motivo:\n\n"${motivo}"\n\nEsta acción es inmediata. Si deseas apelar esta decisión, por favor comunícate con la coordinación de vinculación de la UTCH.`,
            "DANGER"
        );

        revalidatePath("/admin/dashboard");
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

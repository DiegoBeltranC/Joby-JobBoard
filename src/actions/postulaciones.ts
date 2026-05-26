"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { esVisibleParaEstudiantes } from "@/lib/vacanteEstatus"

import fs from 'fs';
import path from 'path';

export async function postularVacanteAction(formData: FormData) {
    try {
        const session = await getSession();
        if (!session) return { error: "Debes iniciar sesión para postularte." };

        const usuario = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { estudiante: true }
        });

        if (!usuario?.estudiante) return { error: "Solo los estudiantes pueden postularse." };

        const vacanteIdStr = formData.get("vacanteId") as string;
        const opcionCV = formData.get("opcionCV") as string; // "perfil" o "nuevo"
        const vacanteId = parseInt(vacanteIdStr);
        const estudianteId = usuario.estudiante.id;

        const vacante = await prisma.vacante.findUnique({
            where: { id: vacanteId },
            include: { empresa: { select: { estatus_verificacion: true } } },
        });

        if (!vacante) {
            return { error: "La vacante no existe o ya no está disponible." };
        }

        if (!esVisibleParaEstudiantes(vacante)) {
            return {
                error: "Esta convocatoria ya no acepta postulaciones (cerrada o vencida).",
            };
        }

        // 1. Verificar si ya existe una postulación
        const postulacionExistente = await prisma.postulacion.findUnique({
            where: {
                estudianteId_vacanteId: { estudianteId, vacanteId }
            }
        });

        if (postulacionExistente) {
            // REGLA DE NEGOCIO: Solo permitir editar si han pasado menos de 5 min y está ENVIADA
            const CINCO_MINUTOS_MS = 5 * 60 * 1000;
            const tiempoTranscurrido = Date.now() - new Date(postulacionExistente.createdAt).getTime();
            
            if (postulacionExistente.estatus !== 'ENVIADA' || tiempoTranscurrido > CINCO_MINUTOS_MS) {
                return { error: "Ya existe una postulación y el período de edición ha expirado." };
            }
        }

        // 2. Manejo del CV Snapshot (Físico)
        let cvSnapshotPath = null;
        const publicDir = path.join(process.cwd(), 'public');
        const snapshotDir = path.join(publicDir, 'uploads', 'postulaciones', 'snapshots');

        if (!fs.existsSync(snapshotDir)) {
            fs.mkdirSync(snapshotDir, { recursive: true });
        }

        // Generar nombre de archivo único
        const fileName = `snap_${estudianteId}_${vacanteId}_${Date.now()}.pdf`;
        const finalPhysicalPath = path.join(snapshotDir, fileName);

        if (opcionCV === "perfil") {
            if (!usuario.estudiante.cv_url) return { error: "No tienes un CV guardado en tu perfil." };
            const originalPath = path.join(publicDir, usuario.estudiante.cv_url);
            if (fs.existsSync(originalPath)) {
                fs.copyFileSync(originalPath, finalPhysicalPath);
                cvSnapshotPath = `/uploads/postulaciones/snapshots/${fileName}`;
            } else {
                return { error: "No se encontró el archivo de tu CV original." };
            }
        } else {
            const nuevoCV = formData.get("nuevo_cv") as File;
            if (!nuevoCV || nuevoCV.size === 0) {
                // Si es edición y no se subió uno nuevo, podríamos mantener el anterior, 
                // pero el modal de postulación siempre pide elegir. 
                // Por simplicidad en este flujo híbrido, si elige 'nuevo' debe subirlo.
                return { error: "Debes subir un archivo PDF." };
            }
            const buffer = Buffer.from(await nuevoCV.arrayBuffer());
            fs.writeFileSync(finalPhysicalPath, buffer);
            cvSnapshotPath = `/uploads/postulaciones/snapshots/${fileName}`;
        }

        // 3. Limpieza de archivo anterior si es una actualización
        if (postulacionExistente?.cv_url_snapshot) {
            try {
                const oldPath = path.join(publicDir, postulacionExistente.cv_url_snapshot);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            } catch (err) {
                console.error("Error al borrar snapshot anterior:", err);
            }
        }

        // 4. Upsert de Postulación con Snapshots Inmutables
        await prisma.postulacion.upsert({
            where: {
                estudianteId_vacanteId: { estudianteId, vacanteId }
            },
            create: {
                estudianteId,
                vacanteId,
                cv_url_snapshot: cvSnapshotPath,
                perfil_snapshot: {
                    bio: usuario.estudiante.bio,
                    habilidades: usuario.estudiante.habilidades,
                    idiomas: usuario.estudiante.idiomas
                }
            },
            update: {
                cv_url_snapshot: cvSnapshotPath,
                perfil_snapshot: {
                    bio: usuario.estudiante.bio,
                    habilidades: usuario.estudiante.habilidades,
                    idiomas: usuario.estudiante.idiomas
                },
                updatedAt: new Date()
            }
        });

        revalidatePath("/inicio");
        revalidatePath("/mis-postulaciones"); // Ajustado a la nueva ruta
        return { success: true, message: postulacionExistente ? "¡Postulación actualizada correctamente!" : "¡Postulación enviada con éxito!" };

    } catch (error: any) {
        console.error("Error postular:", error);
        return { error: "Error al procesar la postulación." };
    }
}

export async function cancelarPostulacionAction(postulacionId: number) {
    try {
        const session = await getSession();
        if (!session) return { error: "No autorizado" };

        const postulacion = await prisma.postulacion.findUnique({
            where: { id: postulacionId }
        });

        if (!postulacion) return { error: "Postulación no encontrada" };

        // REGLA DE NEGOCIO: Período de Gracia de 5 Minutos
        const CINCO_MINUTOS_MS = 5 * 60 * 1000;
        const tiempoTranscurrido = Date.now() - new Date(postulacion.createdAt).getTime();

        if (postulacion.estatus !== 'ENVIADA') {
            return { error: "Bloqueado: La empresa ya está revisando tu solicitud." };
        }

        if (tiempoTranscurrido > CINCO_MINUTOS_MS) {
            return { error: "Bloqueado: El tiempo de gracia de 5 minutos ha expirado." };
        }

        // Si pasa las reglas, eliminamos físicamente el snapshot si existe
        if (postulacion.cv_url_snapshot) {
            try {
                const filePath = path.join(process.cwd(), 'public', postulacion.cv_url_snapshot);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (err) {
                console.error("Error borrar snapshot físico:", err);
            }
        }

        await prisma.postulacion.delete({ where: { id: postulacionId } });
        
        revalidatePath("/estudiante/mis-postulaciones");
        return { success: true, message: "Postulación cancelada correctamente." };

    } catch (error) {
        return { error: "Error al cancelar la postulación." };
    }
}

/**
 * Verifica si el estudiante ya se ha postulado a una vacante.
 */
export async function verificarPostulacionExistente(vacanteId: number) {
    try {
        const session = await getSession();
        if (!session) return false;

        const usuario = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { estudiante: true }
        });

        if (!usuario?.estudiante) return false;

        const postulacion = await prisma.postulacion.findUnique({
            where: {
                estudianteId_vacanteId: {
                    estudianteId: usuario.estudiante.id,
                    vacanteId
                }
            }
        });

        return !!postulacion;
    } catch (error) {
        return false;
    }
}

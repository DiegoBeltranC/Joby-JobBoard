"use server";

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from '@react-pdf/renderer';
import { PlantillaCV } from "@/lib/pdf/PlantillaCV";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { marcarPerfilCompletoSiAplica, revalidateDashboardEstudiante } from "@/lib/syncPerfilEstudiante";
import React from 'react';

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cvs");

export async function generarCVAction() {
    try {
        const session = await getSession();
        if (!session) return { error: "No autorizado" };

        const usuarioInfo = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                estudiante: {
                    include: {
                        universidad: true,
                        carrera: true,
                        experiencias: true,
                        proyectos: true,
                        educacion_extra: true,
                    }
                }
            }
        });

        if (!usuarioInfo || !usuarioInfo.estudiante) {
            return { error: "Estudiante no encontrado" };
        }

        const estudiante = usuarioInfo.estudiante;

        // Limpiar archivo viejo si existe
        if (estudiante.cv_url) {
            try {
                const oldFilePath = path.join(process.cwd(), "public", estudiante.cv_url);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            } catch (err) {
                console.error("Error al borrar cv anterior", err);
            }
        }

        // Preparar data para el PDF
        const dataParaPDF = {
            foto_perfil_url: estudiante.foto_perfil_url ? path.join(process.cwd(), "public", estudiante.foto_perfil_url) : undefined,
            nombre: estudiante.nombre,
            apellidoPaterno: estudiante.apellidoPaterno,
            apellidoMaterno: estudiante.apellidoMaterno || "",
            correo: usuarioInfo.correo,
            municipio: estudiante.municipio || "",
            estado: estudiante.estado || "",
            carrera: estudiante.carrera.nombre,
            habilidades: estudiante.habilidades,
            idiomas: estudiante.idiomas,
            bio: estudiante.bio || "",
            experiencias: estudiante.experiencias,
            proyectos: estudiante.proyectos,
            educacion_extra: estudiante.educacion_extra
        };

        // Renderizar PDF a buffer
        const buffer = await renderToBuffer(React.createElement(PlantillaCV, { data: dataParaPDF }));

        const timestamp = Date.now();
        const fileName = `cv-magic-${estudiante.matricula}-${timestamp}.pdf`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        fs.writeFileSync(filePath, buffer);

        const fileUrl = `/uploads/cvs/${fileName}`;

        // Actualizar URL en BD
        await prisma.estudiante.update({
            where: { id: estudiante.id },
            data: { cv_url: fileUrl },
        });

        revalidatePath("/perfil");
        revalidatePath("/perfil/editar/paso-3");
        await marcarPerfilCompletoSiAplica(estudiante.id);
        revalidateDashboardEstudiante();

        return { success: true, url: fileUrl };
    } catch (error) {
        console.error("Error al generar CV:", error);
        return { error: "Ocurrió un error al generar el CV automático" };
    }
}

export async function getEstudianteCVDataAction() {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };
    
    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            estudiante: {
                include: {
                    universidad: true,
                    carrera: true,
                    experiencias: true,
                    proyectos: true,
                    educacion_extra: true,
                }
            }
        }
    });

    if (!usuarioInfo || !usuarioInfo.estudiante) {
        return { error: "Estudiante no encontrado" };
    }

    const est = usuarioInfo.estudiante;
    
    // Obtener borrador si existe
    const draft = await prisma.magicCVDraft.findUnique({
        where: { estudianteId: est.id }
    });
    
    let base64PhotoStr = undefined;
    if (est.foto_perfil_url) {
        if (est.foto_perfil_url.startsWith('http')) {
            base64PhotoStr = est.foto_perfil_url; // Use remote url if it's external (s3, etc)
        } else {
            try {
                const photoPath = path.join(process.cwd(), 'public', est.foto_perfil_url);
                if (fs.existsSync(photoPath)) {
                    const bitmap = fs.readFileSync(photoPath);
                    const base64Data = bitmap.toString('base64');
                    const ext = path.extname(est.foto_perfil_url).toLowerCase();
                    let mimeType = 'image/jpeg';
                    if (ext === '.png') mimeType = 'image/png';
                    else if (ext === '.gif') mimeType = 'image/gif';
                    else if (ext === '.webp') mimeType = 'image/webp';
                    
                    base64PhotoStr = `data:${mimeType};base64,${base64Data}`;
                }
            } catch (err) {
                 console.error("Error al leer la foto de perfil para base64:", err);
            }
        }
    }

    const data = {
        nombre: est.nombre,
        apellidoPaterno: est.apellidoPaterno,
        apellidoMaterno: est.apellidoMaterno || "",
        correo: usuarioInfo.correo,
        municipio: est.municipio || "",
        estado: est.estado || "",
        carrera: est.carrera.nombre,
        habilidades: est.habilidades,
        idiomas: est.idiomas,
        bio: est.bio || "",
        foto_perfil_url: base64PhotoStr,
        experiencias: est.experiencias,
        proyectos: est.proyectos,
        educacion_extra: est.educacion_extra,
        // Inyectamos layout previo si existe
        draftConfig: draft ? {
            templateId: draft.templateId,
            colorAcento: draft.colorAcento,
            ...((draft.draftState as any) || {})
        } : null
    };

    return { success: true, data };
}

export async function saveMagicCVAction(formData: FormData) {
    try {
        const session = await getSession();
        if (!session) return { error: "No autorizado" };

        const estudiante = await prisma.estudiante.findUnique({
            where: { usuarioId: session.userId },
        });

        if (!estudiante) return { error: "Estudiante no encontrado" };

        const pdfBlob = formData.get("pdfBlob") as File | null;
        if (!pdfBlob) return { error: "No se generó el archivo PDF" };

        const updatedDataStr = formData.get("updatedData") as string | null;
        if (updatedDataStr) {
            const updatedData = JSON.parse(updatedDataStr);
            
            // 1. Update Bio on Estudiante
            await prisma.estudiante.update({
                where: { id: estudiante.id },
                data: {
                    bio: updatedData.bio,
                }
            });

            // 2. Safe Update for Experiencias
            if (updatedData.experiencias && Array.isArray(updatedData.experiencias)) {
                for (const exp of updatedData.experiencias) {
                    if (exp.id) {
                        try {
                            await prisma.experiencia.update({
                                where: { id: parseInt(exp.id, 10) || exp.id },
                                data: {
                                    puesto: exp.puesto,
                                    empresa: exp.empresa,
                                    logros: exp.logros
                                }
                            });
                        } catch (e) {
                            console.error("No se pudo actualizar la exp:", exp.id, e);
                        }
                    }
                }
            }

            // 3. Upsert Draft Config (Persistencia)
            if (updatedData.draftConfig) {
                await prisma.magicCVDraft.upsert({
                    where: { estudianteId: estudiante.id },
                    update: {
                        templateId: updatedData.draftConfig.templateId,
                        colorAcento: updatedData.draftConfig.accentColor,
                        draftState: {
                            showPhoto: updatedData.draftConfig.showPhoto,
                            sections: updatedData.draftConfig.sections
                        }
                    },
                    create: {
                        estudianteId: estudiante.id,
                        templateId: updatedData.draftConfig.templateId,
                        colorAcento: updatedData.draftConfig.accentColor,
                        draftState: {
                            showPhoto: updatedData.draftConfig.showPhoto,
                            sections: updatedData.draftConfig.sections
                        }
                    }
                });
            }
        }

        // Limpiar archivo viejo si existe
        if (estudiante.cv_url) {
            try {
                const oldFilePath = path.join(process.cwd(), "public", estudiante.cv_url);
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
            } catch (err) {
                console.error("Error al borrar cv anterior", err);
            }
        }

        const buffer = Buffer.from(await pdfBlob.arrayBuffer());
        const timestamp = Date.now();
        const fileName = `cv-magic-${estudiante.matricula}-${timestamp}.pdf`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        fs.writeFileSync(filePath, buffer);

        const fileUrl = `/uploads/cvs/${fileName}`;

        await prisma.estudiante.update({
            where: { id: estudiante.id },
            data: { cv_url: fileUrl },
        });

        revalidatePath("/perfil");
        revalidatePath("/perfil/editar/paso-3");
        await marcarPerfilCompletoSiAplica(estudiante.id);
        revalidateDashboardEstudiante();

        return { success: true, url: fileUrl };
    } catch (e) {
        console.error("Error al guardar Magic CV:", e);
        return { error: "Ocurrió un error al guardar tu CV interactivo." };
    }
}

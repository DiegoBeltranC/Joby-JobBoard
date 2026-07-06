"use server";

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import { PlantillaCV } from "@/lib/pdf/PlantillaCV";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { marcarPerfilCompletoSiAplica, revalidateDashboardEstudiante } from "@/lib/syncPerfilEstudiante";
import React from 'react';

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cvs");

function isPerfilVacio(estudiante: any) {
    const hasBio = !!estudiante.bio?.trim();
    const hasHabilidades = estudiante.habilidades && estudiante.habilidades.length > 0;
    const hasIdiomas = estudiante.idiomas && estudiante.idiomas.length > 0;
    const hasExperiencias = estudiante.experiencias && estudiante.experiencias.length > 0;
    const hasProyectos = estudiante.proyectos && estudiante.proyectos.length > 0;
    const hasEducacion = estudiante.educacion_extra && estudiante.educacion_extra.length > 0;

    return !hasBio && !hasHabilidades && !hasIdiomas && !hasExperiencias && !hasProyectos && !hasEducacion;
}

function isDraftPerfilVacio(estudiante: any, updatedData?: any) {
    const bio = updatedData?.bio !== undefined ? updatedData.bio : estudiante.bio;
    const hasBio = !!bio?.trim();
    
    const habilidades = updatedData?.habilidades !== undefined ? updatedData.habilidades : estudiante.habilidades;
    const hasHabilidades = habilidades && habilidades.length > 0;

    const idiomas = updatedData?.idiomas !== undefined ? updatedData.idiomas : estudiante.idiomas;
    const hasIdiomas = idiomas && idiomas.length > 0;
    
    const experiencias = updatedData?.experiencias !== undefined ? updatedData.experiencias : estudiante.experiencias;
    const hasExperiencias = experiencias && experiencias.length > 0;
    
    const proyectos = updatedData?.proyectos !== undefined ? updatedData.proyectos : estudiante.proyectos;
    const hasProyectos = proyectos && proyectos.length > 0;

    const educacion = updatedData?.educacion_extra !== undefined ? updatedData.educacion_extra : estudiante.educacion_extra;
    const hasEducacion = educacion && educacion.length > 0;

    return !hasBio && !hasHabilidades && !hasIdiomas && !hasExperiencias && !hasProyectos && !hasEducacion;
}


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

        if (isPerfilVacio(estudiante)) {
            return { error: "No puedes generar un currículum vacío. Por favor, añade información a tu perfil primero (como biografía, habilidades o experiencia laboral)." };
        }

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

        // Buscar borrador previo para conservar estilos y ordenamiento
        const draft = await prisma.magicCVDraft.findUnique({
            where: { estudianteId: estudiante.id }
        });

        let accentColor = '#0F766E';
        let showPhoto = true;
        let templateInfo = undefined;
        let styling = undefined;

        if (draft) {
            accentColor = draft.colorAcento;
            const draftState = (draft.draftState as any) || {};
            showPhoto = draftState.showPhoto ?? true;
            
            const tId = draft.templateId || '1';
            const PLANTILLAS_CONFIG = [
              { id: '1', base: 'moderno', variante: 'classic' },
              { id: '2', base: 'moderno', variante: 'left' },
              { id: '3', base: 'moderno', variante: 'compact' },
              { id: '4', base: 'minimalista', variante: 'classic' },
              { id: '5', base: 'minimalista', variante: 'modern' },
              { id: '6', base: 'ejecutivo', variante: 'classic' },
              { id: '7', base: 'ejecutivo', variante: 'modern' },
              { id: '8', base: 'creativo', variante: 'classic' },
              { id: '9', base: 'creativo', variante: 'split' },
              { id: '10', base: 'minimalista_centrado', variante: 'classic' },
              { id: '11', base: 'creativo', variante: 'cards' },
              { id: '12', base: 'minimalista_centrado', variante: 'clean' },
              { id: '13', base: 'tradicional', variante: 'serif' }
            ];
            const currentT = PLANTILLAS_CONFIG.find(t => t.id === tId) || PLANTILLAS_CONFIG[0];
            templateInfo = {
                base: currentT.base,
                variante: currentT.variante,
                sections: draftState.sections
            };
            styling = {
                fontSize: draftState.fontSize,
                lineSpacing: draftState.lineSpacing,
                fontFamily: draftState.fontFamily
            };
        }

        // Renderizar PDF a buffer
        const buffer = await renderToBuffer(React.createElement(PlantillaCV, { 
            data: dataParaPDF,
            accentColor,
            showPhoto,
            templateInfo,
            styling
        }) as React.ReactElement<DocumentProps>);

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
            include: {
                experiencias: true,
                proyectos: true,
                educacion_extra: true,
            }
        });

        if (!estudiante) return { error: "Estudiante no encontrado" };

        const pdfBlob = formData.get("pdfBlob") as File | null;
        if (!pdfBlob) return { error: "No se generó el archivo PDF" };

        const updatedDataStr = formData.get("updatedData") as string | null;
        let updatedData = null;
        if (updatedDataStr) {
            updatedData = JSON.parse(updatedDataStr);
        }

        if (isDraftPerfilVacio(estudiante, updatedData)) {
            return { error: "No puedes generar un currículum vacío. Por favor, añade información a tu perfil primero (como biografía, habilidades o experiencia laboral)." };
        }

        if (updatedData) {
            
            // 1. Update Bio, Habilidades e Idiomas on Estudiante
            await prisma.estudiante.update({
                where: { id: estudiante.id },
                data: {
                    bio: updatedData.bio,
                    habilidades: updatedData.habilidades || [],
                    idiomas: updatedData.idiomas || []
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

            // Safe Update for Proyectos
            if (updatedData.proyectos && Array.isArray(updatedData.proyectos)) {
                for (const proj of updatedData.proyectos) {
                    if (proj.id) {
                        try {
                            await prisma.proyecto.update({
                                where: { id: parseInt(proj.id, 10) || proj.id },
                                data: {
                                    nombre: proj.nombre,
                                    puntos_clave: proj.puntos_clave
                                }
                            });
                        } catch (e) {
                            console.error("No se pudo actualizar el proj:", proj.id, e);
                        }
                    }
                }
            }

            // Safe Update for Educacion Extra
            if (updatedData.educacion_extra && Array.isArray(updatedData.educacion_extra)) {
                for (const edu of updatedData.educacion_extra) {
                    if (edu.id) {
                        try {
                            await prisma.educacionExtra.update({
                                where: { id: parseInt(edu.id, 10) || edu.id },
                                data: {
                                    titulo: edu.titulo,
                                    institucion: edu.institucion,
                                    año: edu.año ? parseInt(edu.año, 10) || null : null
                                }
                            });
                        } catch (e) {
                            console.error("No se pudo actualizar la edu:", edu.id, e);
                        }
                    }
                }
            }

            // 3. Upsert Draft Config (Persistencia Completa)
            if (updatedData.draftConfig) {
                const draftPayload = {
                    showPhoto: updatedData.draftConfig.showPhoto,
                    sections: updatedData.draftConfig.sections,
                    fontSize: updatedData.draftConfig.fontSize,
                    lineSpacing: updatedData.draftConfig.lineSpacing,
                    fontFamily: updatedData.draftConfig.fontFamily,
                    singlePage: updatedData.draftConfig.singlePage,
                    showCarrera: updatedData.draftConfig.showCarrera,
                    hiddenExperiences: updatedData.draftConfig.hiddenExperiences || [],
                    hiddenProjects: updatedData.draftConfig.hiddenProjects || [],
                    hiddenEducations: updatedData.draftConfig.hiddenEducations || []
                };
                await prisma.magicCVDraft.upsert({
                    where: { estudianteId: estudiante.id },
                    update: {
                        templateId: updatedData.draftConfig.templateId,
                        colorAcento: updatedData.draftConfig.accentColor,
                        draftState: draftPayload
                    },
                    create: {
                        estudianteId: estudiante.id,
                        templateId: updatedData.draftConfig.templateId,
                        colorAcento: updatedData.draftConfig.accentColor,
                        draftState: draftPayload
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

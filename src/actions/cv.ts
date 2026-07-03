"use server";

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { marcarPerfilCompletoSiAplica, revalidateDashboardEstudiante } from "@/lib/syncPerfilEstudiante";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cvs");

export async function uploadCVAction(formData: FormData) {
    try {
        const session = await getSession();
        if (!session) return { error: "No autorizado" };

        const estudiante = await prisma.estudiante.findUnique({
            where: { usuarioId: session.userId },
        });

        if (!estudiante) return { error: "Estudiante no encontrado" };

        const file = formData.get("cv") as File | null;
        if (!file) return { error: "No se proporcionó ningún archivo" };

        if (file.type !== "application/pdf") {
            return { error: "Solo se permiten archivos PDF" };
        }

        if (file.size > 5 * 1024 * 1024) {
            return { error: "El archivo no debe superar los 5MB" };
        }

        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        // Si ya hay un cv viejo, borrarlo
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

        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const fileName = `cv-${estudiante.matricula}-${timestamp}.pdf`;
        const filePath = path.join(UPLOAD_DIR, fileName);

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
    } catch (error) {
        console.error("Error al subir CV:", error);
        return { error: "Ocurrió un error al guardar el archivo" };
    }
}

export async function deleteCVAction() {
    try {
        const session = await getSession();
        if (!session) return { error: "No autorizado" };

        const estudiante = await prisma.estudiante.findUnique({
            where: { usuarioId: session.userId },
        });

        if (!estudiante) return { error: "Estudiante no encontrado" };

        if (!estudiante.cv_url) {
            return { error: "El estudiante no tiene un CV registrado" };
        }

        try {
            const oldFilePath = path.join(process.cwd(), "public", estudiante.cv_url);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        } catch (err) {
            console.error("Error al borrar cv físico", err);
        }

        await prisma.estudiante.update({
            where: { id: estudiante.id },
            data: { cv_url: null },
        });

        revalidatePath("/perfil");
        revalidatePath("/perfil/editar/paso-3");
        await marcarPerfilCompletoSiAplica(estudiante.id);
        revalidateDashboardEstudiante();

        return { success: true };
    } catch (error) {
        console.error("Error al eliminar CV:", error);
        return { error: "Ocurrió un error al eliminar el archivo" };
    }
}

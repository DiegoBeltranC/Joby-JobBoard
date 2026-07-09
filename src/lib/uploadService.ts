import fs from "fs/promises";
import path from "path";

export async function guardarArchivo(file: File, subcarpeta: string, prefijo: string): Promise<string> {
    // 1. Convertimos el archivo a un Buffer de Node.js
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Convertimos el Buffer a un string Base64 (Data URL)
    // Esto es ideal para Vercel porque no escribe en el disco duro (que es Read-Only)
    const mimeType = file.type || 'image/jpeg';
    const base64Data = buffer.toString('base64');

    // 3. Retornamos la URL en formato base64 que se guardará en Prisma
    return `data:${mimeType};base64,${base64Data}`;
}

export async function eliminarArchivo(urlPublica: string | null | undefined) {
    // Al usar Base64, la imagen vive en la base de datos de Prisma
    // y no hay ningún archivo físico que borrar en Vercel.
    return;
}
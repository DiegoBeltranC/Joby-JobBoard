import fs from "fs/promises";
import path from "path";

// Esta función es nuestra interfaz escalable. 
export async function guardarArchivo(file: File, subcarpeta: string, prefijo: string): Promise<string> {

    // 1. Convertimos el archivo a un Buffer de Node.js
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Generamos un nombre único para evitar colisiones
    // Ej: avatar-12345-167890123.jpg
    const extension = file.name.split('.').pop() || 'png';
    const nombreArchivo = `${prefijo}-${Date.now()}.${extension}`;

    // 3. Ruta donde se guardará (Local para desarrollo/exposiciones)
    const uploadDir = path.join(process.cwd(), "public", "uploads", subcarpeta);
    const filePath = path.join(uploadDir, nombreArchivo);

    // 4. Aseguramos que la carpeta exista (si no, la crea)
    await fs.mkdir(uploadDir, { recursive: true });

    // 5. Guardamos el archivo
    await fs.writeFile(filePath, buffer);

    // 6. Retornamos la URL pública que se guardará en Prisma
    return `/uploads/${subcarpeta}/${nombreArchivo}`;

    /* 💡 NOTA PARA EL FUTURO:
       Cuando subas a producción en la nube, borrarás las líneas 3 a 5, 
       y aquí pondrás el código del SDK de AWS S3 o Cloudinary. 
       Y retornarás la URL de la nube.
    */
}

export async function eliminarArchivo(urlPublica: string | null | undefined) {
    if (!urlPublica || !urlPublica.startsWith('/uploads/')) return;
    try {
        const filePath = path.join(process.cwd(), "public", urlPublica);
        await fs.unlink(filePath);
    } catch (error) {
        console.error("Error al intentar eliminar el archivo físico:", error);
    }
}
"use server"
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { guardarArchivo, eliminarArchivo } from "@/lib/uploadService";
import { toTitleCase } from "@/lib/toTitleCase";
import { calcularProgresoEmpresa } from "@/lib/perfilEmpresa";

// =============================================================================
// PASO 1: Datos Legales y Ubicación
// =============================================================================
export async function guardarPaso1Empresa(data: {
    rfc: string;
    razon_social: string;
    estado: string;
    municipio: string;
}) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        // Verificar que el RFC no esté ya en uso por OTRA empresa
        if (data.rfc) {
            const rfcExistente = await prisma.empresa.findFirst({
                where: {
                    rfc: data.rfc,
                    NOT: { usuarioId: session.userId }
                }
            });
            if (rfcExistente) return { error: "Este RFC ya está registrado por otra empresa." };
        }

        await prisma.empresa.update({
            where: { usuarioId: session.userId },
            data: {
                rfc: data.rfc || null,
                razon_social: data.razon_social || null,
                estado: data.estado,
                municipio: data.municipio,
            }
        });
        revalidatePath("/empresa/perfil-empresa");
        return { success: true };
    } catch (error) {
        console.error("Error guardando paso 1 empresa:", error);
        return { error: "Error al guardar los datos legales" };
    }
}

// =============================================================================
// PASO 2: Datos del Reclutador (con auto-capitalización)
// =============================================================================
export async function guardarPaso2Empresa(data: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    cargo_contacto: string;
    telefono_contacto?: string;
}) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        await prisma.empresa.update({
            where: { usuarioId: session.userId },
            data: {
                nombre: toTitleCase(data.nombre),
                apellidoPaterno: toTitleCase(data.apellidoPaterno),
                apellidoMaterno: data.apellidoMaterno ? toTitleCase(data.apellidoMaterno) : null,
                cargo_contacto: toTitleCase(data.cargo_contacto),
                telefono_contacto: data.telefono_contacto || null,
            }
        });
        revalidatePath("/empresa/perfil-empresa");
        return { success: true };
    } catch (error) {
        console.error("Error guardando paso 2 empresa:", error);
        return { error: "Error al guardar los datos del reclutador" };
    }
}

// =============================================================================
// PASO 3: Marketing (Descripción, Sitio Web, Enlaces)
// =============================================================================
export async function guardarPaso3Empresa(data: {
    descripcion?: string;
    sitio_web?: string;
    linkedin?: string;
    facebook?: string;
}) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        await prisma.empresa.update({
            where: { usuarioId: session.userId },
            data: {
                descripcion: data.descripcion || null,
                sitio_web: data.sitio_web || null,
                enlaces: {
                    linkedin: data.linkedin || "",
                    facebook: data.facebook || "",
                }
            }
        });
        revalidatePath("/empresa/perfil-empresa");
        return { success: true };
    } catch (error) {
        console.error("Error guardando paso 3 empresa:", error);
        return { error: "Error al guardar la información de marketing" };
    }
}

// =============================================================================
// LOGO: Subir y eliminar logo de empresa
// =============================================================================
export async function actualizarLogoEmpresa(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    const archivo = formData.get("logo") as File;
    if (!archivo || archivo.size === 0) return { error: "No se recibió ninguna imagen" };

    // Validar peso (máximo 2MB)
    if (archivo.size > 2 * 1024 * 1024) return { error: "La imagen no debe pesar más de 2MB" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { empresa: true } });
        if (!usuario?.empresa) return { error: "Empresa no encontrada" };

        // 1. Borramos el viejo si existía
        if (usuario.empresa.logo_url) {
            await eliminarArchivo(usuario.empresa.logo_url);
        }

        // Usamos el servicio escalable (misma interfaz que el avatar de estudiante)
        const urlLogo = await guardarArchivo(archivo, "logos", `logo-${usuario.empresa.id}`);

        await prisma.empresa.update({
            where: { id: usuario.empresa.id },
            data: { logo_url: urlLogo }
        });

        revalidatePath("/empresa/perfil-empresa");
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar logo:", error);
        return { error: "Error interno al guardar el logo" };
    }
}

export async function eliminarLogoEmpresa() {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { empresa: true } });
        if (!usuario?.empresa) return { error: "Empresa no encontrada" };

        // Eliminamos el archivo del servidor
        if (usuario.empresa.logo_url) {
            await eliminarArchivo(usuario.empresa.logo_url);
        }

        await prisma.empresa.update({
            where: { id: usuario.empresa.id },
            data: { logo_url: null }
        });

        revalidatePath("/empresa/perfil-empresa");
        return { success: true };
    } catch (error) {
        return { error: "No se pudo eliminar el logo" };
    }
}

// =============================================================================
// BANNER: Subir y eliminar banner de empresa (Panorámico)
// =============================================================================
export async function actualizarBannerEmpresa(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    const archivo = formData.get("banner") as File;
    if (!archivo || archivo.size === 0) return { error: "No se recibió ninguna imagen" };

    if (archivo.size > 3 * 1024 * 1024) return { error: "El banner no debe pesar más de 3MB" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { empresa: true } });
        if (!usuario?.empresa) return { error: "Empresa no encontrada" };

        if (usuario.empresa.banner_url) {
            await eliminarArchivo(usuario.empresa.banner_url);
        }

        const urlBanner = await guardarArchivo(archivo, "banners", `banner-${usuario.empresa.id}`);

        await prisma.empresa.update({
            where: { id: usuario.empresa.id },
            data: { banner_url: urlBanner }
        });

        revalidatePath("/empresa/perfil-empresa");
        revalidatePath(`/perfil-publico-empresa/${usuario.empresa.id}`);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar banner:", error);
        return { error: "Error interno al guardar el banner" };
    }
}

export async function eliminarBannerEmpresa() {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { empresa: true } });
        if (!usuario?.empresa) return { error: "Empresa no encontrada" };

        if (usuario.empresa.banner_url) {
            await eliminarArchivo(usuario.empresa.banner_url);
        }

        await prisma.empresa.update({
            where: { id: usuario.empresa.id },
            data: { banner_url: null }
        });

        revalidatePath("/empresa/perfil-empresa");
        return { success: true };
    } catch (error) {
        return { error: "No se pudo eliminar el banner" };
    }
}

// =============================================================================
// FOTOS DE INSTALACIONES: Agregar y eliminar
// =============================================================================
export async function agregarFotoEmpresa(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    const archivo = formData.get("foto") as File;
    if (!archivo || archivo.size === 0) return { error: "No se recibió ninguna imagen" };

    if (archivo.size > 2 * 1024 * 1024) return { error: "La imagen no debe pesar más de 2MB" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { empresa: true } });
        if (!usuario?.empresa) return { error: "Empresa no encontrada" };

        // Límite de 5 fotos
        if (usuario.empresa.fotos_empresa.length >= 5) {
            return { error: "Máximo 5 fotos permitidas. Elimina una para subir otra." };
        }

        const urlFoto = await guardarArchivo(archivo, "empresas-fotos", `empresa-${usuario.empresa.id}`);

        await prisma.empresa.update({
            where: { id: usuario.empresa.id },
            data: {
                fotos_empresa: {
                    push: urlFoto
                }
            }
        });

        revalidatePath("/empresa/perfil-empresa");
        return { success: true, url: urlFoto };
    } catch (error) {
        console.error("Error al agregar foto:", error);
        return { error: "Error al subir la foto" };
    }
}

export async function eliminarFotoEmpresa(urlFoto: string) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { empresa: true } });
        if (!usuario?.empresa) return { error: "Empresa no encontrada" };

        // Borramos el archivo físico
        await eliminarArchivo(urlFoto);

        // Filtramos la foto eliminada del array
        const fotosActualizadas = usuario.empresa.fotos_empresa.filter(url => url !== urlFoto);

        await prisma.empresa.update({
            where: { id: usuario.empresa.id },
            data: { fotos_empresa: fotosActualizadas }
        });

        revalidatePath("/empresa/perfil-empresa");
        return { success: true };
    } catch (error) {
        return { error: "No se pudo eliminar la foto" };
    }
}

// =============================================================================
// ENVIAR SOLICITUD DE VERIFICACIÓN
// =============================================================================
export async function enviarSolicitudVerificacion() {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { empresa: true } });
        if (!usuario?.empresa) return { error: "Empresa no encontrada" };

        // Solo permitir si el estatus es SIN_ENVIAR o REQUIERE_CAMBIOS
        if (usuario.empresa.estatus_verificacion !== "SIN_ENVIAR" && usuario.empresa.estatus_verificacion !== "REQUIERE_CAMBIOS") {
            return { error: "Tu solicitud ya fue enviada o no se puede reenviar." };
        }

        const empresa = usuario.empresa;
        const { progreso } = calcularProgresoEmpresa(empresa);

        if (progreso < 100) {
            return { error: `Tu perfil está al ${progreso}%. Complétalo al 100% para poder enviar la solicitud.` };
        }

        await prisma.empresa.update({
            where: { id: empresa.id },
            data: {
                estatus_verificacion: "PENDIENTE",
                motivo_rechazo: null, // Limpiar el motivo de rechazo anterior si existía
            }
        });

        revalidatePath("/empresa");
        return { success: true };
    } catch (error) {
        console.error("Error al enviar solicitud:", error);
        return { error: "Error al enviar la solicitud de verificación" };
    }
}

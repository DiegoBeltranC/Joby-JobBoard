"use server"
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { guardarArchivo, eliminarArchivo } from "@/lib/uploadService";
import { DisponibilidadReubicacion, TipoContrato } from "@prisma/client";
import { marcarPerfilCompletoSiAplica, revalidateDashboardEstudiante } from "@/lib/syncPerfilEstudiante";
import { sendEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

async function sincronizarHitoPerfilEstudiante(usuarioId: number): Promise<boolean> {
    const usuario = await prisma.user.findUnique({
        where: { id: usuarioId },
        include: { estudiante: true },
    });
    if (!usuario?.estudiante) return false;

    const recienCompletado = await marcarPerfilCompletoSiAplica(usuario.estudiante.id);
    revalidateDashboardEstudiante();
    revalidatePath("/perfil");
    revalidatePath("/perfil/editar/paso-1");
    revalidatePath("/perfil/editar/paso-2");
    revalidatePath("/perfil/editar/paso-3");
    return recienCompletado;
}


export async function guardarPaso1(data: {
    estado: string;
    municipio: string;
    reubicacion: DisponibilidadReubicacion;
    tipos_contrato: TipoContrato[]; // 👈 Nuevo
    bio: string
}) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        await prisma.estudiante.update({
            where: { usuarioId: session.userId },
            data: {
                estado: data.estado,
                municipio: data.municipio,
                reubicacion: data.reubicacion,
                tipos_contrato: data.tipos_contrato, // 👈 Guardamos el arreglo
                bio: data.bio,
            }
        });
        await sincronizarHitoPerfilEstudiante(session.userId);
        return { success: true };
    } catch (error) {
        return { error: "Error al guardar los datos" };
    }
}

// En actions/perfil.ts (Añade esta función al final)

export async function guardarPaso2(data: { habilidades: string[]; idiomas: string[] }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        await prisma.estudiante.update({
            where: { usuarioId: session.userId },
            data: {
                // Sanitización final en el servidor por seguridad
                habilidades: data.habilidades.map(h => h.trim().charAt(0).toUpperCase() + h.trim().slice(1).toLowerCase()),
                idiomas: data.idiomas,
            }
        });
        await sincronizarHitoPerfilEstudiante(session.userId);
        return { success: true };
    } catch (error) {
        return { error: "Error al guardar habilidades" };
    }
}

// En actions/perfil.ts (Añade al final)

export async function guardarPaso3(data: { linkedin?: string; github?: string }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        await prisma.estudiante.update({
            where: { usuarioId: session.userId },
            data: {
                // Guardamos los links dentro del objeto Json 'enlaces'
                enlaces: {
                    linkedin: data.linkedin || "",
                    github: data.github || ""
                }
            }
        });
    } catch (error) {
        console.error("Error guardando paso 3:", error);
        return { error: "Error al guardar los enlaces" };
    }

    const recienCompletado = await sincronizarHitoPerfilEstudiante(session.userId);
    return { success: true, recienCompletado };
}


export async function agregarProyecto(data: { nombre: string; url_enlace?: string; puntos_clave: string[]; fechaInicio: string; fechaFin: string | null }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.proyecto.create({
            data: {
                estudianteId: usuario.estudiante.id,
                nombre: data.nombre,
                url_enlace: data.url_enlace || null,
                puntos_clave: data.puntos_clave,
                fechaInicio: new Date(data.fechaInicio + "T12:00:00Z"), // T12 Evita desfases de día
                fechaFin: data.fechaFin ? new Date(data.fechaFin + "T12:00:00Z") : null,
            }
        });
        await sincronizarHitoPerfilEstudiante(session.userId);
        return { success: true };
    } catch (error) {
        console.log(error);
        return { error: "Error al guardar el proyecto" };
    }
}

export async function editarProyecto(id: number, data: { nombre: string; url_enlace?: string; puntos_clave: string[]; fechaInicio: string; fechaFin: string | null }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.proyecto.update({
            where: { id: id, estudianteId: usuario.estudiante.id }, // Doble validación de seguridad
            data: {
                nombre: data.nombre,
                url_enlace: data.url_enlace || null,
                puntos_clave: data.puntos_clave,
                fechaInicio: new Date(data.fechaInicio + "T12:00:00Z"),
                fechaFin: data.fechaFin ? new Date(data.fechaFin + "T12:00:00Z") : null,
            }
        });
        await sincronizarHitoPerfilEstudiante(session.userId);
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar el proyecto" };
    }
}

// En actions/perfil.ts
export async function eliminarProyecto(proyectoId: number) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        // Borramos el proyecto asegurándonos de que pertenezca al usuario logueado
        // (Por seguridad, primero buscamos el estudianteId)
        const usuario = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { estudiante: true }
        });

        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.proyecto.delete({
            where: {
                id: proyectoId,
                estudianteId: usuario.estudiante.id // 👈 Doble candado de seguridad
            }
        });

        await sincronizarHitoPerfilEstudiante(session.userId);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar proyecto:", error);
        return { error: "No se pudo eliminar el proyecto" };
    }
}

// En actions/perfil.ts

export async function agregarExperiencia(data: { puesto: string; empresa: string; logros: string[]; fechaInicio: string; fechaFin: string | null }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.experiencia.create({
            data: {
                estudianteId: usuario.estudiante.id,
                puesto: data.puesto,
                empresa: data.empresa, // 👈 Nuevo campo
                logros: data.logros,   // 👈 Equivalente a puntos_clave
                fechaInicio: new Date(data.fechaInicio + "T12:00:00Z"),
                fechaFin: data.fechaFin ? new Date(data.fechaFin + "T12:00:00Z") : null,
            }
        });
        await sincronizarHitoPerfilEstudiante(session.userId);
        return { success: true };
    } catch (error) {
        console.error("Error al guardar la experiencia:", error);
        return { error: "Error al guardar la experiencia" };
    }
}

export async function editarExperiencia(id: number, data: { puesto: string; empresa: string; logros: string[]; fechaInicio: string; fechaFin: string | null }) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.experiencia.update({
            where: { id: id, estudianteId: usuario.estudiante.id },
            data: {
                puesto: data.puesto,
                empresa: data.empresa,
                logros: data.logros,
                fechaInicio: new Date(data.fechaInicio + "T12:00:00Z"),
                fechaFin: data.fechaFin ? new Date(data.fechaFin + "T12:00:00Z") : null,
            }
        });
        await sincronizarHitoPerfilEstudiante(session.userId);
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar la experiencia" };
    }
}

export async function eliminarExperiencia(experienciaId: number) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        await prisma.experiencia.delete({
            where: { id: experienciaId, estudianteId: usuario.estudiante.id }
        });

        await sincronizarHitoPerfilEstudiante(session.userId);
        return { success: true };
    } catch (error) {
        return { error: "No se pudo eliminar la experiencia" };
    }
}

export async function actualizarFotoPerfil(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    const archivo = formData.get("foto") as File;
    if (!archivo || archivo.size === 0) return { error: "No se recibió ninguna imagen" };

    // Validar peso (Ej. máximo 2MB)
    if (archivo.size > 2 * 1024 * 1024) return { error: "La imagen no debe pesar más de 2MB" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        // 1. Eliminamos físico de la foto vieja si existía
        if (usuario.estudiante.foto_perfil_url) {
            await eliminarArchivo(usuario.estudiante.foto_perfil_url);
        }

        // 2. Usamos nuestro servicio escalable para guardar la imagen
        const urlFoto = await guardarArchivo(archivo, "avatars", `avatar-${usuario.estudiante.id}`);

        // 2. Actualizamos la base de datos
        await prisma.estudiante.update({
            where: { id: usuario.estudiante.id },
            data: { foto_perfil_url: urlFoto }
        });

        await sincronizarHitoPerfilEstudiante(session.userId);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar foto:", error);
        return { error: "Error interno al guardar la foto" };
    }
}

export async function eliminarFotoPerfil() {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    try {
        const usuario = await prisma.user.findUnique({ where: { id: session.userId }, include: { estudiante: true } });
        if (!usuario?.estudiante) return { error: "Estudiante no encontrado" };

        // Eliminamos el archivo físico del servidor
        if (usuario.estudiante.foto_perfil_url) {
            await eliminarArchivo(usuario.estudiante.foto_perfil_url);
        }

        await prisma.estudiante.update({
            where: { id: usuario.estudiante.id },
            data: { foto_perfil_url: null }
        });

        await sincronizarHitoPerfilEstudiante(session.userId);
        return { success: true };
    } catch (error) {
        return { error: "No se pudo eliminar la foto" };
    }
}

export async function actualizarConfiguracionEstudiante(data: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    matricula: string;
    carreraId: number;
}) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    if (!data.nombre.trim()) return { error: "El nombre es requerido" };
    if (!data.apellidoPaterno.trim()) return { error: "El apellido paterno es requerido" };
    if (!/^\d{10}$/.test(data.matricula.trim())) {
        return { error: "La matrícula debe tener exactamente 10 números" };
    }

    try {
        const usuario = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { estudiante: { include: { carrera: true } } }
        });

        if (!usuario || !usuario.estudiante) {
            return { error: "Estudiante no encontrado" };
        }

        const estudiante = usuario.estudiante;

        // Validar matrícula única
        const estudianteExistente = await prisma.estudiante.findFirst({
            where: {
                matricula: data.matricula.trim(),
                NOT: {
                    usuarioId: session.userId
                }
            }
        });

        if (estudianteExistente) {
            return { error: "Esta matrícula ya está registrada por otro estudiante" };
        }

        // 1. Detección de cambios y validación de Cooldown del Nombre
        const nombreCambio =
            estudiante.nombre !== data.nombre.trim() ||
            estudiante.apellidoPaterno !== data.apellidoPaterno.trim() ||
            (estudiante.apellidoMaterno || "") !== (data.apellidoMaterno?.trim() || "");

        if (nombreCambio) {
            // Verificar cooldown de 30 días
            if (estudiante.nombre_modificado_at) {
                const msTranscurridos = Date.now() - new Date(estudiante.nombre_modificado_at).getTime();
                const diasTranscurridos = msTranscurridos / (1000 * 60 * 60 * 24);
                if (diasTranscurridos < 30) {
                    return { error: "No puedes modificar tu nombre todavía. Cooldown de 30 días activo." };
                }
            }
        }

        // 2. Detección de cambios y validación de Carrera
        const carreraCambio = estudiante.carreraId !== data.carreraId;

        if (carreraCambio) {
            if (estudiante.cambio_carrera_usado) {
                return { error: "Ya has utilizado tu único cambio de carrera permitido." };
            }
        }

        // Preparar datos para actualización
        const updateData: any = {
            nombre: data.nombre.trim(),
            apellidoPaterno: data.apellidoPaterno.trim(),
            apellidoMaterno: data.apellidoMaterno?.trim() || null,
            carreraId: data.carreraId,
        };

        if (nombreCambio) {
            updateData.nombre_modificado_at = new Date();
        }

        if (carreraCambio) {
            updateData.cambio_carrera_usado = true;
        }

        // Realizar la actualización en la BD
        await prisma.estudiante.update({
            where: { usuarioId: session.userId },
            data: updateData
        });

        // 3. Enviar correo de notificación consolidado
        if (nombreCambio || carreraCambio) {
            let detalles = "Se han realizado cambios de seguridad importantes en tu perfil:\n\n";

            if (nombreCambio) {
                detalles += `* Nombre modificado de:\n  "${estudiante.nombre} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno || ""}"\n  a:\n  "${data.nombre.trim()} ${data.apellidoPaterno.trim()} ${data.apellidoMaterno?.trim() || ""}"\n\n`;
            }

            if (carreraCambio) {
                const nuevaCarrera = await prisma.carrera.findUnique({
                    where: { id: data.carreraId }
                });
                detalles += `* Carrera modificada de:\n  "${estudiante.carrera.nombre}"\n  a:\n  "${nuevaCarrera?.nombre || "Nueva Carrera"}"\n\n`;
            }

            await sendEmail({
                to: usuario.correo,
                subject: "Cambios de seguridad en tu cuenta - Joby",
                title: "¡Configuración de Perfil Actualizada!",
                message: `${detalles}Si no realizaste estos cambios, por favor cambia tu contraseña inmediatamente o contacta a soporte.`,
                type: "WARNING"
            });
        }

        await sincronizarHitoPerfilEstudiante(session.userId);
        revalidatePath("/perfil");
        revalidatePath("/inicio");
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar la configuración:", error);
        return { error: "Error interno al actualizar la configuración" };
    }
}

export async function actualizarPasswordEstudiante(data: {
    passwordActual: string;
    passwordNuevo: string;
}) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    if (!data.passwordActual || !data.passwordNuevo) {
        return { error: "Todos los campos son obligatorios" };
    }

    if (data.passwordNuevo.length < 8) {
        return { error: "La nueva contraseña debe tener al menos 8 caracteres" };
    }

    try {
        const usuario = await prisma.user.findUnique({
            where: { id: session.userId }
        });

        if (!usuario) return { error: "Usuario no encontrado" };

        const passwordMatch = await bcrypt.compare(data.passwordActual, usuario.password_hash);
        if (!passwordMatch) {
            return { error: "La contraseña actual es incorrecta" };
        }

        const hashed = await bcrypt.hash(data.passwordNuevo, 10);

        await prisma.user.update({
            where: { id: session.userId },
            data: { password_hash: hashed }
        });

        // Enviar correo de aviso de seguridad
        await sendEmail({
            to: usuario.correo,
            subject: "Tu contraseña ha sido cambiada - Joby",
            title: "¡Contraseña Actualizada!",
            message: `Hola,\n\nTe informamos que la contraseña de tu cuenta en la Bolsa Educativa Joby ha sido actualizada con éxito.\n\nSi no realizaste este cambio, por favor contacta a soporte de inmediato.`,
            type: "WARNING"
        });

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        return { error: "Error interno al actualizar la contraseña" };
    }
}

export async function suspenderCuentaEstudiante(data: {
    passwordActual: string;
}) {
    const session = await getSession();
    if (!session) return { error: "No autorizado" };

    if (!data.passwordActual) {
        return { error: "La contraseña es requerida para confirmar" };
    }

    try {
        const usuario = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { estudiante: true }
        });

        if (!usuario) return { error: "Usuario no encontrado" };

        const passwordMatch = await bcrypt.compare(data.passwordActual, usuario.password_hash);
        if (!passwordMatch) {
            return { error: "La contraseña actual es incorrecta" };
        }

        const estudianteId = usuario.estudiante?.id;
        if (!estudianteId) {
            return { error: "Estudiante no encontrado" };
        }

        // 1. Borrar todas sus postulaciones inmediatamente
        await prisma.postulacion.deleteMany({
            where: { estudianteId }
        });

        // 2. Establecer deletedAt y scheduledDeletionAt (+15 días)
        const fechaLimite = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
        await prisma.user.update({
            where: { id: session.userId },
            data: {
                deletedAt: new Date(),
                scheduledDeletionAt: fechaLimite
            }
        });

        // 3. Enviar correo de aviso
        const fechaFormateada = fechaLimite.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        await sendEmail({
            to: usuario.correo,
            subject: "Aviso: Proceso de eliminación de cuenta iniciado - Joby",
            title: "Proceso de eliminación iniciado",
            message: `Hola,\n\nTe informamos que tu solicitud para suspender y eliminar tu cuenta ha sido procesada.\n\n* Tu perfil ya no es visible para las empresas.\n* Todas tus postulaciones activas han sido eliminadas.\n* Tienes hasta el ${fechaFormateada} para reactivar tu cuenta iniciando sesión y aceptando el aviso que aparecerá.\n\nSi no realizaste esta solicitud, inicia sesión inmediatamente para cancelar el proceso.`,
            type: "WARNING"
        });

        return { success: true };
    } catch (error) {
        console.error("Error al suspender cuenta:", error);
        return { error: "Error interno al suspender la cuenta" };
    }
}
"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { EstatusVacante } from "@prisma/client"
import { esFechaCierreVacanteValida, parseFechaLimiteVacanteToLocalDate } from "@/lib/vacanteFechaLimite"
import { fechaLimiteVigente, ordenarVacantesPorEstatus } from "@/lib/vacanteEstatus"
import { sincronizarVacantesVencidas } from "@/lib/vacanteEstatus.server"

const vacanteSchema = z.object({
    titulo: z.string().min(5, "El título debe tener al menos 5 caracteres").max(100),
    descripcion: z.string().min(20, "La descripción debe ser más detallada (mín. 20 caracteres)"),
    tipo_contrato: z.enum(["ESTADIA", "MEDIO_TIEMPO", "TIEMPO_COMPLETO"]),
    modalidad: z.enum(["PRESENCIAL", "HIBRIDO", "REMOTO"]),
    estado: z.string().min(2, "Selecciona un estado"),
    municipio: z.string().min(2, "Selecciona un municipio"),
    habilidades_req: z.array(z.string()),
    idiomas_req: z.array(z.string()),
    sueldo_min: z.number().optional().nullable(),
    sueldo_max: z.number().optional().nullable(),
    horario: z
        .string()
        .regex(
            /^([01][0-9]|2[0-3]):[0-5][0-9] - ([01][0-9]|2[0-3]):[0-5][0-9]$/,
            "Formato inválido. Usa: HH:mm - HH:mm (24h)"
        )
        .optional()
        .nullable(),
    fecha_limite: z
        .string()
        .min(1, "Selecciona la fecha de cierre de la vacante")
        .refine(esFechaCierreVacanteValida, {
            message: "La fecha de cierre debe ser como mínimo mañana",
        })
        .transform((val) => parseFechaLimiteVacanteToLocalDate(val)),
}).refine((data) => data.habilidades_req.length > 0 || data.idiomas_req.length > 0, {
    message: "Debes añadir al menos una habilidad o idioma requerido.",
    path: ["habilidades_req"],
})

function formatToLocalDateString(date: Date | null | undefined): string | null {
    if (!date) return null
    const d = new Date(date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

async function getEmpresaDeSesion() {
    const session = await getSession()
    if (!session) throw new Error("Sesión expirada o no válida. Por favor, inicia sesión de nuevo.")

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { empresa: true },
    })

    if (!usuario?.empresa) {
        throw new Error("No se encontró un perfil empresarial asociado a esta cuenta.")
    }

    return usuario.empresa
}

function revalidarRutasVacante() {
    revalidatePath("/empresa/vacantes")
    revalidatePath("/inicio")
}

export async function crearVacanteAction(datos: any) {
    try {
        const empresa = await getEmpresaDeSesion()

        if (empresa.estatus_verificacion !== "APROBADA") {
            throw new Error(
                "Acceso Denegado: Su cuenta corporativa aún no ha sido validada por la administración de la UTCH."
            )
        }

        const validacion = vacanteSchema.safeParse(datos)
        if (!validacion.success) {
            const issues = validacion.error.issues || []
            const erroresDetallados = issues
                .map((e) => `${(e.path || []).join(".") || "campo"}: ${e.message}`)
                .join(" | ")
            throw new Error(`Datos inválidos: ${erroresDetallados}`)
        }

        const data = validacion.data

        await prisma.vacante.create({
            data: {
                empresaId: empresa.id,
                titulo: data.titulo,
                descripcion: data.descripcion,
                tipo_contrato: data.tipo_contrato,
                modalidad: data.modalidad,
                estado: data.estado,
                municipio: data.municipio,
                habilidades_req: data.habilidades_req || [],
                idiomas_req: data.idiomas_req || [],
                sueldo_min: data.sueldo_min,
                sueldo_max: data.sueldo_max,
                horario: data.horario,
                fecha_limite: data.fecha_limite,
                estatus: EstatusVacante.ABIERTA,
            },
        })

        revalidarRutasVacante()
        return { success: true, message: "¡Vacante publicada exitosamente!" }
    } catch (error: any) {
        console.error("🔒 Error en crearVacanteAction:", error.message)
        return { success: false, error: error.message || "Error interno del servidor" }
    }
}

export async function editarVacanteAction(id: number, datos: any) {
    try {
        const empresa = await getEmpresaDeSesion()

        const vacanteExistente = await prisma.vacante.findUnique({
            where: { id, empresaId: empresa.id },
            include: {
                _count: { select: { postulaciones: true } },
            },
        })

        if (!vacanteExistente) {
            throw new Error("La vacante no existe o no tienes permiso para editarla.")
        }

        if (
            vacanteExistente.estatus === EstatusVacante.VENCIDA ||
            vacanteExistente.estatus === EstatusVacante.CERRADA
        ) {
            throw new Error(
                "Esta vacante ya no se puede editar. Extiende la convocatoria o consulta el historial de candidatos."
            )
        }

        const tienePostulaciones = vacanteExistente._count.postulaciones > 0
        if (tienePostulaciones && datos.tipo_contrato !== vacanteExistente.tipo_contrato) {
            throw new Error("No se puede modificar el tipo de contrato porque ya hay alumnos postulados.")
        }

        const fechaLimiteOriginal = formatToLocalDateString(vacanteExistente.fecha_limite)

        const schemaEdicion = z
            .object({
                titulo: z.string().min(5, "El título debe tener al menos 5 caracteres").max(100),
                descripcion: z
                    .string()
                    .min(20, "La descripción debe ser más detallada (mín. 20 caracteres)"),
                tipo_contrato: z.enum(["ESTADIA", "MEDIO_TIEMPO", "TIEMPO_COMPLETO"]),
                modalidad: z.enum(["PRESENCIAL", "HIBRIDO", "REMOTO"]),
                estado: z.string().min(2, "Selecciona un estado"),
                municipio: z.string().min(2, "Selecciona un municipio"),
                habilidades_req: z.array(z.string()),
                idiomas_req: z.array(z.string()),
                sueldo_min: z.number().optional().nullable(),
                sueldo_max: z.number().optional().nullable(),
                horario: z
                    .string()
                    .regex(
                        /^([01][0-9]|2[0-3]):[0-5][0-9] - ([01][0-9]|2[0-3]):[0-5][0-9]$/,
                        "Formato inválido. Usa: HH:mm - HH:mm (24h)"
                    )
                    .optional()
                    .nullable(),
                fecha_limite: z
                    .string()
                    .min(1, "Selecciona la fecha de cierre de la vacante")
                    .refine((val) => {
                        if (fechaLimiteOriginal && val === fechaLimiteOriginal) return true
                        return esFechaCierreVacanteValida(val)
                    }, {
                        message: "La fecha de cierre debe ser como mínimo mañana",
                    })
                    .transform((val) => parseFechaLimiteVacanteToLocalDate(val)),
            })
            .refine((data) => data.habilidades_req.length > 0 || data.idiomas_req.length > 0, {
                message: "Debes añadir al menos una habilidad o idioma requerido.",
                path: ["habilidades_req"],
            })

        const validacion = schemaEdicion.safeParse(datos)
        if (!validacion.success) {
            const issues = validacion.error.issues || []
            const erroresDetallados = issues
                .map((e) => `${(e.path || []).join(".") || "campo"}: ${e.message}`)
                .join(" | ")
            throw new Error(`Datos inválidos: ${erroresDetallados}`)
        }

        const data = validacion.data

        await prisma.vacante.update({
            where: { id },
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                tipo_contrato: data.tipo_contrato,
                modalidad: data.modalidad,
                estado: data.estado,
                municipio: data.municipio,
                habilidades_req: data.habilidades_req || [],
                idiomas_req: data.idiomas_req || [],
                sueldo_min: data.sueldo_min,
                sueldo_max: data.sueldo_max,
                horario: data.horario,
                fecha_limite: data.fecha_limite,
            },
        })

        revalidarRutasVacante()
        return { success: true, message: "¡Vacante actualizada exitosamente!" }
    } catch (error: any) {
        console.error("🔒 Error en editarVacanteAction:", error.message)
        return { success: false, error: error.message || "Error interno del servidor" }
    }
}

export async function getEstatusEmpresaAction() {
    const session = await getSession()
    if (!session) return "SIN_ENVIAR"

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { empresa: true },
    })

    return usuario?.empresa?.estatus_verificacion || "SIN_ENVIAR"
}

export async function obtenerVacantesEmpresa() {
    const session = await getSession()
    if (!session) return []

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { empresa: true },
    })

    if (!usuario?.empresa) return []

    await sincronizarVacantesVencidas(usuario.empresa.id)

    const vacantes = await prisma.vacante.findMany({
        where: { empresaId: usuario.empresa.id },
        include: {
            _count: { select: { postulaciones: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    return ordenarVacantesPorEstatus(vacantes)
}

export async function cambiarEstatusVacanteAction(
    id: number,
    nuevoEstatus: "ABIERTA" | "PAUSADA"
) {
    try {
        const empresa = await getEmpresaDeSesion()

        const vacante = await prisma.vacante.findUnique({
            where: { id, empresaId: empresa.id },
        })

        if (!vacante) throw new Error("Vacante no encontrada o no pertenece a tu empresa")

        if (vacante.estatus === EstatusVacante.CERRADA) {
            throw new Error("Esta vacante está cerrada y no se puede modificar.")
        }

        if (vacante.estatus === EstatusVacante.VENCIDA) {
            throw new Error(
                "La convocatoria ya venció. Usa «Extender convocatoria» para publicarla de nuevo."
            )
        }

        if (nuevoEstatus === "ABIERTA") {
            if (empresa.estatus_verificacion !== "APROBADA") {
                throw new Error(
                    "Acceso Denegado: Solo las empresas verificadas pueden publicar vacantes en la bolsa."
                )
            }
            if (!fechaLimiteVigente(vacante.fecha_limite)) {
                throw new Error(
                    "La fecha de cierre ya pasó. Extiende la convocatoria con una nueva fecha antes de reactivar."
                )
            }
            if (vacante.estatus !== EstatusVacante.PAUSADA) {
                throw new Error("Solo puedes reactivar vacantes que están pausadas.")
            }
        } else {
            if (vacante.estatus !== EstatusVacante.ABIERTA) {
                throw new Error("Solo puedes pausar vacantes que están abiertas.")
            }
        }

        await prisma.vacante.update({
            where: { id },
            data: {
                estatus:
                    nuevoEstatus === "ABIERTA"
                        ? EstatusVacante.ABIERTA
                        : EstatusVacante.PAUSADA,
            },
        })

        revalidarRutasVacante()
        return {
            success: true,
            message: nuevoEstatus === "ABIERTA" ? "Vacante reactivada" : "Vacante pausada",
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function extenderVacanteAction(id: number, fecha_limite: string) {
    try {
        const empresa = await getEmpresaDeSesion()

        if (empresa.estatus_verificacion !== "APROBADA") {
            throw new Error(
                "Acceso Denegado: Solo las empresas verificadas pueden publicar vacantes en la bolsa."
            )
        }

        const vacante = await prisma.vacante.findUnique({
            where: { id, empresaId: empresa.id },
        })

        if (!vacante) throw new Error("Vacante no encontrada o no pertenece a tu empresa")

        if (vacante.estatus === EstatusVacante.CERRADA) {
            throw new Error("Esta vacante está cerrada definitivamente.")
        }

        if (!esFechaCierreVacanteValida(fecha_limite.trim())) {
            throw new Error("La nueva fecha de cierre debe ser como mínimo mañana.")
        }

        await prisma.vacante.update({
            where: { id },
            data: {
                fecha_limite: parseFechaLimiteVacanteToLocalDate(fecha_limite.trim()),
                estatus: EstatusVacante.ABIERTA,
                cerrada_en: null,
            },
        })

        revalidarRutasVacante()
        return { success: true, message: "¡Convocatoria extendida y reabierta!" }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function cerrarVacanteAction(id: number) {
    try {
        const empresa = await getEmpresaDeSesion()

        const vacante = await prisma.vacante.findUnique({
            where: { id, empresaId: empresa.id },
        })

        if (!vacante) throw new Error("Vacante no encontrada o no pertenece a tu empresa")

        if (vacante.estatus === EstatusVacante.CERRADA) {
            return { success: true, message: "La vacante ya estaba cerrada." }
        }

        await prisma.vacante.update({
            where: { id },
            data: {
                estatus: EstatusVacante.CERRADA,
                cerrada_en: new Date(),
            },
        })

        revalidarRutasVacante()
        return { success: true, message: "Vacante cerrada definitivamente." }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function eliminarVacanteAction(id: number) {
    try {
        const empresa = await getEmpresaDeSesion()

        const vacante = await prisma.vacante.findUnique({
            where: { id, empresaId: empresa.id },
        })

        if (!vacante) throw new Error("No puedes eliminar esta vacante")

        await prisma.vacante.delete({ where: { id } })

        revalidarRutasVacante()
        return { success: true, message: "Vacante eliminada exitosamente" }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

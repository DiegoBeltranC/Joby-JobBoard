import { cache } from "react"
import { prisma } from "@/lib/prisma"

export const obtenerEmpresaDeSesion = cache(async (usuarioId: number) => {
    const usuarioInfo = await prisma.user.findUnique({
        where: { id: usuarioId },
        include: {
            empresa: true,
        },
    })

    return usuarioInfo
})

/**
 * Variante para server actions / endpoints sensibles.
 * Devuelve `null` si la empresa está SUSPENDIDA o RECHAZADA.
 * Para el resto de estatus (PENDIENTE, REQUIERE_CAMBIOS, APROBADA, SIN_ENVIAR) devuelve la data normal.
 */
export const obtenerEmpresaActivaDeSesion = cache(async (usuarioId: number) => {
    const usuarioInfo = await obtenerEmpresaDeSesion(usuarioId)

    if (!usuarioInfo?.empresa) return null

    const estatus = usuarioInfo.empresa.estatus_verificacion
    if (estatus === "SUSPENDIDA" || estatus === "RECHAZADA") {
        return null
    }

    return usuarioInfo
})

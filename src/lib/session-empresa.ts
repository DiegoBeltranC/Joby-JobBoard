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

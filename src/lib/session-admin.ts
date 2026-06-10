import { cache } from "react"
import { prisma } from "@/lib/prisma"

export const obtenerAdminDeSesion = cache(async (usuarioId: number) => {
    const usuarioInfo = await prisma.user.findUnique({
        where: { id: usuarioId },
        include: {
            admin: true,
        },
    })

    return usuarioInfo
})

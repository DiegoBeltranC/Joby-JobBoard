import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return new NextResponse("No autorizado", { status: 401 })
        }

        const empresa = await prisma.empresa.findUnique({
            where: { usuarioId: session.userId },
            select: {
                estatus_verificacion: true,
                motivo_rechazo: true,
                updatedAt: true,
            },
        })

        if (!empresa) {
            return new NextResponse("Empresa no encontrada", { status: 404 })
        }

        return NextResponse.json({
            estatus: empresa.estatus_verificacion,
            motivo_rechazo: empresa.motivo_rechazo,
            updatedAt: empresa.updatedAt.toISOString(),
        })
    } catch (error) {
        console.error("Error en /api/empresa/mi-estatus:", error)
        return new NextResponse("Error interno", { status: 500 })
    }
}

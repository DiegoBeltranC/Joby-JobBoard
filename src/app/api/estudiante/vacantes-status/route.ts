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

        const usuario = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { rol: true },
        })

        if (!usuario || usuario.rol !== "ESTUDIANTE") {
            return new NextResponse("No autorizado", { status: 401 })
        }

        const stats = await prisma.vacante.aggregate({
            where: {
                estatus: "ABIERTA",
                empresa: {
                    estatus_verificacion: "APROBADA",
                },
                OR: [{ fecha_limite: null }, { fecha_limite: { gte: new Date() } }],
            },
            _count: { _all: true },
            _max: { id: true, createdAt: true },
        })

        return NextResponse.json({
            count: stats._count._all,
            lastId: stats._max.id ?? 0,
            lastCreatedAt: stats._max.createdAt?.toISOString() ?? null,
        })
    } catch (error) {
        console.error("Error en /api/estudiante/vacantes-status:", error)
        return new NextResponse("Error interno", { status: 500 })
    }
}

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

        if (!usuario || usuario.rol !== "ADMIN") {
            return new NextResponse("No autorizado", { status: 401 })
        }

        const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000)

        const [pendientes, nuevasEmpresas] = await Promise.all([
            prisma.empresa.findMany({
                where: { estatus_verificacion: "PENDIENTE" },
                select: { id: true, updatedAt: true },
                orderBy: { updatedAt: "desc" },
            }),
            prisma.empresa.findMany({
                where: { createdAt: { gte: haceUnaHora } },
                select: { id: true, createdAt: true },
                orderBy: { createdAt: "desc" },
            }),
        ])

        return NextResponse.json({
            pendientes: {
                count: pendientes.length,
                ids: pendientes.map((e) => e.id),
                lastUpdate: pendientes[0]?.updatedAt?.toISOString() ?? null,
            },
            nuevasEmpresas: {
                count: nuevasEmpresas.length,
                ids: nuevasEmpresas.map((e) => e.id),
                lastCreation: nuevasEmpresas[0]?.createdAt?.toISOString() ?? null,
            },
        })
    } catch (error) {
        console.error("Error en /api/admin/eventos-recientes:", error)
        return new NextResponse("Error interno", { status: 500 })
    }
}

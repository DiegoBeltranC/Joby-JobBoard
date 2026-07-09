import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { encodeId } from "@/lib/utils/hash"
import { ModalidadTrabajo, TipoContrato, Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get("search") || ""
        const limitParam = searchParams.get("limit")
        const pageParam = searchParams.get("page")
        const modalidad = searchParams.get("modalidad")
        const tipo_contrato = searchParams.get("tipo_contrato")

        // 1. Paginación
        let limit = 20
        if (limitParam) {
            const parsedLimit = parseInt(limitParam, 10)
            if (!isNaN(parsedLimit) && parsedLimit > 0) {
                limit = Math.min(parsedLimit, 100)
            }
        }

        let page = 1
        if (pageParam) {
            const parsedPage = parseInt(pageParam, 10)
            if (!isNaN(parsedPage) && parsedPage > 0) {
                page = parsedPage
            }
        }

        const skip = (page - 1) * limit

        // 2. Construcción de filtros (sólo vacantes activas y vigentes)
        const conditions: Prisma.VacanteWhereInput[] = [
            { estatus: "ABIERTA" },
            {
                empresa: {
                    estatus_verificacion: "APROBADA",
                },
            },
            {
                OR: [
                    { fecha_limite: null },
                    { fecha_limite: { gte: new Date() } },
                ],
            },
        ]

        // Filtro por texto libre
        if (search.trim()) {
            conditions.push({
                OR: [
                    { titulo: { contains: search, mode: "insensitive" } },
                    { descripcion: { contains: search, mode: "insensitive" } },
                    {
                        empresa: {
                            nombre_comercial: { contains: search, mode: "insensitive" },
                        },
                    },
                ],
            })
        }

        // Filtro por modalidad
        if (modalidad) {
            const upperModalidad = modalidad.toUpperCase()
            if (["PRESENCIAL", "HIBRIDO", "REMOTO"].includes(upperModalidad)) {
                conditions.push({ modalidad: upperModalidad as ModalidadTrabajo })
            }
        }

        // Filtro por tipo de contrato
        if (tipo_contrato) {
            const upperContrato = tipo_contrato.toUpperCase()
            if (["ESTADIA", "MEDIO_TIEMPO", "TIEMPO_COMPLETO"].includes(upperContrato)) {
                conditions.push({ tipo_contrato: upperContrato as TipoContrato })
            }
        }

        const where = { AND: conditions }

        // 3. Consultar base de datos
        const total = await prisma.vacante.count({ where })
        const vacantes = await prisma.vacante.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                empresa: {
                    select: {
                        nombre_comercial: true,
                        logo_url: true,
                        municipio: true,
                        estado: true,
                    },
                },
            },
        })

        // 4. Formatear y añadir ID encriptado
        const items = vacantes.map((v) => ({
            id: v.id,
            idHash: encodeId(v.id),
            titulo: v.titulo,
            descripcion: v.descripcion,
            tipo_contrato: v.tipo_contrato,
            modalidad: v.modalidad,
            estado: v.estado,
            municipio: v.municipio,
            sueldo_min: v.sueldo_min,
            sueldo_max: v.sueldo_max,
            horario: v.horario,
            fecha_limite: v.fecha_limite ? v.fecha_limite.toISOString() : null,
            createdAt: v.createdAt.toISOString(),
            empresa: v.empresa
                ? {
                    nombre_comercial: v.empresa.nombre_comercial,
                    logo_url: v.empresa.logo_url,
                    municipio: v.empresa.municipio,
                    estado: v.empresa.estado,
                }
                : null,
        }))

        return NextResponse.json({
            success: true,
            data: items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error("Error en GET /api/vacantes:", error)
        return NextResponse.json(
            { success: false, error: "Error interno del servidor" },
            { status: 500 }
        )
    }
}


import { EstatusVacante } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { inicioDeHoyLocal } from "@/lib/vacanteEstatus"

/** Marca ABIERTA/PAUSADA con fecha pasada como VENCIDA (lazy sync). Solo servidor. */
export async function sincronizarVacantesVencidas(empresaId?: number) {
    const inicioHoy = inicioDeHoyLocal()
    await prisma.vacante.updateMany({
        where: {
            ...(empresaId != null ? { empresaId } : {}),
            estatus: EstatusVacante.ABIERTA,
            fecha_limite: { lt: inicioHoy },
        },
        data: { estatus: EstatusVacante.VENCIDA },
    })
    await prisma.vacante.updateMany({
        where: {
            ...(empresaId != null ? { empresaId } : {}),
            estatus: EstatusVacante.PAUSADA,
            fecha_limite: { lt: inicioHoy },
        },
        data: { estatus: EstatusVacante.VENCIDA },
    })
}

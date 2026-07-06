import { EstatusVacante } from "@prisma/client"

export type VacanteConEmpresaMin = {
    estatus: EstatusVacante
    fecha_limite: Date | null
    empresa?: { estatus_verificacion?: string } | null
}

/** Inicio del día local en el servidor (para comparar fechas de cierre). */
export function inicioDeHoyLocal(): Date {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return hoy
}

export function fechaLimiteVigente(fecha_limite: Date | null | undefined): boolean {
    if (fecha_limite == null) return true
    const limite = new Date(fecha_limite)
    limite.setHours(0, 0, 0, 0)
    return limite.getTime() >= inicioDeHoyLocal().getTime()
}

export function esVisibleParaEstudiantes(v: VacanteConEmpresaMin): boolean {
    if (v.estatus !== EstatusVacante.ABIERTA) return false
    if (v.empresa?.estatus_verificacion && v.empresa.estatus_verificacion !== "APROBADA") {
        return false
    }
    return fechaLimiteVigente(v.fecha_limite)
}

export function esEditableCompleta(v: {
    estatus: EstatusVacante
    fecha_limite: Date | null
}): boolean {
    if (v.estatus === EstatusVacante.VENCIDA || v.estatus === EstatusVacante.CERRADA) {
        return false
    }
    return (
        (v.estatus === EstatusVacante.ABIERTA || v.estatus === EstatusVacante.PAUSADA) &&
        fechaLimiteVigente(v.fecha_limite)
    )
}

export function prioridadOrdenEstatus(estatus: EstatusVacante): number {
    switch (estatus) {
        case EstatusVacante.ABIERTA:
            return 0
        case EstatusVacante.PAUSADA:
            return 1
        case EstatusVacante.VENCIDA:
            return 2
        case EstatusVacante.CERRADA:
            return 3
        default:
            return 99
    }
}

export function etiquetaEstatusVacante(estatus: EstatusVacante | string): string {
    switch (estatus) {
        case EstatusVacante.ABIERTA:
            return "Abierta"
        case EstatusVacante.PAUSADA:
            return "Pausada"
        case EstatusVacante.VENCIDA:
            return "Vencida"
        case EstatusVacante.CERRADA:
            return "Cerrada"
        default:
            return estatus
    }
}

export function clasesBadgeEstatus(estatus: EstatusVacante | string): string {
    switch (estatus) {
        case EstatusVacante.ABIERTA:
            return "bg-emerald-50 text-emerald-700 border-emerald-200"
        case EstatusVacante.PAUSADA:
            return "bg-amber-50 text-amber-800 border-amber-200"
        case EstatusVacante.VENCIDA:
            return "bg-red-50 text-red-700 border-red-200"
        case EstatusVacante.CERRADA:
            return "bg-slate-100 text-slate-700 border-slate-300"
        default:
            return "bg-gray-100 text-gray-500 border-gray-200"
    }
}

/** Borde y hover de la tarjeta en el listado de vacantes (empresa). */
export function clasesTarjetaVacanteEstatus(estatus: EstatusVacante | string): string {
    switch (estatus) {
        case EstatusVacante.VENCIDA:
            return "border-red-200 hover:border-red-300 hover:shadow-red-500/5"
        case EstatusVacante.PAUSADA:
            return "border-amber-200 hover:border-amber-300 hover:shadow-amber-500/5"
        case EstatusVacante.CERRADA:
            return "border-slate-200 hover:border-slate-300 hover:shadow-slate-500/5"
        default:
            return "border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5"
    }
}

/** Fondo del encabezado del modal de detalle de vacante. */
export function clasesEncabezadoDetalleVacante(estatus: EstatusVacante | string): string {
    switch (estatus) {
        case EstatusVacante.VENCIDA:
            return "bg-red-50/50 border-red-100"
        case EstatusVacante.PAUSADA:
            return "bg-amber-50/50 border-amber-100"
        case EstatusVacante.CERRADA:
            return "bg-slate-50/50 border-slate-200"
        case EstatusVacante.ABIERTA:
            return "bg-emerald-50/40 border-emerald-100"
        default:
            return "bg-violet-50/40 border-violet-100"
    }
}

export function ordenarVacantesPorEstatus<T extends { estatus: EstatusVacante; createdAt: Date }>(
    vacantes: T[]
): T[] {
    return [...vacantes].sort((a, b) => {
        const pa = prioridadOrdenEstatus(a.estatus)
        const pb = prioridadOrdenEstatus(b.estatus)
        if (pa !== pb) return pa - pb
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
}

/** Fecha local YYYY-MM-DD del día siguiente a hoy (mínimo para cierre de vacante). */
export function getMinimaFechaCierreVacanteString(): string {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    t.setDate(t.getDate() + 1)
    const y = t.getFullYear()
    const m = String(t.getMonth() + 1).padStart(2, "0")
    const d = String(t.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

export function parseFechaLimiteVacanteToLocalDate(isoDate: string): Date {
    const [y, m, d] = isoDate.split("-").map(Number)
    return new Date(y, m - 1, d)
}

/** La fecha elegida debe ser al menos mañana (hoy y antes no válidos). */
export function esFechaCierreVacanteValida(isoDate: string): boolean {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false
    const picked = parseFechaLimiteVacanteToLocalDate(isoDate)
    picked.setHours(0, 0, 0, 0)
    const tomorrow = new Date()
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return picked.getTime() >= tomorrow.getTime()
}

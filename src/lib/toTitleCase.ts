/** Primera letra en mayúscula y el resto en minúsculas por palabra (mismo criterio que registro empresa). */
export function toTitleCase(str: string): string {
    return str.trim().replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    )
}

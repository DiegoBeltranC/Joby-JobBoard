/** Capitaliza la primera letra de cada palabra: "diego beltran" → "Diego Beltran" */
export function toTitleCase(str: string): string {
    return str.trim().replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
}

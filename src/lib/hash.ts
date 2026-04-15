/**
 * Utilidad de Ofuscación de IDs para URLs Públicas
 * 
 * Propósito: Prevenir la enumeración de base de datos y mejorar el profesionalismo
 * de las URLs. Ejemplo: /empresas/1 -> /empresas/X7K9PQ
 */

const SALT = 0x5EAC; // Sal secreta para la ofuscación
const MULTIPLIER = 97; // Multiplicador primo para dispersión

/**
 * Codifica un ID numérico en un hash alfanumérico.
 */
export function encodeId(id: number | undefined | null): string {
    if (id === undefined || id === null) return "";
    
    // Ofuscación reversible: Multiplicar por primo y XOR con sal
    const obscured = (id * MULTIPLIER) ^ SALT;
    
    // Convertir a Base36 (0-9, a-z) y pasar a Mayúsculas para estilo "Código"
    return obscured.toString(36).toUpperCase();
}

/**
 * Decodifica un hash alfanumérico en el ID numérico original.
 */
export function decodeId(hash: string | undefined | null): number | null {
    if (!hash) return null;
    
    try {
        // Convertir de Base36
        const obscured = parseInt(hash.toLowerCase(), 36);
        
        if (isNaN(obscured)) return null;
        
        // Operación inversa: XOR con sal y división por primo
        const decoded = (obscured ^ SALT) / MULTIPLIER;
        
        // Validar que sea un entero (si no, el hash es inválido o alterado)
        return Number.isInteger(decoded) ? decoded : null;
    } catch {
        return null;
    }
}

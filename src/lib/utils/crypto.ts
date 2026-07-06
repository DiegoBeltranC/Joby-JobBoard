import crypto from "crypto";

/**
 * Genera un token aleatorio criptográficamente seguro en formato hexadecimal.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Genera un hash SHA-256 de un token para guardado o comparación segura en BD.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

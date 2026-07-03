import crypto from 'crypto';

// Esta clave debe estar en el archivo .env (debe ser de exactamente 32 caracteres)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'jobby_secure_key_aes256_32char_!'; 
const ALGORITHM = 'aes-256-cbc';

export function encryptId(id: number): string {
  // Generamos un Vector de Inicialización (IV) aleatorio de 16 bytes para cada encriptación
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(id.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Retornamos el IV y el texto cifrado concatenados por dos puntos
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptId(encryptedText: string): number | null {
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    if (!ivHex || !encryptedHex) return null;

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const parsedId = parseInt(decrypted, 10);
    return isNaN(parsedId) ? null : parsedId;
  } catch (error) {
    // Si la cadena fue manipulada o el IV es inválido, retornará null
    return null;
  }
}

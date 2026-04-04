import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Clave secreta para firmar la cookie (En producción, esto va en tu .env)
const secretKey = process.env.SESSION_SECRET || "super-secreto-joby-ut-2026";
const encodedKey = new TextEncoder().encode(secretKey);

// 1. Crear la sesión (Se llama cuando el login es exitoso)
export async function createSession(userId: number) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    const session = await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey);

    // 🔥 SOLUCIÓN: Agregamos "await" antes de cookies()
    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
    });
}

// 2. Leer la sesión (Se llama en los Layouts para ver quién está conectado)
export async function getSession() {
    // 🔥 SOLUCIÓN: Agregamos "await" antes de cookies()
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        });
        return payload as { userId: number };
    } catch (error) {
        console.error("Error verificando sesión", error);
        return null;
    }
}
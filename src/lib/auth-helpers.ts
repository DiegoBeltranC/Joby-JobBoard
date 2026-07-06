import { cookies } from "next/headers"

const COOKIE_MAX_AGE_SECONDS = 15 * 60

export async function setRegistroPendienteCookie(email: string): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.set("registro_pendiente", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_MAX_AGE_SECONDS,
        sameSite: "lax",
        path: "/",
    })
}

export function generateOTP(): { code: string; expiresAt: Date } {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    return { code, expiresAt }
}

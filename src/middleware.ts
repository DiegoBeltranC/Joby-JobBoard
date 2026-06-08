import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const registroPendiente = request.cookies.get("registro_pendiente")?.value
  const { pathname } = request.nextUrl

  // 1. Si visitan la ruta de verificación con email en la URL, se propaga/contagia la cookie al nuevo navegador
  if (pathname === "/verificar-correo") {
    const emailParam = request.nextUrl.searchParams.get("email")
    if (emailParam && registroPendiente !== emailParam) {
      const response = NextResponse.next()
      response.cookies.set("registro_pendiente", emailParam, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60, // 15 minutos en segundos
        sameSite: "lax",
        path: "/",
      })
      return response
    }
  }

  // 2. Interceptar rutas raíz (/), de login (/login) y de registro (/registro) si hay un registro pendiente
  if (registroPendiente) {
    if (pathname === "/" || pathname === "/login" || pathname === "/registro") {
      const url = request.nextUrl.clone()
      url.pathname = "/verificar-correo"
      url.searchParams.set("email", registroPendiente)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configuración para ejecutar el middleware en las rutas clave
export const config = {
  matcher: ["/", "/login", "/registro", "/verificar-correo"],
}


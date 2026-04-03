"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Por favor, llena todos los campos." }
  }

  try {
    // 1. Buscamos al usuario por correo
    const user = await prisma.user.findUnique({
      where: { correo: email },
      include: {
        estudiante: true // Traemos su perfil de estudiante de paso
      }
    })

    // 2. Si no existe, lanzamos error genérico por seguridad
    if (!user) {
      return { error: "Credenciales incorrectas." }
    }

    // 3. Verificamos la contraseña encriptada
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return { error: "Credenciales incorrectas." }
    }

    // 4. (Futuro) Aquí crearíamos la cookie o sesión de JWT (NextAuth/IronSession)
    // Por ahora, simulamos el éxito devolviendo datos seguros

    const nombreUsuario = user.estudiante?.nombre || "Administrador"

    return {
      success: true,
      userName: nombreUsuario,
      role: user.rol
    }

  } catch (error) {
    console.error("Error en login:", error)
    return { error: "Error interno del servidor. Intenta más tarde." }
  }
}
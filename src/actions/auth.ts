"use server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/session" // 👈 Importamos la nueva función
import { redirect } from "next/navigation"


export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Por favor, llena todos los campos." }

  try {
    const user = await prisma.user.findUnique({
      where: { correo: email },
      include: { estudiante: true }
    })

    if (!user) return { error: "Credenciales incorrectas." }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) return { error: "Credenciales incorrectas." }

    // 🔥 ¡AQUÍ ESTÁ LA MAGIA! Creamos la cookie de sesión con el ID del usuario
    await createSession(user.id)
    return { success: true }

  } catch (error) {
    console.error("Error en login:", error)
    return { error: "Error interno del servidor. Intenta más tarde." }
  }

  // Next.js requiere que el redirect se ejecute FUERA del bloque try/catch
  redirect("/inicio")
}

export async function logoutAction() {
  // Obtenemos las cookies y borramos la de sesión
  const cookieStore = await cookies()
  cookieStore.delete("session")

  // Redirigimos al login
  redirect("/login")
}
"use server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/session"
import { redirect } from "next/navigation"


export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const tipo = (formData.get("tipo") as string) || "estudiante"

  if (!email || !password) return { error: "Por favor, llena todos los campos." }

  try {
    const user = await prisma.user.findUnique({
      where: { correo: email },
      include: { estudiante: true, empresa: true }
    })

    if (!user) return { error: "Credenciales incorrectas." }

    // Validar que el rol coincida con el tipo de login seleccionado
    if (tipo === "admin" && user.rol !== "ADMIN") {
      return { error: "Este correo no tiene permisos de administrador." }
    }
    if (tipo === "empresa" && user.rol !== "EMPRESA") {
      return { error: "Este correo no está registrado como empresa. ¿Intentaste iniciar sesión como estudiante?" }
    }
    if (tipo === "estudiante" && user.rol !== "ESTUDIANTE") {
      return { error: "Este correo no está registrado como estudiante. ¿Intentaste iniciar sesión como empresa?" }
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) return { error: "Credenciales incorrectas." }

    // Creamos la cookie de sesión
    await createSession(user.id)
    return { success: true, rol: user.rol }

  } catch (error) {
    console.error("Error en login:", error)
    return { error: "Error interno del servidor. Intenta más tarde." }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/login")
}
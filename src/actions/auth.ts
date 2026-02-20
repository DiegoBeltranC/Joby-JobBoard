'use server'

import { prisma } from "../lib/prisma"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  // 1. Obtener datos del formulario
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Por favor llena todos los campos" }
  }

  try {
    // 2. BUSCAR EN LA BASE DE DATOS
    // Aquí usamos el "include" para traer también los datos del estudiante
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { 
        studentProfile: true // Traemos la info de la tabla Students
      } 
    })

    // 3. Validar si existe y la contraseña coincide
    if (!user || user.password !== password) {
      return { error: "Credenciales inválidas" }
    }

    // 4. Validar si está activo
    if (!user.isActive) {
      return { error: "Usuario desactivado. Contacta a la UT." }
    }

    // 5. ¡ÉXITO!
    // Para la demo de mañana, devolvemos el nombre real del estudiante
    const nombreUsuario = user.studentProfile?.nombreCompleto || user.email
    
    return { 
      success: true, 
      userName: nombreUsuario,
      role: user.role
    }

  } catch (error) {
    console.error("Error en base de datos:", error)
    return { error: "Error de conexión con el servidor" }
  }
}
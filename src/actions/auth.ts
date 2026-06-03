"use server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { sendEmail } from "@/lib/mail"


export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const tipo = (formData.get("tipo") as string) || "estudiante"
  const redirectUrl = formData.get("redirect") as string

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

    // Interceptar si la cuenta está suspendida por eliminación
    if (user.deletedAt) {
      const scheduledDate = user.scheduledDeletionAt ? new Date(user.scheduledDeletionAt) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      const fechaLimite = scheduledDate.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      return { 
        suspended: true, 
        email: user.correo, 
        scheduledDeletionAt: fechaLimite 
      }
    }

    // Edge Case: Limbo de Usuario (Estudiante o Empresa no verificados)
    if ((user.rol === "ESTUDIANTE" || user.rol === "EMPRESA") && !user.verifiedAt) {
      // Devolver al frontend la instruccion de redireccion para evitar atrapar NEXT_REDIRECT
      const redirectSuffix = redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ""
      return { redirect: `/verificar-correo?email=${encodeURIComponent(user.correo)}${redirectSuffix}` }
    }

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

export async function logoutAdminAction() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/admin/login")
}

// -----------------------------------------------------------------------------
// VERIFICAR OTP
// -----------------------------------------------------------------------------
export async function verificarOTPAction(email: string, otpOriginal: string) {
  try {
    const user = await prisma.user.findUnique({ where: { correo: email } })
    if (!user) return { error: "Usuario no encontrado" }

    if (user.verifiedAt) return { error: "Este correo ya está verificado." }

    if (!user.otpCode || user.otpCode !== otpOriginal) {
      return { error: "El código es incorrecto." }
    }

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return { error: "El código ha expirado. Solicita uno nuevo." }
    }

    // Verificado con éxito
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifiedAt: new Date(),
        otpCode: null,
        otpExpiresAt: null
      }
    })

    // Iniciar Sesión automáticamente
    await createSession(user.id)

    return { success: true, rol: user.rol }
  } catch (error) {
    console.error("Error al verificar OTP:", error)
    return { error: "Error interno verificando código." }
  }
}

// -----------------------------------------------------------------------------
// REENVIAR OTP
// -----------------------------------------------------------------------------
export async function reenviarOTPAction(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { correo: email } })
    if (!user) return { error: "Usuario no encontrado" }
    if (user.verifiedAt) return { error: "Usuario ya está verificado." }

    // Generar código de 6 dígitos
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    // Expira en 15 mins
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: newOtp,
        otpExpiresAt: expires
      }
    })

    // Mandar mail con Resend
    const resMail = await sendEmail({
      to: email,
      subject: 'Tu nuevo código de verificación - Joby',
      title: 'Verifica tu identidad',
      message: `Detectamos un intento de registro o acceso a tu cuenta. Para continuar de forma segura, por favor ingresa este código de 6 dígitos:\n\n${newOtp}\n\nEste código expira automáticamente en 15 minutos.`,
      type: "SUCCESS"
    });

    if (!resMail.success) {
      console.error("Resend Error Reenviar OTP:", resMail.error)
      return { error: `No se pudo enviar el correo: ${resMail.error}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Error reenviando OTP:", error)
    return { error: "Error al reenviar el código" }
  }
}

// -----------------------------------------------------------------------------
// REACTIVAR CUENTA SUSPENDIDA
// -----------------------------------------------------------------------------
export async function reactivarCuentaAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Por favor, ingresa tus credenciales." }

  try {
    const user = await prisma.user.findUnique({
      where: { correo: email }
    })

    if (!user) return { error: "Usuario no encontrado." }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) return { error: "Credenciales incorrectas." }

    if (!user.deletedAt) return { error: "Esta cuenta no está suspendida." }

    // Reactivar: limpiar campos de eliminación
    await prisma.user.update({
      where: { id: user.id },
      data: {
        deletedAt: null,
        scheduledDeletionAt: null
      }
    })

    // Enviar correo de confirmación de reactivación
    await sendEmail({
      to: user.correo,
      subject: "Tu cuenta de Bolsa Educativa ha sido reactivada - Joby",
      title: "¡Cuenta Reactivada con Éxito!",
      message: `Hola,\n\nTe informamos que tu cuenta en la Bolsa Educativa Joby ha sido reactivada con éxito.\n\nYa puedes acceder normalmente a la plataforma. Por favor toma en cuenta que tus postulaciones anteriores fueron eliminadas permanentemente y deberás volver a postularte a las vacantes de tu interés.\n\n¡Bienvenido de nuevo!`,
      type: "SUCCESS"
    })

    // Iniciar sesión creando cookie
    await createSession(user.id)
    return { success: true, rol: user.rol }
  } catch (error) {
    console.error("Error al reactivar cuenta:", error)
    return { error: "Error interno al reactivar la cuenta." }
  }
}
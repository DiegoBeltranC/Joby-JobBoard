"use server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { sendEmail } from "@/lib/mail"
import { setRegistroPendienteCookie, generateOTP } from "@/lib/auth-helpers"


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
      // Validación de expiración universal:
      // Si otpExpiresAt ya pasó, limpiamos otpCode, otpExpiresAt, intentos y último reenvío
      if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            otpCode: null,
            otpExpiresAt: null,
            intentos_reenvio: 0,
            ultimo_reenvio_at: null
          }
        })
      }

      // Establecer o renovar cookie registro_pendiente
      await setRegistroPendienteCookie(user.correo)
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
      // Eliminar el token expirado de la base de datos
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode: null,
          otpExpiresAt: null
        }
      })
      return { error: "El código ha expirado. Solicita uno nuevo." }
    }

    // Verificado con éxito
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifiedAt: new Date(),
        otpCode: null,
        otpExpiresAt: null,
        intentos_reenvio: 0,
        ultimo_reenvio_at: null
      }
    })

    // Eliminar la cookie registro_pendiente
    const cookieStore = await cookies()
    cookieStore.delete("registro_pendiente")

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
function getCooldownDuration(attempts: number): number {
  switch (attempts) {
    case 0: return 60 * 1000      // 1 minuto
    case 1: return 5 * 60 * 1000  // 5 minutos
    case 2: return 15 * 60 * 1000 // 15 minutos
    case 3: return 60 * 60 * 1000 // 1 hora
    default: return -1            // Bloqueado por completo
  }
}

export async function reenviarOTPAction(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { correo: email } })
    if (!user) return { error: "Usuario no encontrado" }
    if (user.verifiedAt) return { error: "Usuario ya está verificado." }

    // Validación de Cooldown Progresiva
    if (user.ultimo_reenvio_at) {
      const msSinceLastSend = Date.now() - user.ultimo_reenvio_at.getTime()
      const attempts = user.intentos_reenvio
      const cooldownMs = getCooldownDuration(attempts)
      
      if (cooldownMs === -1) {
        return { 
          error: "Has excedido el número máximo de reenvíos de código de seguridad. Tu solicitud ha sido bloqueada por seguridad." 
        }
      }
      
      if (msSinceLastSend < cooldownMs) {
        const secondsLeft = Math.ceil((cooldownMs - msSinceLastSend) / 1000)
        return { 
          error: `Debes esperar ${secondsLeft} segundos antes de solicitar otro código.`, 
          tiempo_restante: secondsLeft 
        }
      }
    }

    // Generar código de 6 dígitos
    const { code: newOtp, expiresAt: expires } = generateOTP()

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: newOtp,
        otpExpiresAt: expires,
        ultimo_reenvio_at: new Date(),
        intentos_reenvio: { increment: 1 }
      }
    })

    // Renovar la cookie registro_pendiente para el navegador actual
    await setRegistroPendienteCookie(email)

    // Mandar mail con Resend y botón de enlace directo para navegación cruzada
    const resMail = await sendEmail({
      to: email,
      subject: 'Tu nuevo código de verificación - Joby',
      title: 'Verifica tu identidad',
      message: `Detectamos un intento de registro o acceso a tu cuenta. Para continuar de forma segura, por favor ingresa este código de 6 dígitos:\n\n${newOtp}\n\nEste código expira automáticamente en 15 minutos.`,
      buttonText: "Ir a verificar mi cuenta",
      buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verificar-correo?email=${encodeURIComponent(email)}`,
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
// ESTABLECER COOKIE DE REGISTRO PENDIENTE (SEGURO PARA NAVEGACIÓN CRUZADA)
// -----------------------------------------------------------------------------
export async function establecerCookieRegistroPendienteAction(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { correo: email } })
    if (!user || user.verifiedAt) {
      return { error: "Usuario inválido o ya verificado" }
    }

    await setRegistroPendienteCookie(email)
    return { success: true }
  } catch (error) {
    console.error("Error setting pending cookie:", error)
    return { error: "Error interno de servidor" }
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

// -----------------------------------------------------------------------------
// CANCELAR REGISTRO PENDIENTE (ELIMINAR USUARIO EN LIMBO)
// -----------------------------------------------------------------------------
export async function cancelarRegistroPendienteAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { correo: email },
      select: { id: true, verifiedAt: true, rol: true }
    })

    if (!user) {
      return { success: true }
    }

    if (user.verifiedAt) {
      return { error: "No se puede cancelar un registro ya verificado" }
    }

    // 1. Eliminar el usuario (por onDelete: Cascade, se borra Estudiante/Empresa)
    await prisma.user.delete({
      where: { id: user.id }
    })

    // 2. Borrar la cookie del navegador actual
    const cookieStore = await cookies()
    cookieStore.delete("registro_pendiente")

    return { success: true, rol: user.rol }
  } catch (error) {
    console.error("Error al cancelar registro:", error)
    return { error: "Error al cancelar el registro en el servidor" }
  }
}

// Acción para preparar la modificación de correo sin eliminar el usuario
export async function prepararModificacionCorreoAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { correo: email },
      select: { rol: true }
    })

    // Borrar la cookie para que el middleware permita acceder a /registro
    const cookieStore = await cookies()
    cookieStore.delete("registro_pendiente")

    return { success: true, rol: user?.rol || "ESTUDIANTE" }
  } catch (error) {
    console.error("Error al preparar modificacion de correo:", error)
    return { error: "Error en el servidor al preparar la modificación" }
  }
}
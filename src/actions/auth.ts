"use server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)


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
    if (tipo === "empresa" && user.rol !== "EMPRESA") {
      return { error: "Este correo no está registrado como empresa. ¿Intentaste iniciar sesión como estudiante?" }
    }
    if (tipo === "estudiante" && user.rol !== "ESTUDIANTE") {
      return { error: "Este correo no está registrado como estudiante. ¿Intentaste iniciar sesión como empresa?" }
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) return { error: "Credenciales incorrectas." }

    // Edge Case: Limbo de Estudiante
    if (user.rol === "ESTUDIANTE" && !user.verifiedAt) {
      // Devolver al frontend la instruccion de redireccion para evitar atrapar NEXT_REDIRECT
      return { redirect: `/verificar-correo?email=${encodeURIComponent(user.correo)}` }
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

    return { success: true }
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
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: 'Joby Chetumal <no-reply@jobychetumal.online>',
      to: email,
      subject: 'Tu nuevo código de verificación - Joby',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <!-- Main Card -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="background-color:#0d9488; padding:30px 0;">
                      <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:bold; letter-spacing:1px; font-style:italic;">Joby</h1>
                      <p style="color:#ccfbf1; margin:5px 0 0 0; font-size:14px; font-weight:500;">Bolsa de Trabajo UT Chetumal</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px; text-align:center;">
                      <h2 style="color:#1f2937; font-size:22px; margin:0 0 20px; font-weight:bold;">Verifica tu identidad</h2>
                      <p style="color:#4b5563; font-size:16px; line-height:1.6; margin:0 0 30px;">
                        Detectamos un intento de registro o acceso a tu cuenta. Para continuar de forma segura, por favor ingresa este código de 6 dígitos:
                      </p>
                      
                      <!-- OTP Box -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin:0 auto; background-color:#f8fafc; border:2px dashed #94a3b8; border-radius:12px;">
                        <tr>
                          <td align="center" style="padding: 20px 40px;">
                            <span style="font-size:38px; font-weight:900; color:#0f766e; letter-spacing:10px;">${newOtp}</span>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color:#64748b; font-size:14px; margin:30px 0 0 0;">
                        Este código expira automáticamente en <strong>15 minutos</strong>.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color:#f8fafc; padding:20px 30px; text-align:center; border-top:1px solid #e2e8f0;">
                      <p style="color:#94a3b8; font-size:12px; margin:0; line-height:1.5;">
                        Si tú no solicitaste este código, puedes ignorar este mensaje de forma segura. Alguien posiblemente se equivocó tipeando su correo.<br/><br/>
                        &copy; ${new Date().getFullYear()} Joby. Plataforma Oficial UT Chetumal.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    if (resendError) {
      console.error("Resend Error Reenviar OTP:", resendError)
      return { error: `No se pudo enviar el correo: ${resendError.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Error reenviando OTP:", error)
    return { error: "Error al reenviar el código" }
  }
}
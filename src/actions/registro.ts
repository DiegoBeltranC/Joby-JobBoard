"use server"
import { prisma } from "@/lib/prisma" // Asumo que tienes tu cliente aquí
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { reenviarOTPAction } from "./auth"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function registrarEstudiante(datos: any) {
    try {
        // 1. Verificar si el correo ya existe
        const usuarioExistente = await prisma.user.findUnique({
            where: { correo: datos.correo }
        })

        // Edge Case: Limbo (Abandonó el OTP en intento previo)
        if (usuarioExistente && !usuarioExistente.verifiedAt) {
            // El usuario existe pero no está verificado. Renovar su OTP.
            await reenviarOTPAction(datos.correo)
            redirect(`/verificar-correo?email=${encodeURIComponent(datos.correo)}`)
        }

        // Si ya está verificado, no podemos dejarlo registrarse
        if (usuarioExistente) {
            return { success: false, error: "Este correo ya está registrado en Joby." }
        }

        // 1.5 Verificar si la matrícula ya está en uso por otro alumno verificado
        const matriculaExistente = await prisma.estudiante.findUnique({
            where: { matricula: datos.matricula },
            include: { usuario: true }
        })

        if (matriculaExistente && matriculaExistente.usuario.verifiedAt) {
            return { success: false, error: "Esta matrícula ya está registrada por otro alumno." }
        } else if (matriculaExistente && !matriculaExistente.usuario.verifiedAt) {
            // Alumno en limbo por matrícula
            const resReenviar = await reenviarOTPAction(matriculaExistente.usuario.correo)
            if (resReenviar.error) return { success: false, error: resReenviar.error }
            return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(matriculaExistente.usuario.correo)}` }
        }

        // 2. Encriptar la contraseña
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(datos.password, salt)

        // 3. Buscar la Universidad (Para vincular al estudiante)
        const universidad = await prisma.universidad.findFirst({
            where: { siglas: 'UTCH' }
        })

        if (!universidad) {
            return { success: false, error: "Error de configuración: Universidad no encontrada." }
        }

        // 5. Generar OTP Inicial para el nuevo usuario
        const initialOtp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiration = new Date(Date.now() + 15 * 60 * 1000)

        // 6. TRANSACCIÓN: Crear Usuario y Perfil Estudiante
        const nuevoUsuario = await prisma.user.create({
            data: {
                correo: datos.correo,
                password_hash: hashedPassword,
                rol: "ESTUDIANTE",
                otpCode: initialOtp,
                otpExpiresAt: otpExpiration,
                estudiante: {
                    create: {
                        nombre: datos.nombre,
                        apellidoPaterno: datos.apellidoPaterno,
                        apellidoMaterno: datos.apellidoMaterno,
                        matricula: datos.matricula,
                        estatus_academico: datos.estatus_academico,
                        periodo_academico: datos.periodo_academico ? parseInt(datos.periodo_academico) : null,
                        universidadId: universidad.id,
                        carreraId: parseInt(datos.carreraId)
                    }
                }
            }
        })

        // 7. Enviar Correo OTP
        const { data: resendData, error: resendError } = await resend.emails.send({
           from: 'Joby Chetumal <no-reply@jobychetumal.online>',
            to: datos.correo,
            subject: 'Tu código de verificación - Joby',
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
                      <h2 style="color:#1f2937; font-size:24px; margin:0 0 20px; font-weight:bold;">¡Bienvenido a la bolsa de trabajo!</h2>
                      <p style="color:#4b5563; font-size:16px; line-height:1.6; margin:0 0 30px;">
                        Casi todo está listo. Para completar la creación de tu cuenta, por favor verifica tu correo ingresando este código de 6 dígitos:
                      </p>
                      
                      <!-- OTP Box -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin:0 auto; background-color:#f8fafc; border:2px dashed #94a3b8; border-radius:12px;">
                        <tr>
                          <td align="center" style="padding: 20px 40px;">
                            <span style="font-size:38px; font-weight:900; color:#0f766e; letter-spacing:10px;">${initialOtp}</span>
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
                        Si tú no solicitaste este registro, ignora este mensaje de forma segura.<br/><br/>
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
            console.error("Resend API Error al Registrar:", resendError)
            return { success: false, error: `Error de Resend: ${resendError.message}. (Si usas cuenta gratis, solo puedes enviarte correos a ti mismo)` }
        }

        return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}` }

    } catch (error: any) {
        // En Next.js 13/14, si tiramos un redirect, tira un error llamado NEXT_REDIRECT
        // Para no bloquearlo:
        if (error?.message === "NEXT_REDIRECT") {
            throw error;
        }
        
        console.error("Error completo en registro:", error)
        return { success: false, error: `Error interno: ${error?.message || "Desconocido"}. Revisa la consola del servidor.` }
    }
}
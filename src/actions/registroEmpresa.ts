"use server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Resend } from "resend"
import { reenviarOTPAction } from "./auth"
import { toTitleCase } from "@/lib/toTitleCase"
import { cookies } from "next/headers"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function registrarEmpresa(datos: {
    correo: string;
    password: string;
    nombre_comercial: string;
    rfc: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    cargo_contacto: string;
    correoAnterior?: string;
}) {
    try {
        // Si la empresa cambió su correo desde la pantalla de verificación, eliminamos el limbo anterior
        if (datos.correoAnterior && datos.correoAnterior !== datos.correo) {
            const oldUser = await prisma.user.findUnique({
                where: { correo: datos.correoAnterior }
            })
            if (oldUser && !oldUser.verifiedAt) {
                await prisma.user.delete({
                    where: { id: oldUser.id }
                })
            }
        }

        // 1. Verificar si el correo ya existe
        const usuarioExistente = await prisma.user.findUnique({
            where: { correo: datos.correo }
        })

        // Edge Case: Limbo (Abandonó el OTP en intento previo)
        if (usuarioExistente && !usuarioExistente.verifiedAt) {
            // Verificar si el código OTP existente aún es válido (no ha expirado)
            const isOtpValid = usuarioExistente.otpCode && usuarioExistente.otpExpiresAt && new Date() < usuarioExistente.otpExpiresAt

            // Encriptar la contraseña (por si la modificó)
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(datos.password, salt)

            // Actualizar datos de cuenta y perfil empresa por si modificó otros campos
            await prisma.user.update({
                where: { id: usuarioExistente.id },
                data: {
                    password_hash: hashedPassword,
                    empresa: {
                        update: {
                            nombre_comercial: datos.nombre_comercial,
                            rfc: datos.rfc || null,
                            nombre: toTitleCase(datos.nombre),
                            apellidoPaterno: toTitleCase(datos.apellidoPaterno),
                            apellidoMaterno: datos.apellidoMaterno ? toTitleCase(datos.apellidoMaterno) : null,
                            cargo_contacto: toTitleCase(datos.cargo_contacto),
                        }
                    }
                }
            })

            // Si el OTP sigue siendo válido, no generamos uno nuevo ni enviamos correo para evitar spam.
            if (isOtpValid) {
                const cookieStore = await cookies()
                cookieStore.set("registro_pendiente", datos.correo, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 15 * 60,
                    sameSite: "lax",
                    path: "/",
                })
                return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}&status=already_sent` }
            }

            // Si ya expiró, entonces renovamos el OTP (pasando por el validador de cooldown)
            const resReenviar = await reenviarOTPAction(datos.correo)
            if (resReenviar.error) {
                return { success: false, error: resReenviar.error }
            }

            return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}` }
        }

        if (usuarioExistente) {
            return { success: false, error: "Este correo ya está registrado en Joby." }
        }

        // 2. Verificar si el RFC ya está en uso
        if (datos.rfc) {
            const rfcExistente = await prisma.empresa.findUnique({
                where: { rfc: datos.rfc },
                include: { usuario: true }
            })

            if (rfcExistente) {
                if (rfcExistente.usuario.verifiedAt) {
                    return { success: false, error: "Este RFC ya está registrado por otra empresa." }
                } else {
                    // RFC en limbo
                    // Si ya expiró, eliminamos el usuario viejo para que lo puedan volver a registrar con este RFC
                    if (rfcExistente.usuario.otpExpiresAt && new Date() > rfcExistente.usuario.otpExpiresAt) {
                        await prisma.user.delete({
                            where: { id: rfcExistente.usuario.id }
                        })
                    } else {
                        // Si no ha expirado, reenviamos el OTP
                        const resReenviar = await reenviarOTPAction(rfcExistente.usuario.correo)
                        if (resReenviar.error) return { success: false, error: resReenviar.error }
                        return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(rfcExistente.usuario.correo)}` }
                    }
                }
            }
        }

        // 3. Encriptar la contraseña
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(datos.password, salt)

        // 3.5 Generar OTP Inicial
        const initialOtp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiration = new Date(Date.now() + 15 * 60 * 1000)

        // 4. TRANSACCIÓN: Crear Usuario y Perfil Empresa al mismo tiempo
        const nuevoUsuario = await prisma.user.create({
            data: {
                correo: datos.correo,
                password_hash: hashedPassword,
                rol: "EMPRESA",
                otpCode: initialOtp,
                otpExpiresAt: otpExpiration,
                ultimo_reenvio_at: new Date(),
                intentos_reenvio: 0,
                empresa: {
                    create: {
                        nombre_comercial: datos.nombre_comercial,
                        rfc: datos.rfc || null,
                        nombre: toTitleCase(datos.nombre),
                        apellidoPaterno: toTitleCase(datos.apellidoPaterno),
                        apellidoMaterno: datos.apellidoMaterno ? toTitleCase(datos.apellidoMaterno) : null,
                        cargo_contacto: toTitleCase(datos.cargo_contacto),
                        // estatus_verificacion queda en SIN_ENVIAR por default
                    }
                }
            }
        })

        // Establecer cookie registro_pendiente
        const cookieStore = await cookies()
        cookieStore.set("registro_pendiente", datos.correo, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60,
            sameSite: "lax",
            path: "/",
        })

        // 5. Enviar Correo OTP (Diseño adaptado para Empresas)
        const { data: resendData, error: resendError } = await resend.emails.send({
            from: 'Joby Chetumal <no-reply@jobychetumal.online>',
            to: datos.correo,
            subject: 'Verifica tu cuenta corporativa - Joby',
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
                    <td align="center" style="background-color:#4f46e5; padding:30px 0;">
                      <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:bold; letter-spacing:1px; font-style:italic;">Joby</h1>
                      <p style="color:#e0e7ff; margin:5px 0 0 0; font-size:14px; font-weight:500;">Portal para Empresas</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px; text-align:center;">
                      <h2 style="color:#1f2937; font-size:24px; margin:0 0 20px; font-weight:bold;">Verifica tu cuenta corporativa</h2>
                      <p style="color:#4b5563; font-size:16px; line-height:1.6; margin:0 0 30px;">
                        ¡Gracias por elegir Joby para conectar con el talento de la UT Chetumal! Para comenzar a publicar vacantes y gestionar tu perfil, ingresa este código de verificación:
                      </p>
                      
                      <!-- OTP Box -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin:0 auto; background-color:#f8fafc; border:2px dashed #6366f1; border-radius:12px;">
                        <tr>
                          <td align="center" style="padding: 20px 40px;">
                            <span style="font-size:38px; font-weight:900; color:#4338ca; letter-spacing:10px;">${initialOtp}</span>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="margin-top: 30px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verificar-correo?email=${encodeURIComponent(datos.correo)}" style="background-color:#4f46e5; color:#ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          Ir a verificar mi cuenta
                        </a>
                      </div>
                      
                      <p style="color:#64748b; font-size:14px; margin:20px 0 0 0;">
                        Este código es válido por <strong>15 minutos</strong>.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color:#f8fafc; padding:20px 30px; text-align:center; border-top:1px solid #e2e8f0;">
                      <p style="color:#94a3b8; font-size:12px; margin:0; line-height:1.5;">
                        Si usted no solicitó este registro, por favor ignore este correo.<br/><br/>
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
            console.error("Resend API Error al Registrar Empresa:", resendError)
            return { success: false, error: `Error de envío: ${resendError.message}.` }
        }

        return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}` }

    } catch (error: any) {
        console.error("Error en registro de empresa:", error)
        return { success: false, error: "Ocurrió un error inesperado al registrar la empresa." }
    }
}


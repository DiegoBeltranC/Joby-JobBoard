"use server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { reenviarOTPAction } from "./auth"
import { toTitleCase } from "@/lib/toTitleCase"
import { setRegistroPendienteCookie, generateOTP } from "@/lib/auth-helpers"
import { sendEmail } from "@/lib/mail"

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
                await setRegistroPendienteCookie(datos.correo)
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
        const { code: initialOtp, expiresAt: otpExpiration } = generateOTP()

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
        await setRegistroPendienteCookie(datos.correo)

        // 5. Enviar Correo OTP (Diseño adaptado para Empresas)
        const resMail = await sendEmail({
            to: datos.correo,
            subject: 'Verifica tu cuenta corporativa - Joby',
            title: 'Verifica tu cuenta corporativa',
            subtitle: 'Portal para Empresas',
            message: '¡Gracias por elegir Joby para conectar con el talento de la UT Chetumal! Para comenzar a publicar vacantes y gestionar tu perfil, ingresa este código de verificación:',
            otpCode: initialOtp,
            buttonText: "Ir a verificar mi cuenta",
            buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verificar-correo?email=${encodeURIComponent(datos.correo)}`,
            extraFooterNote: "Si usted no solicitó este registro, por favor ignore este correo.",
            type: "INFO"
        })

        if (!resMail.success) {
            console.error("Resend API Error al Registrar Empresa:", resMail.error)
            return { success: false, error: `Error de envío: ${resMail.error}.` }
        }

        return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}` }

    } catch (error: any) {
        console.error("Error en registro de empresa:", error)
        return { success: false, error: "Ocurrió un error inesperado al registrar la empresa." }
    }
}


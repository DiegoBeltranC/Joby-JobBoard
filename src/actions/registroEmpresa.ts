"use server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { reenviarOTPAction } from "./auth"
import { sendEmail } from "@/lib/mail"
import { toTitleCase } from "@/lib/toTitleCase"

export async function registrarEmpresa(datos: {
    correo: string;
    password: string;
    nombre_comercial: string;
    rfc: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    cargo_contacto: string;
}) {
    try {
        // 1. Verificar si el correo ya existe
        const usuarioExistente = await prisma.user.findUnique({
            where: { correo: datos.correo }
        })

        // Edge Case: Limbo (Abandonó el OTP en intento previo)
        if (usuarioExistente && !usuarioExistente.verifiedAt) {
            // El usuario existe pero no está verificado. Renovar su OTP.
            await reenviarOTPAction(datos.correo)
            return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}` }
        }

        if (usuarioExistente) {
            return { success: false, error: "Este correo ya está registrado en Joby." }
        }

        // 2. Verificar si el RFC ya está en uso
        if (datos.rfc) {
            const rfcExistente = await prisma.empresa.findUnique({
                where: { rfc: datos.rfc }
            })

            if (rfcExistente) {
                return { success: false, error: "Este RFC ya está registrado por otra empresa." }
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

        // 5. Enviar Correo OTP (Diseño adaptado para Empresas)
        const resMail = await sendEmail({
            to: datos.correo,
            subject: 'Verifica tu cuenta corporativa - Joby',
            title: 'Verifica tu cuenta corporativa',
            message: `¡Gracias por elegir Joby para conectar con el talento de la UT Chetumal! Para comenzar a publicar vacantes y gestionar tu perfil, ingresa este código de verificación:\n\n${initialOtp}\n\nEste código es válido por 15 minutos.`,
            type: "INFO"
        });

        if (!resMail.success) {
            console.error("Resend API Error al Registrar Empresa:", resMail.error)
            // No bloqueamos el registro si el correo falla, avisamos
            return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}&warning=mail_failed` }
        }

        return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}` }

    } catch (error: any) {
        console.error("Error en registro de empresa:", error)
        return { success: false, error: "Ocurrió un error inesperado al registrar la empresa." }
    }
}


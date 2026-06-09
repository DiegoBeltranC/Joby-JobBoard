"use server"
import { prisma } from "@/lib/prisma" // Asumo que tienes tu cliente aquí
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { reenviarOTPAction } from "./auth"
import { Resend } from "resend"
import { sendEmail } from "@/lib/mail"
import { toTitleCase } from "@/lib/toTitleCase"
const resend = new Resend(process.env.RESEND_API_KEY)

export async function registrarEstudiante(datos: any, redirectTarget?: string) {
    try {
        const redirectSuffix = redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : ""

        // Si el usuario cambió su correo desde la pantalla de verificación, eliminamos el limbo anterior
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

            // Actualizar datos de cuenta y perfil estudiantil por si modificó otros campos
            await prisma.user.update({
                where: { id: usuarioExistente.id },
                data: {
                    password_hash: hashedPassword,
                    estudiante: {
                        update: {
                            nombre: toTitleCase(datos.nombre),
                            apellidoPaterno: toTitleCase(datos.apellidoPaterno),
                            apellidoMaterno: datos.apellidoMaterno?.trim() ? toTitleCase(datos.apellidoMaterno) : null,
                            matricula: datos.matricula,
                            estatus_academico: datos.estatus_academico,
                            periodo_academico: datos.periodo_academico ? parseInt(datos.periodo_academico) : null,
                            carreraId: parseInt(datos.carreraId)
                        }
                    }
                }
            })

            // Si el OTP sigue siendo válido, no generamos uno nuevo ni enviamos correo para evitar spam.
            // Simplemente lo redirigimos indicando que ya tiene un código activo.
            if (isOtpValid) {
                const cookieStore = await cookies()
                cookieStore.set("registro_pendiente", datos.correo, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 15 * 60,
                    sameSite: "lax",
                    path: "/",
                })
                return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}${redirectSuffix}&status=already_sent` }
            }

            // Si el OTP ya expiró, entonces renovamos el OTP (pasando por el validador de cooldown de la acción)
            const resReenviar = await reenviarOTPAction(datos.correo)
            if (resReenviar.error) {
                return { success: false, error: resReenviar.error }
            }

            return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}${redirectSuffix}` }
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
            // Si el OTP del alumno en limbo ya expiró, eliminamos ese usuario viejo para permitir el nuevo registro con esta matrícula
            if (matriculaExistente.usuario.otpExpiresAt && new Date() > matriculaExistente.usuario.otpExpiresAt) {
                await prisma.user.delete({
                    where: { id: matriculaExistente.usuario.id }
                })
            } else {
                const resReenviar = await reenviarOTPAction(matriculaExistente.usuario.correo)
                if (resReenviar.error) return { success: false, error: resReenviar.error }
                return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(matriculaExistente.usuario.correo)}${redirectSuffix}` }
            }
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
                ultimo_reenvio_at: new Date(),
                intentos_reenvio: 0,
                estudiante: {
                    create: {
                        nombre: toTitleCase(datos.nombre),
                        apellidoPaterno: toTitleCase(datos.apellidoPaterno),
                        apellidoMaterno: datos.apellidoMaterno?.trim()
                            ? toTitleCase(datos.apellidoMaterno)
                            : null,
                        matricula: datos.matricula,
                        estatus_academico: datos.estatus_academico,
                        periodo_academico: datos.periodo_academico ? parseInt(datos.periodo_academico) : null,
                        universidadId: universidad.id,
                        carreraId: parseInt(datos.carreraId)
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

        // 7. Enviar Correo OTP
        const resMail = await sendEmail({
            to: datos.correo,
            subject: 'Tu código de verificación - Joby',
            title: '¡Bienvenido a la bolsa de trabajo!',
            message: `Casi todo está listo. Para completar la creación de tu cuenta, por favor verifica tu correo ingresando este código de 6 dígitos:\n\n${initialOtp}\n\nEste código expira automáticamente en 15 minutos.`,
            buttonText: "Ir a verificar mi cuenta",
            buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verificar-correo?email=${encodeURIComponent(datos.correo)}`,
            type: "SUCCESS"
        })

        if (!resMail.success) {
            console.error("Mail Error al Registrar:", resMail.error)
            // No bloqueamos el registro si el correo falla, avisamos al usuario
            return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}${redirectSuffix}&warning=mail_failed` }
        }

        return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}${redirectSuffix}` }

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

/** Misma lógica de correo que al registrar: bloquea duplicados verificados en paso 1 del wizard */
export async function verificarCorreoDisponibleRegistro(correo: string) {
    try {
        const correoNormalizado = correo.trim().toLowerCase()

        const usuarioExistente = await prisma.user.findUnique({
            where: { correo: correoNormalizado },
        })

        if (!usuarioExistente) {
            return { disponible: true as const }
        }

        if (!usuarioExistente.verifiedAt) {
            const resReenviar = await reenviarOTPAction(correoNormalizado)
            if (resReenviar.error) {
                // Si el error es debido al cooldown (espera), podemos seguir redirigiendo a la pantalla de verificación
                // ya que su código anterior sigue estando vigente.
                if (resReenviar.error.includes("espera")) {
                    const cookieStore = await cookies()
                    cookieStore.set("registro_pendiente", correoNormalizado, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        maxAge: 15 * 60,
                        sameSite: "lax",
                        path: "/",
                    })
                    return {
                        disponible: false as const,
                        redirect: `/verificar-correo?email=${encodeURIComponent(correoNormalizado)}`,
                    }
                }
                return { disponible: false as const, error: resReenviar.error }
            }
            // Renovar cookie registro_pendiente
            const cookieStore = await cookies()
            cookieStore.set("registro_pendiente", correoNormalizado, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 15 * 60,
                sameSite: "lax",
                path: "/",
            })
            return {
                disponible: false as const,
                redirect: `/verificar-correo?email=${encodeURIComponent(correoNormalizado)}`,
            }
        }

        return {
            disponible: false as const,
            error: "Este correo ya está registrado en Joby.",
        }
    } catch (error) {
        console.error("Error al verificar correo en registro:", error)
        return { disponible: false as const, error: "No se pudo verificar el correo. Intenta de nuevo." }
    }
}
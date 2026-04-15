"use server"
import { prisma } from "@/lib/prisma" // Asumo que tienes tu cliente aquí
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { reenviarOTPAction } from "./auth"
import { sendEmail } from "@/lib/mail"

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
        const resMail = await sendEmail({
            to: datos.correo,
            subject: 'Tu código de verificación - Joby',
            title: '¡Bienvenido a la bolsa de trabajo!',
            message: `Casi todo está listo. Para completar la creación de tu cuenta, por favor verifica tu correo ingresando este código de 6 dígitos:\n\n${initialOtp}\n\nEste código expira automáticamente en 15 minutos.`,
            type: "SUCCESS"
        })

        if (!resMail.success) {
            console.error("Mail Error al Registrar:", resMail.error)
            // No bloqueamos el registro si el correo falla, avisamos al usuario
            return { success: true, redirect: `/verificar-correo?email=${encodeURIComponent(datos.correo)}&warning=mail_failed` }
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
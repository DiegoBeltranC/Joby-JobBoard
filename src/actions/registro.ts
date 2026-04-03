"use server"
import { prisma } from "@/lib/prisma" // Asumo que tienes tu cliente aquí
import bcrypt from "bcryptjs"

export async function registrarEstudiante(datos: any) {
    try {
        // 1. Verificar si el correo ya existe
        const usuarioExistente = await prisma.user.findUnique({
            where: { correo: datos.correo }
        })

        if (usuarioExistente) {
            return { success: false, error: "Este correo ya está registrado en Joby." }
        }

        // 1.5 Verificar si la matrícula ya está en uso
        const matriculaExistente = await prisma.estudiante.findUnique({
            where: { matricula: datos.matricula }
        })

        if (matriculaExistente) {
            return { success: false, error: "Esta matrícula ya está registrada por otro alumno." }
        }

        if (usuarioExistente) {
            return { success: false, error: "Este correo ya está registrado en Joby." }
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

        // 4. TRANSACCIÓN: Crear Usuario y Perfil Estudiante al mismo tiempo
        // Si falla el estudiante, no se crea el usuario (Nested Writes de Prisma)
        const nuevoUsuario = await prisma.user.create({
            data: {
                correo: datos.correo,
                password_hash: hashedPassword,
                rol: "ESTUDIANTE",
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

        return { success: true, message: "Cuenta creada con éxito." }

    } catch (error) {
        console.error("Error en registro:", error)
        return { success: false, error: "Ocurrió un error inesperado al registrar tu cuenta." }
    }
}
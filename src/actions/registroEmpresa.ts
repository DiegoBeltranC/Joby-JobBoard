"use server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

function toTitleCase(str: string): string {
    return str.trim().replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
}

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

        // 4. TRANSACCIÓN: Crear Usuario y Perfil Empresa al mismo tiempo
        const nuevoUsuario = await prisma.user.create({
            data: {
                correo: datos.correo,
                password_hash: hashedPassword,
                rol: "EMPRESA",
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

        return { success: true, message: "Cuenta empresarial creada con éxito." }

    } catch (error) {
        console.error("Error en registro de empresa:", error)
        return { success: false, error: "Ocurrió un error inesperado al registrar la empresa." }
    }
}

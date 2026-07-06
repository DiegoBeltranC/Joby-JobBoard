"use server"

import { prisma } from "@/lib/prisma"

export type VerificacionRegistroResult =
    | { ok: true }
    | { ok: false; error: string }

function normalizarCorreo(correo: string) {
    return correo.trim().toLowerCase()
}

/** Comprueba correo antes de avanzar del paso «Cuenta» (estudiante o empresa). Sin efectos secundarios (no reenvía OTP). */
export async function verificarCorreoParaRegistro(correoRaw: string): Promise<VerificacionRegistroResult> {
    const correo = normalizarCorreo(correoRaw)
    if (!correo) return { ok: false, error: "Correo inválido" }

    const usuario = await prisma.user.findUnique({ where: { correo } })
    if (!usuario) return { ok: true }

    if (usuario.verifiedAt) {
        return { ok: false, error: "Este correo ya está registrado en Joby." }
    }

    return {
        ok: false,
        error:
            "Ya hay un registro pendiente con este correo. Completa la verificación en la página «Verificar correo» o inicia sesión cuando tu cuenta esté activa.",
    }
}

/** Comprueba matrícula antes de avanzar del paso «Identidad». Sin reenviar OTP. */
export async function verificarMatriculaParaRegistro(
    matriculaRaw: string,
    correoFormularioRaw: string
): Promise<VerificacionRegistroResult> {
    const matricula = matriculaRaw.trim()
    const correoFormulario = normalizarCorreo(correoFormularioRaw)

    if (!/^\d{10}$/.test(matricula)) {
        return { ok: false, error: "La matrícula debe tener exactamente 10 números" }
    }

    const registro = await prisma.estudiante.findUnique({
        where: { matricula },
        include: { usuario: true },
    })

    if (!registro) return { ok: true }

    if (registro.usuario.verifiedAt) {
        return { ok: false, error: "Esta matrícula ya está registrada por otro alumno." }
    }

    if (registro.usuario.correo !== correoFormulario) {
        return {
            ok: false,
            error: `Esta matrícula ya tiene un registro pendiente con el correo ${registro.usuario.correo}. Usa ese correo para continuar o completa la verificación.`,
        }
    }

    return {
        ok: false,
        error:
            "Ya existe un registro pendiente con esta matrícula y tu correo. Ve a la página «Verificar correo» para ingresar el código y activar tu cuenta.",
    }
}

/** Comprueba RFC opcional antes de avanzar del paso «Empresa». */
export async function verificarRfcEmpresaParaRegistro(rfcRaw: string): Promise<VerificacionRegistroResult> {
    const rfc = rfcRaw.trim().toUpperCase()
    if (!rfc) return { ok: true }

    const existe = await prisma.empresa.findUnique({ where: { rfc } })
    if (existe) {
        return { ok: false, error: "Este RFC ya está registrado por otra empresa." }
    }

    return { ok: true }
}

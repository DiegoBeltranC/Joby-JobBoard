"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function vincularRelojAction(codigo: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "No autorizado" };
    }

    if (!codigo || codigo.length !== 6) {
      return { success: false, error: "El código debe tener 6 caracteres" };
    }

    const relojYaVinculado = await prisma.deviceLinkCode.findFirst({
        where: { usuarioId: session.userId, status: "VINCULADO" }
    });

    if (relojYaVinculado) {
        return { success: false, error: "Ya tienes un reloj vinculado. Desvincúlalo primero." };
    }

    const linkCode = await prisma.deviceLinkCode.findUnique({
      where: { codigo },
    });

    if (!linkCode) {
      return { success: false, error: "Código inválido o no existe" };
    }

    if (linkCode.status === "VINCULADO") {
      return { success: false, error: "Este código ya ha sido vinculado" };
    }

    if (linkCode.expiresAt < new Date()) {
      return { success: false, error: "Este código ha expirado" };
    }

    // Vincular el dispositivo al usuario
    await prisma.deviceLinkCode.update({
      where: { id: linkCode.id },
      data: {
        usuarioId: session.userId,
        status: "VINCULADO",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al vincular el reloj:", error);
    return { success: false, error: "Ocurrió un error inesperado al vincular" };
  }
}

export async function desvincularRelojAction() {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return { success: false, error: "No autorizado" };
        }

        // Eliminar el enlace del dispositivo
        await prisma.deviceLinkCode.deleteMany({
            where: {
                usuarioId: session.userId,
                status: "VINCULADO",
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error al desvincular el reloj:", error);
        return { success: false, error: "Ocurrió un error inesperado al desvincular" };
    }
}

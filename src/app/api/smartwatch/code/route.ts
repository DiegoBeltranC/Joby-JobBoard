import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP } from "@/lib/auth-helpers";

export async function GET() {
  try {
    // Usa el helper existente para generar el código y expiración
    const { code, expiresAt } = generateOTP();

    const linkCode = await prisma.deviceLinkCode.create({
      data: {
        codigo: code,
        expiresAt,
        status: "PENDIENTE",
      },
    });

    return NextResponse.json({ codigo: linkCode.codigo, expiresAt: linkCode.expiresAt });
  } catch (error) {
    console.error("Error generating smartwatch code:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

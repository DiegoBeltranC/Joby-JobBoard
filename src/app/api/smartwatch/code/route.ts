import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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

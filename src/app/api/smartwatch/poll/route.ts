import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encodeId } from "@/lib/utils/hash";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Código no proporcionado" }, { status: 400 });
  }

  try {
    const linkCode = await prisma.deviceLinkCode.findUnique({
      where: { codigo: code },
    });

    if (!linkCode) {
      return NextResponse.json({ error: "Código inválido o no existe" }, { status: 404 });
    }

    if (linkCode.status === "VINCULADO" && linkCode.usuarioId) {
      const estudiante = await prisma.estudiante.findUnique({
        where: { usuarioId: linkCode.usuarioId },
        select: { id: true },
      });

      if (!estudiante) {
        return NextResponse.json({ error: "El usuario no es un estudiante" }, { status: 403 });
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jobychetumal.online";
      const qr_url = `${baseUrl}/perfil-publico-estudiante/${encodeId(estudiante.id)}`;

      return NextResponse.json({ linked: true, qr_url });
    }

    if (linkCode.expiresAt < new Date()) {
      return NextResponse.json({ error: "El código ha expirado", expired: true }, { status: 400 });
    }

    return NextResponse.json({ linked: false });
  } catch (error) {
    console.error("Error polling smartwatch code:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

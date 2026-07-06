import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // Opcional: Validar token de autorización para evitar ejecuciones externas no autorizadas
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  try {
    const ahora = new Date();
    
    // 1. Buscar los usuarios cuya fecha límite de eliminación ya expiró (cuentas suspendidas)
    const usuariosParaEliminar = await prisma.user.findMany({
      where: {
        scheduledDeletionAt: {
          lte: ahora,
        },
      },
    });

    const idsParaEliminar = usuariosParaEliminar.map((u) => u.id);

    // 2. Buscar usuarios en "Limbo" (no verificados) cuyo OTP expiró hace más de 24 horas
    const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    const limboUsuariosParaEliminar = await prisma.user.findMany({
      where: {
        verifiedAt: null,
        otpExpiresAt: {
          lt: hace24Horas,
        },
      },
    });

    const idsLimboParaEliminar = limboUsuariosParaEliminar.map((u) => u.id);
    
    // 3. Combinar ambos listados para eliminarlos
    const todosLosIds = [...idsParaEliminar, ...idsLimboParaEliminar];

    if (todosLosIds.length === 0) {
      return NextResponse.json({
        message: "No hay cuentas expiradas ni en limbo para limpiar.",
        deletedCount: 0,
      });
    }

    // Debido al onDelete: Cascade en schema.prisma,
    // eliminar el User eliminará automáticamente el perfil de Estudiante / Empresa,
    // y a su vez Estudiante eliminará de forma cascada sus postulaciones, proyectos, experiencias, etc.
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: {
          in: todosLosIds,
        },
      },
    });

    return NextResponse.json({
      message: `Limpieza de cuentas completada exitosamente.`,
      deletedCount: deleteResult.count,
      deletedUserIds: todosLosIds,
    });
  } catch (error) {
    console.error("Error en cron cleanup-users:", error);
    return NextResponse.json(
      { error: "Error interno al ejecutar la limpieza de usuarios." },
      { status: 500 }
    );
  }
}

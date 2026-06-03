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
    
    // Buscar los usuarios cuya fecha límite de eliminación ya expiró
    const usuariosParaEliminar = await prisma.user.findMany({
      where: {
        scheduledDeletionAt: {
          lte: ahora,
        },
      },
    });

    if (usuariosParaEliminar.length === 0) {
      return NextResponse.json({
        message: "No hay cuentas expiradas para limpiar.",
        deletedCount: 0,
      });
    }

    const idsParaEliminar = usuariosParaEliminar.map((u) => u.id);

    // Debido al onDelete: Cascade en schema.prisma,
    // eliminar el User eliminará automáticamente el perfil de Estudiante / Empresa,
    // y a su vez Estudiante eliminará de forma cascada sus postulaciones, proyectos, experiencias, etc.
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: {
          in: idsParaEliminar,
        },
      },
    });

    return NextResponse.json({
      message: `Limpieza de cuentas completada exitosamente.`,
      deletedCount: deleteResult.count,
      deletedUserIds: idsParaEliminar,
    });
  } catch (error) {
    console.error("Error en cron cleanup-users:", error);
    return NextResponse.json(
      { error: "Error interno al ejecutar la limpieza de usuarios." },
      { status: 500 }
    );
  }
}

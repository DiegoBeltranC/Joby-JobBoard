import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

// Esquema de validación con Zod
const ExperienciaSchema = z.object({
  empresa: z.string().min(1, "El nombre de la empresa es obligatorio"),
  puesto: z.string().min(1, "El puesto es obligatorio"),
  logros: z.array(z.string()).default([]),
  fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  fechaFin: z.string().nullable().optional()
});

const ImportarPerfilSchema = z.object({
  resumen: z.string().default(""),
  habilidades: z.array(z.string()).default([]),
  idiomas: z.array(z.string()).default([]),
  experiencias: z.array(ExperienciaSchema).default([])
});

// Función helper para parsear fechas de forma segura
function parseFechaSegura(fechaStr: string | null | undefined, esObligatoria = false): Date | null {
  if (!fechaStr) return esObligatoria ? new Date() : null;
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) {
    return esObligatoria ? new Date() : null;
  }
  return fecha;
}

export async function POST(request: Request) {
  try {
    // 1. Validar autenticación
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = Number(session.userId);

    // 2. Re-verificar límites de IA por seguridad - Desactivado temporalmente por petición del usuario
    /*
    const subscription = await prisma.subscription.findUnique({
      where: { usuarioId: userId },
    });

    const isPremium = subscription && subscription.plan === "PREMIUM" && subscription.status === "ACTIVE";

    if (!isPremium) {
      const primerDiaMes = new Date();
      primerDiaMes.setDate(1);
      primerDiaMes.setHours(0, 0, 0, 0);

      const countLogs = await prisma.aIUsageLog.count({
        where: {
          usuarioId: userId,
          createdAt: { gte: primerDiaMes },
        },
      });

      const LIMITE_FREE = 3;

      if (countLogs >= LIMITE_FREE) {
        return NextResponse.json({
          error: 'PAYWALL_LIMIT',
          message: 'Has alcanzado el límite de 3 análisis de CV con IA gratuitos este mes. ¡Suscríbete a Premium para uso ilimitado!',
        }, { status: 402 });
      }
    }
    */

    // 3. Obtener y validar el cuerpo de la petición
    const body = await request.json();
    const result = ImportarPerfilSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'INVALID_DATA', 
        message: 'Los datos proporcionados no son válidos.',
        details: result.error.format()
      }, { status: 400 });
    }

    const { resumen, habilidades, idiomas, experiencias } = result.data;

    // 4. Obtener el registro de Estudiante del usuario
    const estudiante = await prisma.estudiante.findUnique({
      where: { usuarioId: userId }
    });

    if (!estudiante) {
      return NextResponse.json({ error: 'Perfil de estudiante no encontrado' }, { status: 404 });
    }

    // 5. Ejecutar operaciones en base de datos en una sola Transacción Atómica
    await prisma.$transaction(async (tx) => {
      // A. Actualizar resumen (bio), habilidades e idiomas en el estudiante
      await tx.estudiante.update({
        where: { id: estudiante.id },
        data: {
          bio: resumen,
          habilidades: habilidades,
          idiomas: idiomas
        }
      });

      // B. Eliminar experiencias previas del estudiante
      await tx.experiencia.deleteMany({
        where: { estudianteId: estudiante.id }
      });

      // C. Crear las nuevas experiencias
      if (experiencias.length > 0) {
        await tx.experiencia.createMany({
          data: experiencias.map((exp) => ({
            estudianteId: estudiante.id,
            puesto: exp.puesto,
            empresa: exp.empresa,
            logros: exp.logros,
            fechaInicio: parseFechaSegura(exp.fechaInicio, true) as Date,
            fechaFin: exp.fechaFin ? parseFechaSegura(exp.fechaFin, false) : null
          }))
        });
      }

      // D. Registrar el log de uso de la IA (Solo si todo lo anterior tiene éxito)
      await tx.aIUsageLog.create({
        data: {
          usuarioId: userId,
          action: 'CV_PDF_PARSE',
          modelUsed: 'gemini-2.5-flash'
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Perfil actualizado con éxito con los datos del CV.' });

  } catch (error: any) {
    console.error("Error al guardar perfil con IA:", error);
    return NextResponse.json({ 
      error: 'DATABASE_ERROR',
      message: 'Ocurrió un error al guardar los datos en tu perfil profesional.' 
    }, { status: 500 });
  }
}

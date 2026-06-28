import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server'; // Recompilación limpia
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const cvSchema = {
  type: "object",
  properties: {
    resumen: { 
      type: "string", 
      description: "Resumen profesional o descripción del perfil optimizada. Máximo 300 caracteres." 
    },
    habilidades: {
      type: "array",
      description: "Lista de conocimientos técnicos y habilidades.",
      items: { type: "string" }
    },
    idiomas: {
      type: "array",
      description: "Idiomas y niveles.",
      items: { type: "string" }
    },
    experienciasLogros: {
      type: "array",
      description: "Lista de arreglos de logros para cada experiencia laboral, en el mismo orden que el original.",
      items: {
        type: "array",
        items: { type: "string" }
      }
    },
    proyectosPuntosClave: {
      type: "array",
      description: "Lista de arreglos de puntos clave para cada proyecto destacado, en el mismo orden que el original.",
      items: {
        type: "array",
        items: { type: "string" }
      }
    }
  },
  required: ["resumen", "habilidades", "idiomas", "experienciasLogros", "proyectosPuntosClave"]
};

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = Number(session.userId);

    // Paywall check desactivado temporalmente por petición del usuario
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
          message: 'Has alcanzado el límite mensual de uso de herramientas de IA. ¡Suscríbete a Premium para tener uso ilimitado!',
        }, { status: 402 });
      }
    }
    */

    // Get input data
    const inputData = await request.json();

    const prompt = `Eres un experto en reclutamiento de personal y redacción de currículums de alto nivel.
Tu tarea es tomar el contenido actual del currículum (resumen profesional, experiencias y proyectos) y reescribirlo para que suene sumamente profesional, vendedor e impactante, utilizando verbos de acción fuertes y un tono corporativo adecuado.

REGLAS DE OPTIMIZACIÓN COMPACTA:
1. No inventes información nueva. No agregues habilidades que el usuario no tiene ni empresas o puestos diferentes.
2. Mantén la esencia, el contexto original, las tecnologías mencionadas y las responsabilidades principales.
3. Haz que las descripciones y logros sean notablemente más concisos, directos y potentes, eliminando palabras innecesarias y redundancias para que la información ocupe mucho menos espacio físico (ayudando a que quepa en una sola hoja).
4. El resumen profesional (bio) debe redactarse en tercera persona o primera persona profesional, con un máximo de 300 caracteres.
5. Los logros de las experiencias deben sonar orientados a resultados y éxitos tangibles.

Optimiza el siguiente contenido JSON:
${JSON.stringify(inputData, null, 2)}

Devuelve la información estructurada EXACTAMENTE bajo el esquema JSON especificado.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: cvSchema,
        temperature: 0.3
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("No se obtuvo respuesta de la IA");
    }

    const optimizedData = JSON.parse(textResponse);

    // Registrar uso
    await prisma.aIUsageLog.create({
      data: {
        usuarioId: userId,
        action: "CV_REWRITE",
        modelUsed: "gemini-2.5-flash"
      }
    });

    return NextResponse.json({ success: true, data: optimizedData });

  } catch (error: any) {
    console.error("Error al optimizar el CV con IA:", error);
    return NextResponse.json({ 
      error: 'ERROR_PROCESSING',
      message: error.message || 'Ocurrió un error al optimizar el documento con la IA.' 
    }, { status: 500 });
  }
}

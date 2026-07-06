import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.includes("<think>")) {
    const thinkEndIndex = cleaned.indexOf("</think>");
    if (thinkEndIndex !== -1) {
      cleaned = cleaned.substring(thinkEndIndex + 8).trim();
    }
  }
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();

  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    } else {
      const firstBracket = cleaned.indexOf("[");
      const lastBracket = cleaned.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      }
    }
  }
  return cleaned.trim();
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = Number(session.userId);

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

Devuelve la información estructurada EXACTAMENTE bajo el esquema JSON especificado. No incluyas explicaciones adicionales, ni introducciones, sólo el objeto JSON limpio.

ESQUEMA JSON:
${JSON.stringify(cvSchema, null, 2)}`;

    const apiKey = process.env.MINIMAX_API_KEY || process.env.GEMINI_API_KEY;
    const res = await fetch("https://api.minimax.io/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "MiniMax-M3",
        messages: [
          { role: "system", content: "Eres un asistente de IA experto que responde únicamente con JSON válido, sin bloques de código markdown." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`MiniMax API error: ${res.status} - ${errorText}`);
    }

    const resJson = await res.json();
    let textResponse = resJson.choices?.[0]?.message?.content;
    if (!textResponse) {
      throw new Error("No se obtuvo respuesta de la IA (MiniMax)");
    }

    textResponse = cleanJsonResponse(textResponse);
    const optimizedData = JSON.parse(textResponse);

    // Registrar uso
    await prisma.aIUsageLog.create({
      data: {
        usuarioId: userId,
        action: "CV_REWRITE",
        modelUsed: "MiniMax-M3"
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

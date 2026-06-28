import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const cvSchema = {
  type: "object",
  properties: {
    resumen: { 
      type: "string", 
      description: "Resumen profesional o descripción del perfil (elevator pitch). Máximo 300 caracteres." 
    },
    habilidades: {
      type: "array",
      description: "Lista de conocimientos técnicos, herramientas o habilidades blandas.",
      items: { type: "string" }
    },
    idiomas: {
      type: "array",
      description: "Idiomas y niveles (ej. Inglés - B2, Español - Nativo).",
      items: { type: "string" }
    },
    experiencias: {
      type: "array",
      description: "Lista de empleos y experiencias laborales anteriores.",
      items: {
        type: "object",
        properties: {
          empresa: { type: "string", description: "Nombre de la empresa o institución" },
          puesto: { type: "string", description: "Cargo o rol desempeñado" },
          logros: { 
            type: "array", 
            description: "Lista de viñetas con tareas, responsabilidades y logros.", 
            items: { type: "string" } 
          },
          fechaInicio: { 
            type: "string", 
            description: "Fecha de inicio en formato YYYY-MM-DD. Si solo menciona el año, rellenar como YYYY-01-01." 
          },
          fechaFin: { 
            type: "string", 
            description: "Fecha de finalización en formato YYYY-MM-DD. Dejar vacío si es el empleo actual." 
          }
        },
        required: ["empresa", "puesto", "fechaInicio"]
      }
    }
  },
  required: ["resumen", "habilidades", "idiomas", "experiencias"]
};

export async function POST(request: Request) {
  try {
    // 1. Validar autenticación
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = Number(session.userId);

    // 2. Lógica de Bloqueo (Paywall / Gating) - Desactivado temporalmente por petición del usuario
    /*
    const subscription = await prisma.subscription.findUnique({
      where: { usuarioId: userId },
    });

    const isPremium = subscription && subscription.plan === "PREMIUM" && subscription.status === "ACTIVE";

    if (!isPremium) {
      // Contar usos de IA en el mes actual para usuarios FREE
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
          message: 'Has alcanzado el límite de 3 análisis de CV con IA gratuitos este mes. ¡Suscríbete a Premium para tener uso ilimitado!',
        }, { status: 402 }); // 402: Payment Required
      }
    }
    */

    // 3. Recibir el archivo del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Archivo no encontrado en la petición' }, { status: 400 });
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Solo se aceptan PDFs e imágenes.' }, { status: 400 });
    }

    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo excede el tamaño máximo permitido de 3MB' }, { status: 400 });
    }

    // 4. Convertir el archivo a Base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    // 4.5. Validación inicial del documento para evitar procesar archivos que no son CV
    const validationSchema = {
      type: "object",
      properties: {
        esCV: {
          type: "boolean",
          description: "true si el documento es un Currículum Vitae, Resumen Profesional, Hoja de Vida o perfil laboral de una persona. false en caso contrario."
        }
      },
      required: ["esCV"]
    };

    const valPrompt = `Analiza el documento adjunto y determina si corresponde a un Currículum Vitae (CV), Resumen Profesional, Hoja de Vida o perfil de trayectoria laboral de una persona.
Responde únicamente con el esquema JSON indicado, indicando true en esCV si es un currículum, o false si es cualquier otro tipo de documento (tarea escolar, factura, receta, libro, imagen no relacionada, etc.).`;

    const valResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { data: base64Data, mimeType: mimeType } },
        { text: valPrompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: validationSchema,
        temperature: 0.0
      }
    });

    const valText = valResponse.text;
    if (valText) {
      const valResult = JSON.parse(valText);
      if (valResult.esCV === false) {
        return NextResponse.json({
          error: 'INVALID_DOCUMENT',
          message: 'El archivo subido no parece ser un currículum vitae válido. Por favor, sube un documento con tu trayectoria profesional.'
        }, { status: 400 });
      }
    }

    const prompt = `Eres un experto procesador de datos. Tu tarea es extraer la información del currículum adjunto y estructurarla EXACTAMENTE según el esquema JSON proporcionado.

REGLAS ESTRICTAS:
No inventes información. Si un dato no aparece explícitamente en el documento, debes devolver un string vacío ("") o un arreglo vacío ([]).
No agregues claves ni campos nuevos que no estén definidos en el esquema.
Ajusta las fechas al formato más limpio posible (Ej. 'Enero 2020 - Diciembre 2022' o '2020-2022').
Ignora cualquier diseño visual, céntrate puramente en extraer el texto y mapearlo al esquema.`;

    // 5. Llamada Multimodal a Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { data: base64Data, mimeType: mimeType } }, 
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: cvSchema,
        temperature: 0.0
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("No se obtuvo respuesta de la IA");
    }

    const cvData = JSON.parse(textResponse);

    // Devolvemos los datos para vista previa del frontend sin guardarlos en la BD
    return NextResponse.json({ success: true, data: cvData });

  } catch (error: any) {
    console.error("Error al procesar el CV con IA:", error);
    return NextResponse.json({ 
      error: 'ERROR_PROCESSING',
      message: 'Ocurrió un error al analizar el documento con la IA. Asegúrate de que el formato sea legible.' 
    }, { status: 500 });
  }
}

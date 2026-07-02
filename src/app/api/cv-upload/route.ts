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
    },
    educacion: {
      type: "array",
      description: "Lista de títulos académicos, carreras, cursos relevantes, certificaciones o estudios adicionales del candidato.",
      items: {
        type: "object",
        properties: {
          titulo: { type: "string", description: "Nombre de la carrera, grado, curso o certificación (ej: TSU en Desarrollo de Software, Certificación Scrum Master)" },
          institucion: { type: "string", description: "Universidad, instituto, escuela o emisor del certificado (ej: UT Chetumal, Platzi)" },
          año: { type: "integer", description: "Año de obtención o finalización. Si no se menciona o no está claro, omitir o dejar vacío." }
        },
        required: ["titulo", "institucion"]
      }
    }
  },
  required: ["resumen", "habilidades", "idiomas", "experiencias", "educacion"]
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

async function callMiniMax(messages: any[], temperature = 0.0, model = "MiniMax-M3", maxTokens = 4096) {
  const apiKey = process.env.MINIMAX_API_KEY || process.env.GEMINI_API_KEY;
  const res = await fetch("https://api.minimax.io/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`MiniMax API error: ${res.status} - ${errorText}`);
  }

  const resJson = await res.json();
  const textResponse = resJson.choices?.[0]?.message?.content;
  if (!textResponse) {
    throw new Error("No se obtuvo respuesta de la IA (MiniMax)");
  }
  return cleanJsonResponse(textResponse);
}

export async function POST(request: Request) {
  try {
    // 1. Validar autenticación
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = Number(session.userId);

    // 2. Recibir el archivo del FormData
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

    // 3. Convertir el archivo a Buffer/Base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    // 4. Extraer texto o preparar mensaje de contenido según el tipo
    let documentText = "";
    const isPdf = mimeType === 'application/pdf';

    if (isPdf) {
      try {
        // Polyfill para evitar errores de DOMMatrix en entornos Next.js Node
        if (typeof global !== 'undefined') {
          if (!(global as any).DOMMatrix) {
            (global as any).DOMMatrix = class DOMMatrix {};
          }
          if (!(global as any).ImageData) {
            (global as any).ImageData = class ImageData {};
          }
          if (!(global as any).Path2D) {
            (global as any).Path2D = class Path2D {};
          }
          if (!(global as any).pdfjsWorker) {
            // @ts-ignore
            (global as any).pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
          }
        }
        // @ts-ignore
        const { PDFParse } = require('pdf-parse');
        const buffer = Buffer.from(arrayBuffer);
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        documentText = pdfData.text || "";
        await parser.destroy();
      } catch (pdfErr) {
        console.error("Error al extraer texto del PDF:", pdfErr);
        return NextResponse.json({ error: 'No se pudo leer el archivo PDF. Asegúrate de que no esté protegido o dañado.' }, { status: 400 });
      }
    }

    const modelToUse = "MiniMax-M3";

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

    let valMessages: any[] = [];
    if (isPdf) {
      valMessages = [
        { role: "system", content: `Eres un asistente de IA experto que responde únicamente con JSON válido.\n\nEsquema requerido:\n${JSON.stringify(validationSchema, null, 2)}` },
        { role: "user", content: `${valPrompt}\n\nContenido del documento:\n${documentText}` }
      ];
    } else {
      valMessages = [
        { role: "system", content: `Eres un asistente de IA experto que responde únicamente con JSON válido.\n\nEsquema requerido:\n${JSON.stringify(validationSchema, null, 2)}` },
        { 
          role: "user", 
          content: [
            { type: "text", text: valPrompt },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
          ]
        }
      ];
    }

    const valText = await callMiniMax(valMessages, 0.0, modelToUse, 100);
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

    let extractMessages: any[] = [];
    if (isPdf) {
      extractMessages = [
        { role: "system", content: `Eres un asistente de IA experto que responde únicamente con JSON válido.\n\nEsquema requerido:\n${JSON.stringify(cvSchema, null, 2)}` },
        { role: "user", content: `${prompt}\n\nContenido del documento:\n${documentText}` }
      ];
    } else {
      extractMessages = [
        { role: "system", content: `Eres un asistente de IA experto que responde únicamente con JSON válido.\n\nEsquema requerido:\n${JSON.stringify(cvSchema, null, 2)}` },
        { 
          role: "user", 
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
          ]
        }
      ];
    }

    // 5. Llamada Multimodal o de Texto a MiniMax
    const textResponse = await callMiniMax(extractMessages, 0.0, modelToUse, 4096);
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

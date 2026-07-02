import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const data = searchParams.get('data');

  if (!data) {
    return new NextResponse('Falta el parámetro "data"', { status: 400 });
  }

  try {
    // Generamos el QR como un Buffer de imagen PNG directamente en el servidor
    const qrBuffer = await QRCode.toBuffer(data, {
      width: 350,
      margin: 2,
      color: {
        dark: '#009374',   // Verde UT Joby exacto
        light: '#ffffff',  // Fondo blanco
      },
      errorCorrectionLevel: 'H' // Nivel de corrección Alto
    });

    // Retornamos el Buffer con las cabeceras HTTP de imagen
    return new NextResponse(new Uint8Array(qrBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable', // Caché por 1 año
      },
    });
  } catch (error) {
    console.error('Error al generar el QR:', error);
    return new NextResponse('Error interno al generar QR', { status: 500 });
  }
}

const fs = require('fs');

async function test() {
  try {
    // Polyfill para evitar errores de DOMMatrix en entornos Next.js Node
    if (typeof global !== 'undefined') {
      if (!global.DOMMatrix) {
        global.DOMMatrix = class DOMMatrix {};
      }
      if (!global.ImageData) {
        global.ImageData = class ImageData {};
      }
      if (!global.Path2D) {
        global.Path2D = class Path2D {};
      }
    }
    
    const { PDFParse } = require('pdf-parse');
    const buffer = fs.readFileSync('c:/xampp/htdocs/bolsa-trabajo/dummy.pdf');
    
    // Usamos el constructor de la versión 2.x
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    
    console.log("SUCCESS! Text extracted length:", pdfData.text.length);
    console.log("Text content:", JSON.stringify(pdfData.text));
    
    // Destruimos el parser para limpiar recursos
    await parser.destroy();
  } catch (err) {
    console.error("FAILED with error:", err);
  }
}

test();

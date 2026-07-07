async function test() {
  try {
    const pdfjs = await import('pdfjs-dist');
    console.log("GlobalWorkerOptions keys:", Object.keys(pdfjs.GlobalWorkerOptions));
    console.log("workerSrc currently:", pdfjs.GlobalWorkerOptions.workerSrc);
  } catch (err) {
    console.error("Failed:", err);
  }
}
test();

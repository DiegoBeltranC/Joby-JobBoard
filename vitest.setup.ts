// Polyfills que Radix UI / cmdk necesitan bajo jsdom (no implementados por jsdom).
// Guardado por `typeof Element` para no ejecutarse en los tests de entorno node.
if (typeof Element !== "undefined") {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
}

// cmdk observa el tamaño de su lista; jsdom no trae ResizeObserver.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

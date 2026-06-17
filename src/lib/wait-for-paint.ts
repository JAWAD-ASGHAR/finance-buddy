/** Resolves after document load and web fonts are ready. */
export function waitForDocumentReady(): Promise<void> {
  const fontsReady = document.fonts.ready.then(() => undefined);

  if (document.readyState === "complete") {
    return fontsReady;
  }

  return new Promise((resolve) => {
    window.addEventListener(
      "load",
      () => {
        void fontsReady.then(resolve);
      },
      { once: true },
    );
  });
}

/** Waits for the next two animation frames so layout/paint has committed. */
export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

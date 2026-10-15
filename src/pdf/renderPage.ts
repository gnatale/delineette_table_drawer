import { OutputScale, type PDFPageProxy, type RenderTask } from "pdfjs-dist";

export type PageRenderHandle = {
  task: RenderTask;
  /** Resolves when rendering completes; rejects if cancelled or on error. */
  done: Promise<void>;
  cancel: () => void;
};

export type RenderPageOptions = {
  page: PDFPageProxy;
  canvas: HTMLCanvasElement;
  /** pdf.js scale (1 = 1 CSS pixel per PDF point). */
  scale: number;
  /** Viewport rotation in degrees; defaults to the page’s /Rotate. */
  rotation?: number;
};

/**
 * Renders a PDF page into a canvas using device pixel ratio for sharp output.
 */
export function renderPageToCanvas({
  page,
  canvas,
  scale,
  rotation = page.rotate,
}: RenderPageOptions): PageRenderHandle {
  const viewport = page.getViewport({ scale, rotation });
  const outputScale = new OutputScale();

  /* Flooring here because canvas width/height must be an integer. */
  const cssWidth = Math.floor(viewport.width);
  const cssHeight = Math.floor(viewport.height);

  canvas.width = Math.floor(cssWidth * outputScale.sx);
  canvas.height = Math.floor(cssHeight * outputScale.sy);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not acquire a 2D canvas context.");
  }

  const transform = outputScale.scaled
    ? [outputScale.sx, 0, 0, outputScale.sy, 0, 0]
    : undefined;

  const task = page.render({
    canvas,
    canvasContext: context,
    viewport,
    transform,
  });

  return {
    task,
    done: task.promise,
    cancel: () => {
      task.cancel();
    },
  };
}

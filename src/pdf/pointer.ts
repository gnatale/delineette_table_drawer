import type { PageViewport } from "pdfjs-dist";

import type { QuarterTurn } from "./rotation.ts";
import {
  pdfPointToView,
  type PageGeometry,
  type PdfPoint,
  type ViewPoint,
  viewPointToPdf,
} from "./viewSpace.ts";

/** Max pointer distance from a grid line (CSS px) that still counts as a hit. */
export const HIT_TOLERANCE_CSS_PX = 6;

/** Client size of the page canvas element (CSS px). These sizes can be slightly different
 * from the viewport size because we floored the canvas width/height to integers.
 */
export type ElementClientSize = {
  clientWidth: number;
  clientHeight: number;
};

/** Converts a pointer offset (CSS px) to a point in viewport space (points).
 * This gives a minor correction because of the difference between the canvas
 * and viewport sizes.
 */
function elementOffsetToViewport(
  offsetX: number,
  offsetY: number,
  element: ElementClientSize,
  viewport: PageViewport,
): { x: number; y: number } {
  const { clientWidth, clientHeight } = element;
  if (clientWidth <= 0 || clientHeight <= 0) {
    throw new Error("Element client size must be positive");
  }
  return {
    x: (offsetX / clientWidth) * viewport.width,
    y: (offsetY / clientHeight) * viewport.height,
  };
}

/** Inverse of {@link elementOffsetToViewport}. */
function viewportToElementOffset(
  viewportX: number,
  viewportY: number,
  element: ElementClientSize,
  viewport: PageViewport,
): { offsetX: number; offsetY: number } {
  const { clientWidth, clientHeight } = element;
  if (clientWidth <= 0 || clientHeight <= 0) {
    throw new Error("Element client size must be positive");
  }
  return {
    offsetX: (viewportX / viewport.width) * clientWidth,
    offsetY: (viewportY / viewport.height) * clientHeight,
  };
}

/** Maps a pointer inside the page canvas element to view space. */
export function clientPointToView(
  offsetX: number,
  offsetY: number,
  element: ElementClientSize,
  viewport: PageViewport,
  geometry: PageGeometry,
  effectiveRotate: QuarterTurn,
): ViewPoint {
  const { x, y } = elementOffsetToViewport(offsetX, offsetY, element, viewport);
  const [pdfX, pdfY] = viewport.convertToPdfPoint(x, y);
  return pdfPointToView(geometry, { x: pdfX, y: pdfY }, effectiveRotate);
}

/** Maps a view-space point to CSS offsets within the page canvas element. */
export function viewPointToClient(
  point: ViewPoint,
  element: ElementClientSize,
  viewport: PageViewport,
  geometry: PageGeometry,
  effectiveRotate: QuarterTurn,
): { offsetX: number; offsetY: number } {
  const pdf: PdfPoint = viewPointToPdf(geometry, point, effectiveRotate);
  const [viewportX, viewportY] = viewport.convertToViewportPoint(pdf.x, pdf.y);
  return viewportToElementOffset(viewportX, viewportY, element, viewport);
}

/** Converts CSS pixels to view space points at the current zoom. */
export function cssPixelsToViewPoints(
  cssPixels: number,
  scale: number,
  userUnit: number,
): number {
  const divisor = scale * userUnit;
  if (divisor <= 0) {
    throw new Error("scale and userUnit must be positive");
  }
  return cssPixels / divisor;
}

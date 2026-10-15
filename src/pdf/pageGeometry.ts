import type { PDFPageProxy } from "pdfjs-dist";

import { normalizeQuarterTurn } from "./rotation.ts";
import type { ClampRect, PageGeometry } from "./viewSpace.ts";

export type DocumentMetadata = {
  pageCount: number;
  pages: PageGeometry[];
};

/**
 * Normalizes pdf.js `PDFPageProxy.view` (CropBox or MediaBox as [x1, y1, x2, y2] in PDF user space)
 * into a {@link ClampRect}. The parameter name follows pdf.js;
 * the coordinates are in PDF user space, NOT view space.
 */
function clampFromView(view: number[]): ClampRect {
  if (view.length !== 4) {
    throw new Error(
      `Expected view box [x1,y1,x2,y2], got length ${view.length}`,
    );
  }
  const [a, b, c, d] = view;
  const xMin = Math.min(a, c);
  const xMax = Math.max(a, c);
  const yMin = Math.min(b, d);
  const yMax = Math.max(b, d);
  const pageWidth = xMax - xMin;
  const pageHeight = yMax - yMin;
  if (
    !Number.isFinite(pageWidth) ||
    !Number.isFinite(pageHeight) ||
    pageWidth <= 0 ||
    pageHeight <= 0
  ) {
    throw new Error(
      `Invalid page clamp rectangle: width=${pageWidth}, height=${pageHeight}`,
    );
  }
  return { xMin, yMin, xMax, yMax };
}

/** Reads pdf.js page box and rotation into page geometry metadata. */
export function pageGeometryFromProxy(page: PDFPageProxy): PageGeometry {
  const clamp = clampFromView(page.view);
  return {
    pageIndex: page.pageNumber - 1,
    clamp,
    pageWidth: clamp.xMax - clamp.xMin,
    pageHeight: clamp.yMax - clamp.yMin,
    pdfRotate: normalizeQuarterTurn(page.rotate),
    userUnit: page.userUnit,
  };
}

export function documentMetadataFromPages(
  pages: PDFPageProxy[],
): DocumentMetadata {
  return {
    pageCount: pages.length,
    pages: pages.map(pageGeometryFromProxy),
  };
}

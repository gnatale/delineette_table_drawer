import {
  effectiveRotate as computeEffectiveRotate,
  type QuarterTurn,
  viewExtents,
} from "./rotation.ts";

/* NOTE: the following Point types are the same but their names 
clarify their intended use. Coordinates are in PDF user space units (/UserUnit * 1 point). 
If /UserUnit is omitted in a PDF, it is assumed to be 1 so the unit is 1 point in that case. */

/** Point in PDF user space (origin at bottom left, y up). */
export type PdfPoint = { x: number; y: number };

/** Point in view space (origin at top left, y down, page displayed after rotation)). */
export type ViewPoint = { x: number; y: number };

/** Point in the original page space before rotation (origin at top left, y down). */
type UnrotatedPoint = { x: number; y: number };

/** Visible page box in PDF user space (origin at bottom left, y up). */
export type ClampRect = {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
};

/**
 * Per-page box and rotation read from the PDF (via pdf.js). `clamp`, `pageWidth`, and `pageHeight`
 * describe the visible page rectangle in PDF user space before display rotation is applied in view
 * mapping; use {@link viewSizeForPage} for width/height after `effectiveRotate`.
 */
export type PageGeometry = {
  /** 0-based index in the open document. */
  pageIndex: number;
  /** CropBox if present, else MediaBox, in PDF user space (not rotated for view). */
  clamp: ClampRect;
  /** Unrotated page width. */
  pageWidth: number;
  /** Unrotated page height. */
  pageHeight: number;
  /** Rotation of the page in degrees from the top left corner. */
  pdfRotate: QuarterTurn;
  /** User unit of the page. */
  userUnit: number;
};

export function viewSizeForPage(
  geometry: PageGeometry,
  rotationOffset: number,
): { viewWidth: number; viewHeight: number; effectiveRotate: QuarterTurn } {
  const effective = computeEffectiveRotate(geometry.pdfRotate, rotationOffset);
  const { viewWidth, viewHeight } = viewExtents(
    geometry.pageWidth,
    geometry.pageHeight,
    effective,
  );
  return { viewWidth, viewHeight, effectiveRotate: effective };
}

function pdfToUnrotated(
  geometry: PageGeometry,
  point: PdfPoint,
): UnrotatedPoint {
  const { clamp } = geometry;
  return {
    x: point.x - clamp.xMin,
    y: clamp.yMax - point.y,
  };
}

function unrotatedToPdf(
  geometry: PageGeometry,
  point: UnrotatedPoint,
): PdfPoint {
  const { clamp } = geometry;
  return {
    x: clamp.xMin + point.x,
    y: clamp.yMax - point.y,
  };
}

function unrotatedToView(
  geometry: PageGeometry,
  point: UnrotatedPoint,
  rotation: QuarterTurn,
): ViewPoint {
  const W = geometry.pageWidth;
  const H = geometry.pageHeight;
  const { x: x_tl, y: y_tl } = point;

  switch (rotation) {
    case 0:
      return { x: x_tl, y: y_tl };
    case 90:
      return { x: H - y_tl, y: x_tl };
    case 180:
      return { x: W - x_tl, y: H - y_tl };
    case 270:
      return { x: y_tl, y: W - x_tl };
    default:
      throw new Error(`Invalid rotation: ${rotation satisfies never}`);
  }
}

function viewToUnrotated(
  geometry: PageGeometry,
  point: ViewPoint,
  rotation: QuarterTurn,
): UnrotatedPoint {
  const W = geometry.pageWidth;
  const H = geometry.pageHeight;
  const { x: x_v, y: y_v } = point;

  switch (rotation) {
    case 0:
      return { x: x_v, y: y_v };
    case 90:
      return { x: y_v, y: H - x_v };
    case 180:
      return { x: W - x_v, y: H - y_v };
    case 270:
      return { x: W - y_v, y: x_v };
    default:
      throw new Error(`Invalid rotation: ${rotation satisfies never}`);
  }
}

export function pdfPointToView(
  geometry: PageGeometry,
  point: PdfPoint,
  rotation: QuarterTurn,
): ViewPoint {
  const unrotated = pdfToUnrotated(geometry, point);
  return unrotatedToView(geometry, unrotated, rotation);
}

export function viewPointToPdf(
  geometry: PageGeometry,
  point: ViewPoint,
  rotation: QuarterTurn,
): PdfPoint {
  const unrotated = viewToUnrotated(geometry, point, rotation);
  return unrotatedToPdf(geometry, unrotated);
}

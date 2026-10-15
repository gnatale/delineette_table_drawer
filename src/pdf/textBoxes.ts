import type { PDFPageProxy } from "pdfjs-dist";

import type { QuarterTurn } from "./rotation.ts";
import {
  pdfPointToView,
  type PageGeometry,
  type PdfPoint,
} from "./viewSpace.ts";

/** PDF extracted text item used to build view-space boxes. */
type PdfTextItem = {
  /** Extracted string for this text run. Whitespace should be normalized when
   * setting this (e.g. every whitespace character replaced with a normal ASCII space). */
  str: string;
  /** Text matrix `[a, b, c, d, e, f]` in PDF user space; `(e, f)` is the baseline origin.
   * Same six numbers as Tm operand.
   */
  transform: number[];
  /** Advance width along the text direction (horizontal items: along the line). */
  width: number;
  /** Extent along the cross axis (horizontal items: typical glyph height from the matrix). */
  height: number;
  /** Key for a dictionary containing ascent/descent and vertical writing mode values. */
  styleKey: string;
};

/**
 * One entry in `PdfTextContent.styles` as returned by the pdf.js adapter. Fields may be
 * missing; {@link styleForItem} fills defaults to produce {@link TextStyleMetrics} for quads.
 */
type TextStyleRecord = {
  ascent?: number;
  descent?: number;
  vertical?: boolean;
};

/** Text runs plus per-style metrics; markers from pdf.js are omitted. */
type PdfTextContent = {
  items: PdfTextItem[];
  styles: Record<string, TextStyleRecord>;
};

/** Axis-aligned box enclosing the text run in view space.
 * Note that this box is always axis-aligned, even if the text is rotated by
 * angles not a multiple of 90 degrees.
 */
export type ViewTextBox = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

/**
 * Resolved font metrics for {@link textItemPdfQuad} (required fields after {@link styleForItem}).
 * Ascent/descent are fractions of the run's cross-axis size; vertical selects the quad layout.
 */
type TextStyleMetrics = {
  ascent: number;
  descent: number;
  vertical: boolean;
};

const DEFAULT_ASCENT = 0.8;
const DEFAULT_DESCENT = -0.2;

/** Unit vector in the `(x, y)` direction. */
function normalize2(x: number, y: number): { x: number; y: number } {
  const len = Math.hypot(x, y);
  if (len === 0) {
    return { x: 0, y: 0 };
  }
  return { x: x / len, y: y / len };
}

function addPdf(a: PdfPoint, b: PdfPoint, scale = 1): PdfPoint {
  return { x: a.x + b.x * scale, y: a.y + b.y * scale };
}

/**
 * Returns four PDF user-space corners for one text run's approximate ink box (not per-glyph
 * outlines): baseline start/end plus ascent/descent along the cross axis. The quad may be
 * rotated when the text matrix is; pass the result to {@link pdfQuadToViewBox} for an
 * axis-aligned box in view space.
 */
export function textItemPdfQuad(
  item: Pick<PdfTextItem, "transform" | "width" | "height">,
  style: TextStyleMetrics,
): PdfPoint[] {
  const [t0, t1, t2, t3, t4, t5] = item.transform;
  const baseline: PdfPoint = { x: t4, y: t5 };

  if (style.vertical) {
    const adv = normalize2(t2, t3);
    const cross = normalize2(t0, t1);
    const fontCross = item.width;
    const fontAdv = item.height;
    const p0 = baseline;
    const p1 = addPdf(p0, adv, fontAdv);
    const top = addPdf(p0, cross, style.ascent * fontCross);
    const bottom = addPdf(p0, cross, style.descent * fontCross);
    const topEnd = addPdf(p1, cross, style.ascent * fontCross);
    const bottomEnd = addPdf(p1, cross, style.descent * fontCross);
    return [bottom, top, topEnd, bottomEnd];
  }

  const adv = normalize2(t0, t1);
  const cross = normalize2(t2, t3);
  const fontHeight = item.height;
  const p0 = baseline;
  const p1 = addPdf(p0, adv, item.width);
  const bottom = addPdf(p0, cross, style.descent * fontHeight);
  const top = addPdf(p0, cross, style.ascent * fontHeight);
  const bottomEnd = addPdf(p1, cross, style.descent * fontHeight);
  const topEnd = addPdf(p1, cross, style.ascent * fontHeight);
  return [bottom, top, topEnd, bottomEnd];
}

/**
 * Converts a quad in PDF user space to an axis-aligned box in view space.
 */
export function pdfQuadToViewBox(
  geometry: PageGeometry,
  quad: PdfPoint[],
  rotation: QuarterTurn,
): ViewTextBox {
  let xMin = Number.POSITIVE_INFINITY;
  let xMax = Number.NEGATIVE_INFINITY;
  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;

  for (const corner of quad) {
    const view = pdfPointToView(geometry, corner, rotation);
    xMin = Math.min(xMin, view.x);
    xMax = Math.max(xMax, view.x);
    yMin = Math.min(yMin, view.y);
    yMax = Math.max(yMax, view.y);
  }

  return { xMin, xMax, yMin, yMax };
}

/**
 * Converts a text item to an axis-aligned box in view space.
 */
export function textItemToViewBox(
  geometry: PageGeometry,
  item: PdfTextItem,
  style: TextStyleMetrics,
  rotation: QuarterTurn,
): ViewTextBox {
  return pdfQuadToViewBox(geometry, textItemPdfQuad(item, style), rotation);
}

/**
 * Extracts ascent/descent and vertical writing mode from the style dictionary.
 */
function styleForItem(
  content: PdfTextContent,
  item: PdfTextItem,
): TextStyleMetrics {
  const raw = content.styles[item.styleKey];
  return {
    ascent: raw?.ascent ?? DEFAULT_ASCENT,
    descent: raw?.descent ?? DEFAULT_DESCENT,
    vertical: raw?.vertical ?? false,
  };
}

type PdfJsTextItem = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
};

type PdfJsTextContentRaw = {
  items: Array<PdfJsTextItem | { type: string }>;
  styles: Record<string, TextStyleRecord>;
};

function isPdfJsTextItem(
  item: PdfJsTextContentRaw["items"][number],
): item is PdfJsTextItem {
  return "str" in item && "transform" in item && "fontName" in item;
}

function pdfTextItemFromPdfJs(item: PdfJsTextItem): PdfTextItem {
  return {
    str: item.str,
    transform: item.transform,
    width: item.width,
    height: item.height,
    styleKey: item.fontName,
  };
}

function textContentFromPdfJs(raw: PdfJsTextContentRaw): PdfTextContent {
  const items: PdfTextItem[] = [];
  for (const entry of raw.items) {
    if (!isPdfJsTextItem(entry)) {
      continue;
    }
    items.push(pdfTextItemFromPdfJs(entry));
  }
  return { items, styles: raw.styles };
}

/** Loads extractable text as axis-aligned boxes in view space. */
export async function loadTextViewBoxes(
  page: PDFPageProxy,
  geometry: PageGeometry,
  effectiveRotate: QuarterTurn,
): Promise<ViewTextBox[]> {
  const raw = (await page.getTextContent({
    includeMarkedContent: false,
  })) as PdfJsTextContentRaw;
  const content = textContentFromPdfJs(raw);

  const boxes: ViewTextBox[] = [];
  for (const item of content.items) {
    if (item.width === 0 && item.height === 0) {
      continue;
    }
    if (item.str.trim() === "") {
      continue;
    }
    boxes.push(
      textItemToViewBox(
        geometry,
        item,
        styleForItem(content, item),
        effectiveRotate,
      ),
    );
  }
  return boxes;
}

import type { PDFPageProxy } from "pdfjs-dist";
import { describe, expect, it } from "vitest";

import {
  loadTextViewBoxes,
  pdfQuadToViewBox,
  textItemPdfQuad,
  textItemToViewBox,
} from "./textBoxes.ts";
import type { PageGeometry } from "./viewSpace.ts";

const geo: PageGeometry = {
  pageIndex: 0,
  clamp: { xMin: 0, yMin: 0, xMax: 200, yMax: 300 },
  pageWidth: 200,
  pageHeight: 300,
  pdfRotate: 0,
  userUnit: 1,
};

describe("textItemPdfQuad", () => {
  it("builds a horizontal quad from a text matrix", () => {
    const item = {
      transform: [12, 0, 0, 12, 40, 250],
      width: 60,
      height: 12,
    };
    const quad = textItemPdfQuad(item, {
      ascent: 0.8,
      descent: -0.2,
      vertical: false,
    });
    expect(quad).toHaveLength(4);
    const box = pdfQuadToViewBox(geo, quad, 0);
    expect(box.xMin).toBe(40);
    expect(box.xMax).toBe(100);
    expect(box.yMin).toBeCloseTo(40.4);
    expect(box.yMax).toBeCloseTo(52.4);
  });

  it("maps a 90° text matrix through view space", () => {
    const item = {
      transform: [0, 14, -14, 0, 100, 200],
      width: 42,
      height: 14,
    };
    const box = textItemToViewBox(
      geo,
      item as Parameters<typeof textItemToViewBox>[1],
      { ascent: 0.8, descent: -0.2, vertical: false },
      0,
    );
    expect(box).toEqual({
      xMin: 88.8,
      xMax: 102.8,
      yMin: 58,
      yMax: 100,
    });
  });

  it("builds a vertical quad when style.vertical is true", () => {
    const item = {
      transform: [0, 10, 10, 0, 50, 100],
      width: 8,
      height: 20,
    };
    const quad = textItemPdfQuad(item, {
      ascent: 0.9,
      descent: -0.1,
      vertical: true,
    });
    expect(quad).toHaveLength(4);
    const box = pdfQuadToViewBox(geo, quad, 0);
    expect(box.xMin).toBeCloseTo(50);
    expect(box.xMax).toBeCloseTo(70);
    expect(box.yMin).toBeCloseTo(192.8);
    expect(box.yMax).toBeCloseTo(200.8);
  });

  it("handles zero-length advance direction without NaNs", () => {
    const item = {
      transform: [0, 0, 0, 12, 40, 250],
      width: 60,
      height: 12,
    };
    const quad = textItemPdfQuad(item, {
      ascent: 0.8,
      descent: -0.2,
      vertical: false,
    });
    const box = pdfQuadToViewBox(geo, quad, 0);
    expect(Number.isFinite(box.xMin)).toBe(true);
    expect(Number.isFinite(box.xMax)).toBe(true);
    expect(box.xMin).toBe(40);
    expect(box.xMax).toBe(40);
    expect(box.yMin).toBeCloseTo(40.4);
    expect(box.yMax).toBeCloseTo(52.4);
  });
});

/** Partial pdf.js payloads; production casts the same shape in loadTextViewBoxes. */
function mockTextPage(raw: unknown): PDFPageProxy {
  return {
    getTextContent: async () =>
      raw as Awaited<ReturnType<PDFPageProxy["getTextContent"]>>,
  } as PDFPageProxy;
}

describe("loadTextViewBoxes", () => {
  it("skips marked content, blank runs, and zero-size items", async () => {
    const page = mockTextPage({
      items: [
        { type: "markedContent" },
        {
          str: "visible",
          transform: [0, 10, 10, 0, 10, 50],
          width: 6,
          height: 15,
          fontName: "g1",
        },
        {
          str: "   ",
          transform: [12, 0, 0, 12, 0, 0],
          width: 5,
          height: 5,
          fontName: "g1",
        },
        {
          str: "ignored",
          transform: [12, 0, 0, 12, 0, 0],
          width: 0,
          height: 0,
          fontName: "g1",
        },
      ],
      styles: {
        g1: { ascent: 0.9, descent: -0.1, vertical: true },
      },
    });

    const boxes = await loadTextViewBoxes(page, geo, 0);
    expect(boxes).toHaveLength(1);
    expect(boxes[0]!.xMin).toBeCloseTo(10);
    expect(boxes[0]!.xMax).toBeCloseTo(25);
  });

  it("uses default style metrics when the font is missing from styles", async () => {
    const page = mockTextPage({
      items: [
        {
          str: "x",
          transform: [12, 0, 0, 12, 0, 100],
          width: 10,
          height: 12,
          fontName: "unknown",
        },
      ],
      styles: {},
    });

    const boxes = await loadTextViewBoxes(page, geo, 0);
    expect(boxes).toHaveLength(1);
    expect(boxes[0]).toEqual({
      xMin: 0,
      xMax: 10,
      yMin: 190.4,
      yMax: 202.4,
    });
  });
});

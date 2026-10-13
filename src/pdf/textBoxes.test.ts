import { describe, expect, it } from "vitest";

import {
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
});

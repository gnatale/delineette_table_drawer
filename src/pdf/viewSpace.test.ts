import { describe, expect, it } from "vitest";

import {
  pdfPointToView,
  type PageGeometry,
  viewPointToPdf,
} from "./viewSpace.ts";

function geometry(
  pageWidth: number,
  pageHeight: number,
  clampOrigin: { xMin: number; yMin: number } = { xMin: 0, yMin: 0 },
): PageGeometry {
  const { xMin, yMin } = clampOrigin;
  return {
    pageIndex: 0,
    clamp: {
      xMin,
      yMin,
      xMax: xMin + pageWidth,
      yMax: yMin + pageHeight,
    },
    pageWidth,
    pageHeight,
    pdfRotate: 0,
    userUnit: 1,
  };
}

describe("viewSpace round-trip", () => {
  const W = 200;
  const H = 300;
  const geo = geometry(W, H);
  const interior = { x: 50, y: 80 };

  for (const rotation of [0, 90, 180, 270] as const) {
    it(`preserves an interior point at ${rotation}°`, () => {
      const view = pdfPointToView(
        geo,
        {
          x: geo.clamp.xMin + interior.x,
          y: geo.clamp.yMax - interior.y,
        },
        rotation,
      );
      const back = viewPointToPdf(geo, view, rotation);
      expect(back.x).toBeCloseTo(geo.clamp.xMin + interior.x);
      expect(back.y).toBeCloseTo(geo.clamp.yMax - interior.y);
    });
  }

  it("maps clamp corners to view rectangle at 0°", () => {
    const rotation = 0;
    const corners = [
      { x: geo.clamp.xMin, y: geo.clamp.yMax, vx: 0, vy: 0 },
      { x: geo.clamp.xMax, y: geo.clamp.yMax, vx: W, vy: 0 },
      { x: geo.clamp.xMin, y: geo.clamp.yMin, vx: 0, vy: H },
      { x: geo.clamp.xMax, y: geo.clamp.yMin, vx: W, vy: H },
    ];
    for (const c of corners) {
      const view = pdfPointToView(geo, { x: c.x, y: c.y }, rotation);
      expect(view.x).toBeCloseTo(c.vx);
      expect(view.y).toBeCloseTo(c.vy);
    }
  });

  it("swaps view extents at 90°", () => {
    const view = pdfPointToView(
      geo,
      { x: geo.clamp.xMin, y: geo.clamp.yMax },
      90,
    );
    expect(view.x).toBeCloseTo(H);
    expect(view.y).toBeCloseTo(0);
  });
});

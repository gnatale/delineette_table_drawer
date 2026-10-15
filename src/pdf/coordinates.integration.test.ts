import { describe, expect, it } from "vitest";

import {
  COORDINATE_FIXTURES,
  fixturePath,
} from "../../scripts/coordinateFixturesSpec.ts";
import { pageGeometryFromProxy } from "./pageGeometry.ts";
import {
  clientPointToView,
  cssPixelsToViewPoints,
  HIT_TOLERANCE_CSS_PX,
  viewPointToClient,
} from "./pointer.ts";
import { effectiveRotate, viewExtents } from "./rotation.ts";
import { loadFixturePage } from "./test/loadFixturePage.ts";
import { loadTextViewBoxes } from "./textBoxes.ts";
import { pdfPointToView, viewSizeForPage } from "./viewSpace.ts";

const EPS = 1e-4;

describe("pdf.js viewport agreement", () => {
  for (const spec of COORDINATE_FIXTURES) {
    it(`matches convertToViewportPoint for ${spec.fileName}`, async () => {
      const page = await loadFixturePage(fixturePath(spec.fileName));
      const geometry = pageGeometryFromProxy(page);
      const rotation = effectiveRotate(geometry.pdfRotate, 0);

      const pdfX = geometry.clamp.xMin + geometry.pageWidth * 0.35;
      const pdfY = geometry.clamp.yMin + geometry.pageHeight * 0.42;

      for (const scale of [1, 2]) {
        const viewport = page.getViewport({ scale, rotation });
        const expected = pdfPointToView(
          geometry,
          { x: pdfX, y: pdfY },
          rotation,
        );
        const [vx, vy] = viewport.convertToViewportPoint(pdfX, pdfY);
        expect(vx / (scale * geometry.userUnit)).toBeCloseTo(expected.x, 3);
        expect(vy / (scale * geometry.userUnit)).toBeCloseTo(expected.y, 3);
      }
    });
  }
});

describe("crop box fixture", () => {
  it("uses the crop rectangle as clamp", async () => {
    const spec = COORDINATE_FIXTURES.find((s) => s.fileName.includes("crop"))!;
    const page = await loadFixturePage(fixturePath(spec.fileName));
    const geometry = pageGeometryFromProxy(page);
    expect(geometry.pageWidth).toBeCloseTo(spec.crop!.width);
    expect(geometry.pageHeight).toBeCloseTo(spec.crop!.height);
    expect(geometry.clamp.xMin).toBeCloseTo(spec.crop!.x);
    expect(geometry.clamp.yMin).toBeCloseTo(spec.crop!.y);
  });
});

describe("rotation offset", () => {
  it("maps a clamp corner under effectiveRotate 90", async () => {
    const page = await loadFixturePage(
      fixturePath("portrait-612x792-rotate0.pdf"),
    );
    const geometry = pageGeometryFromProxy(page);
    const offset = 90;
    const {
      effectiveRotate: eff,
      viewWidth,
      viewHeight,
    } = viewSizeForPage(geometry, offset);
    expect(eff).toBe(90);
    expect(viewWidth).toBe(geometry.pageHeight);
    expect(viewHeight).toBe(geometry.pageWidth);

    const topLeftView = pdfPointToView(
      geometry,
      { x: geometry.clamp.xMin, y: geometry.clamp.yMax },
      eff,
    );
    expect(topLeftView.x).toBeCloseTo(viewWidth, EPS);
    expect(topLeftView.y).toBeCloseTo(0, EPS);

    const bottomRightView = pdfPointToView(
      geometry,
      { x: geometry.clamp.xMax, y: geometry.clamp.yMin },
      eff,
    );
    expect(bottomRightView.x).toBeCloseTo(0, EPS);
    expect(bottomRightView.y).toBeCloseTo(viewHeight, EPS);
  });
});

describe("text view boxes", () => {
  it("includes the spec baseline for crop fixture", async () => {
    const spec = COORDINATE_FIXTURES.find((s) => s.fileName.includes("crop"))!;
    const page = await loadFixturePage(fixturePath(spec.fileName));
    const geometry = pageGeometryFromProxy(page);
    const rotation = effectiveRotate(geometry.pdfRotate, 0);
    const boxes = await loadTextViewBoxes(page, geometry, rotation);
    expect(boxes.length).toBeGreaterThan(0);
    const baseline = spec.textBaseline!;
    const baselineView = pdfPointToView(
      geometry,
      { x: baseline.x, y: baseline.y },
      rotation,
    );
    const union = boxes[0]!;
    expect(union.xMin).toBeLessThanOrEqual(baselineView.x + 1);
    expect(union.xMax).toBeGreaterThanOrEqual(baselineView.x - 1);
    expect(union.yMin).toBeLessThanOrEqual(baselineView.y + 12);
    expect(union.yMax).toBeGreaterThanOrEqual(baselineView.y - 4);
  });
});

describe("pointer mapping", () => {
  it("maps element top-left to view origin", async () => {
    const page = await loadFixturePage(
      fixturePath("portrait-612x792-rotate0.pdf"),
    );
    const geometry = pageGeometryFromProxy(page);
    const rotation = effectiveRotate(geometry.pdfRotate, 0);
    const scale = 1;
    const viewport = page.getViewport({ scale, rotation });
    const element = {
      clientWidth: Math.floor(viewport.width),
      clientHeight: Math.floor(viewport.height),
    };
    const view = clientPointToView(0, 0, element, viewport, geometry, rotation);
    expect(view.x).toBeCloseTo(0, 2);
    expect(view.y).toBeCloseTo(0, 2);
  });

  it("round-trips through viewPointToClient", async () => {
    const page = await loadFixturePage(
      fixturePath("portrait-612x792-rotate0.pdf"),
    );
    const geometry = pageGeometryFromProxy(page);
    const rotation = effectiveRotate(geometry.pdfRotate, 0);
    const viewport = page.getViewport({ scale: 1, rotation });
    const element = { clientWidth: 400, clientHeight: 500 };
    const target = { x: 120, y: 200 };
    const { offsetX, offsetY } = viewPointToClient(
      target,
      element,
      viewport,
      geometry,
      rotation,
    );
    const back = clientPointToView(
      offsetX,
      offsetY,
      element,
      viewport,
      geometry,
      rotation,
    );
    expect(back.x).toBeCloseTo(target.x, 2);
    expect(back.y).toBeCloseTo(target.y, 2);
  });

  it("converts hit tolerance to view points", () => {
    expect(cssPixelsToViewPoints(HIT_TOLERANCE_CSS_PX, 2, 1)).toBeCloseTo(3);
  });

  it("maps the far corner when client size is floored", async () => {
    const page = await loadFixturePage(
      fixturePath("portrait-612x792-rotate0.pdf"),
    );
    const geometry = pageGeometryFromProxy(page);
    const rotation = effectiveRotate(geometry.pdfRotate, 0);
    const scale = 1.37;
    const viewport = page.getViewport({ scale, rotation });
    const element = {
      clientWidth: Math.floor(viewport.width),
      clientHeight: Math.floor(viewport.height),
    };
    const { viewWidth, viewHeight } = viewExtents(
      geometry.pageWidth,
      geometry.pageHeight,
      rotation,
    );
    const corner = clientPointToView(
      element.clientWidth,
      element.clientHeight,
      element,
      viewport,
      geometry,
      rotation,
    );
    expect(corner.x).toBeCloseTo(viewWidth, 1);
    expect(corner.y).toBeCloseTo(viewHeight, 1);
  });
});

describe("pageGeometry validation", () => {
  it("throws on invalid rotation input", () => {
    expect(() => effectiveRotate(0, 45)).toThrow();
  });
});

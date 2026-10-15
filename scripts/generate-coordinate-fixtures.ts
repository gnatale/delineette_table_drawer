import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

import { COORDINATE_FIXTURES, fixturePath } from "./coordinateFixturesSpec.ts";

const outDir = path.join(process.cwd(), "test-fixtures/coordinates");

function rotationAngle(rotate: 0 | 90 | 180 | 270) {
  return degrees(rotate);
}

async function buildFixture(
  spec: (typeof COORDINATE_FIXTURES)[number],
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([spec.mediaWidth, spec.mediaHeight]);

  if (spec.crop) {
    const { x, y, width, height } = spec.crop;
    page.setCropBox(x, y, width, height);
  }

  page.setRotation(rotationAngle(spec.rotate));

  if (spec.label && spec.textBaseline) {
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText(spec.label, {
      x: spec.textBaseline.x,
      y: spec.textBaseline.y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return doc.save();
}

mkdirSync(outDir, { recursive: true });

for (const spec of COORDINATE_FIXTURES) {
  const bytes = await buildFixture(spec);
  const target = path.join(process.cwd(), fixturePath(spec.fileName));
  writeFileSync(target, bytes);
  console.log(`Wrote ${target}`);
}

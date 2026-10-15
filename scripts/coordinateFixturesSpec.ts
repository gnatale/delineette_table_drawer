/** Canonical numbers for committed PDFs under test-fixtures/coordinates/. */

export type CoordinateFixtureSpec = {
  fileName: string;
  mediaWidth: number;
  mediaHeight: number;
  crop?: { x: number; y: number; width: number; height: number };
  rotate: 0 | 90 | 180 | 270;
  /** PDF user-space baseline for the label string (y up). */
  textBaseline?: { x: number; y: number };
  label?: string;
};

export const COORDINATE_FIXTURES: CoordinateFixtureSpec[] = [
  {
    fileName: "portrait-612x792-rotate0.pdf",
    mediaWidth: 612,
    mediaHeight: 792,
    rotate: 0,
    textBaseline: { x: 72, y: 720 },
    label: "coord-portrait",
  },
  {
    fileName: "landscape-792x612-rotate0.pdf",
    mediaWidth: 792,
    mediaHeight: 612,
    rotate: 0,
    textBaseline: { x: 72, y: 540 },
    label: "coord-landscape",
  },
  {
    fileName: "portrait-612x792-rotate90.pdf",
    mediaWidth: 612,
    mediaHeight: 792,
    rotate: 90,
    textBaseline: { x: 72, y: 720 },
    label: "coord-rotate90",
  },
  {
    fileName: "portrait-612x792-rotate180.pdf",
    mediaWidth: 612,
    mediaHeight: 792,
    rotate: 180,
    textBaseline: { x: 72, y: 720 },
    label: "coord-rotate180",
  },
  {
    fileName: "portrait-612x792-rotate270.pdf",
    mediaWidth: 612,
    mediaHeight: 792,
    rotate: 270,
    textBaseline: { x: 72, y: 720 },
    label: "coord-rotate270",
  },
  {
    fileName: "letter-crop-rotate0.pdf",
    mediaWidth: 612,
    mediaHeight: 792,
    crop: { x: 72, y: 72, width: 468, height: 648 },
    rotate: 0,
    textBaseline: { x: 108, y: 684 },
    label: "coord-crop",
  },
];

export function fixturePath(fileName: string): string {
  return `test-fixtures/coordinates/${fileName}`;
}

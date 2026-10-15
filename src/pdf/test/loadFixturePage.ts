import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import {
  getDocument,
  type PDFPageProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";

const require = createRequire(import.meta.url);
const pdfjsDistRoot = path.dirname(require.resolve("pdfjs-dist/package.json"));

/** Trailing separator — pdf.js validates it; Node reads assets via `fs`. */
function pdfjsDistAssetDir(...segments: string[]): string {
  return path.join(pdfjsDistRoot, ...segments) + path.sep;
}

function nodeDocumentLoadOptions(data: Uint8Array) {
  return {
    data,
    disableWorker: true,
    cMapUrl: pdfjsDistAssetDir("cmaps"),
    cMapPacked: true,
    standardFontDataUrl: pdfjsDistAssetDir("standard_fonts"),
  };
}

export async function loadFixturePage(
  relativePath: string,
  pageNumber = 1,
): Promise<PDFPageProxy> {
  const absolute = path.join(process.cwd(), relativePath);
  const data = new Uint8Array(readFileSync(absolute));
  const doc = await getDocument(
    nodeDocumentLoadOptions(data) as Parameters<typeof getDocument>[0],
  ).promise;
  return doc.getPage(pageNumber);
}

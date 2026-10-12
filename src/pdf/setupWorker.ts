import { GlobalWorkerOptions } from "pdfjs-dist";

import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let workerConfigured = false;

/** Configure the pdf.js worker once before any document load. */
export function ensurePdfWorker(): void {
  if (workerConfigured) {
    return;
  }
  GlobalWorkerOptions.workerSrc = workerSrc;
  workerConfigured = true;
}

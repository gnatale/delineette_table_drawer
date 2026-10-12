import type { PDFPageProxy } from "pdfjs-dist";

import { clampScale } from "../shared/zoom.ts";

/** Page whose top edge is closest to the scroll viewport top. */
export function nearestPage(
  pages: PDFPageProxy[],
  stackEl: HTMLElement,
  scrollTop: number,
): PDFPageProxy | null {
  let nearest: PDFPageProxy | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const page of pages) {
    const wrapper = stackEl.querySelector<HTMLElement>(
      `[data-page-wrapper="${page.pageNumber}"]`,
    );
    if (!wrapper) {
      continue;
    }
    const distance = Math.abs(wrapper.offsetTop - scrollTop);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = page;
    }
  }

  return nearest;
}

/** Scale that fits the page width into the viewport minus horizontal padding, or null if invalid. */
export function scaleToFitWidth(
  page: PDFPageProxy,
  clientWidth: number,
  paddingPx: number,
): number | null {
  const viewport = page.getViewport({
    scale: 1,
    rotation: page.rotate,
  });
  const availableWidth = clientWidth - paddingPx * 2;
  if (availableWidth <= 0 || viewport.width <= 0) {
    return null;
  }
  return clampScale(availableWidth / viewport.width);
}

/** Viewport point that stays over the same spot on the page
 * when the scale changes. */
export type ZoomAnchor = {
  clientX: number;
  clientY: number;
};

/** Returns the center of the viewport as the anchor. */
export function anchorAtCenter(rect: DOMRect): ZoomAnchor {
  return {
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
  };
}

/** Adjust scroll so the anchor still marks the same point on the page after scale changes. */
export function scrollToHoldAnchor(
  el: HTMLDivElement,
  anchor: ZoomAnchor,
  prevScale: number,
  nextScale: number,
): void {
  const rect = el.getBoundingClientRect();
  const contentX = el.scrollLeft + (anchor.clientX - rect.left);
  const contentY = el.scrollTop + (anchor.clientY - rect.top);
  const ratio = nextScale / prevScale;
  el.scrollLeft = contentX * ratio - (anchor.clientX - rect.left);
  el.scrollTop = contentY * ratio - (anchor.clientY - rect.top);
}

export type PanSession = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
};

export function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

/** Primary (0) or middle (1) button can start a pan drag. */
export function canStartPan(button: number): boolean {
  return button === 0 || button === 1;
}

export function panFromPointer(
  pointerId: number,
  clientX: number,
  clientY: number,
  scrollLeft: number,
  scrollTop: number,
): PanSession {
  return {
    pointerId,
    startX: clientX,
    startY: clientY,
    scrollLeft,
    scrollTop,
  };
}

export function scrollFromPan(
  pan: PanSession,
  clientX: number,
  clientY: number,
): { scrollLeft: number; scrollTop: number } {
  return {
    scrollLeft: pan.scrollLeft - (clientX - pan.startX),
    scrollTop: pan.scrollTop - (clientY - pan.startY),
  };
}

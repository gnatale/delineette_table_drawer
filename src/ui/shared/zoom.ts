export const ZOOM_MIN = 0.25
export const ZOOM_MAX = 4
export const ZOOM_BUTTON_FACTOR = 1.25

export function clampScale(scale: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale))
}

export function scaleFromWheelDelta(current: number, deltaY: number): number {
  const factor = Math.pow(1.001, -deltaY)
  return clampScale(current * factor)
}

export function formatZoomPercent(scale: number): string {
  return `${Math.round(scale * 100)}%`
}

export type ZoomAnchorView = {
  prepareZoomAnchorCenter: () => void
} | null

export function zoomInFromToolbar(
  current: number,
  view: ZoomAnchorView,
  onScaleChange: (scale: number) => void,
): void {
  view?.prepareZoomAnchorCenter()
  /* here we MULTIPLY the current scale by the ZOOM_BUTTON_FACTOR */
  onScaleChange(clampScale(current * ZOOM_BUTTON_FACTOR))
}

export function zoomOutFromToolbar(
  current: number,
  view: ZoomAnchorView,
  onScaleChange: (scale: number) => void,
): void {
  view?.prepareZoomAnchorCenter()
  /* here we DIVIDE the current scale by the ZOOM_BUTTON_FACTOR */
  onScaleChange(clampScale(current / ZOOM_BUTTON_FACTOR))
}

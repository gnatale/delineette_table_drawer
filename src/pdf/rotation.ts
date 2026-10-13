export type QuarterTurn = 0 | 90 | 180 | 270;

export function normalizeQuarterTurn(degrees: number): QuarterTurn {
  /**
   * Normalize the rotation to a multiple of 90°.
   * The +360 and %360 in the expression are used to ensure the
   * result is positive.
   */
  const normalized = ((degrees % 360) + 360) % 360;
  if (
    normalized === 0 ||
    normalized === 90 ||
    normalized === 180 ||
    normalized === 270
  ) {
    return normalized;
  }
  throw new Error(`Rotation must be a multiple of 90°, got ${degrees}`);
}

export function effectiveRotate(
  pdfRotate: number,
  rotationOffset: number,
): QuarterTurn {
  return normalizeQuarterTurn(pdfRotate + rotationOffset);
}

export function viewExtents(
  pageWidth: number,
  pageHeight: number,
  rotation: QuarterTurn,
): { viewWidth: number; viewHeight: number } {
  if (rotation === 90 || rotation === 270) {
    return { viewWidth: pageHeight, viewHeight: pageWidth };
  }
  return { viewWidth: pageWidth, viewHeight: pageHeight };
}

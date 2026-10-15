export {
  LoadPdfError,
  loadDocument,
  type LoadPdfFailureReason,
} from "./loadDocument.ts";
export {
  renderPageToCanvas,
  type PageRenderHandle,
  type RenderPageOptions,
} from "./renderPage.ts";
export { ensurePdfWorker } from "./setupWorker.ts";
export {
  documentMetadataFromPages,
  pageGeometryFromProxy,
  type DocumentMetadata,
} from "./pageGeometry.ts";
export {
  clientPointToView,
  cssPixelsToViewPoints,
  HIT_TOLERANCE_CSS_PX,
  viewPointToClient,
  type ElementClientSize,
} from "./pointer.ts";
export {
  effectiveRotate,
  normalizeQuarterTurn,
  viewExtents,
  type QuarterTurn,
} from "./rotation.ts";
export {
  loadTextViewBoxes,
  pdfQuadToViewBox,
  textItemPdfQuad,
  textItemToViewBox,
  type ViewTextBox,
} from "./textBoxes.ts";
export {
  pdfPointToView,
  viewPointToPdf,
  viewSizeForPage,
  type ClampRect,
  type PageGeometry,
  type PdfPoint,
  type ViewPoint,
} from "./viewSpace.ts";

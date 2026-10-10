import {
  getDocument,
  PasswordException,
  type PDFDocumentProxy,
} from 'pdfjs-dist'

import { ensurePdfWorker } from './setupWorker.ts'

export type LoadPdfFailureReason = 'password' | 'invalid'

export class LoadPdfError extends Error {
  readonly reason: LoadPdfFailureReason

  constructor(reason: LoadPdfFailureReason, message: string) {
    super(message)
    this.name = 'LoadPdfError'
    this.reason = reason
  }
}

// Root URL for pdf.js cmaps and standard fonts (copied to pdfjs/ by Vite).
// import.meta.env.BASE_URL matches Vite’s `base` option (e.g. subpath deploys).
const PDFJS_ASSET_BASE = `${import.meta.env.BASE_URL}pdfjs`

function documentLoadOptions(data: ArrayBuffer) {
  return {
    data: new Uint8Array(data),
    cMapUrl: `${PDFJS_ASSET_BASE}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${PDFJS_ASSET_BASE}/standard_fonts/`,
  }
}

/**
 * Load a PDF from in-memory bytes. Rejects password-protected files without prompting.
 */
export async function loadDocument(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  ensurePdfWorker()

  const loadingTask = getDocument(documentLoadOptions(data))

  try {
    return await loadingTask.promise
  } catch (error: unknown) {
    if (error instanceof PasswordException) {
      throw new LoadPdfError(
        'password',
        'This PDF is password-protected and cannot be opened.',
      )
    }
    throw new LoadPdfError('invalid', 'Could not open this PDF.')
  }
}

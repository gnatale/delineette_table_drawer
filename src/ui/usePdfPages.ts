import { useEffect, useState } from 'react'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

/**
 * Loads all page proxies when the document changes.
 */
export function usePdfPages(document: PDFDocumentProxy | null): PDFPageProxy[] {
  const [pages, setPages] = useState<PDFPageProxy[]>([])

  useEffect(() => {
    if (!document) {
      return
    }

    let cancelled = false
    const pageCount = document.numPages

    void (async () => {
      const loaded: PDFPageProxy[] = []
      for (let i = 1; i <= pageCount; i += 1) {
        if (cancelled) {
          return
        }
        loaded.push(await document.getPage(i))
      }
      if (!cancelled) {
        setPages(loaded)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [document])

  return pages
}

import { useCallback, useImperativeHandle, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

import { nearestPage, scaleToFitWidth } from './fitWidth.ts'
import { PageCanvas } from './PageCanvas.tsx'
import { useDocumentPan } from './useDocumentPan.ts'
import { useDocumentZoom } from './useDocumentZoom.ts'
import { usePdfPages } from './usePdfPages.ts'

const PAGE_STACK_PADDING_PX = 16

export type DocumentViewHandle = {
  /** Record the viewport center as the point that stays fixed on the next zoom. */
  prepareZoomAnchorCenter: () => void
  /** Record a screen point (usually the cursor) as the point that stays fixed on the next zoom. */
  prepareZoomAnchorPoint: (clientX: number, clientY: number) => void
  fitWidth: () => void
}

type DocumentViewProps = {
  document: PDFDocumentProxy | null
  scale: number
  onScaleChange: (scale: number) => void
  status: 'empty' | 'loading' | 'ready' | 'error'
  errorMessage: string | null
  ref?: React.Ref<DocumentViewHandle>
}

export function DocumentView({
  document,
  scale,
  onScaleChange,
  status,
  errorMessage,
  ref,
}: DocumentViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pageStackRef = useRef<HTMLDivElement>(null)

  const pages = usePdfPages(document)
  const { prepareCenter, preparePoint } = useDocumentZoom(
    scrollRef,
    scale,
    onScaleChange,
  )
  const pan = useDocumentPan(scrollRef)

  const fitWidth = useCallback(() => {
    const scrollEl = scrollRef.current
    const stackEl = pageStackRef.current
    if (!scrollEl || !stackEl || pages.length === 0) {
      return
    }

    const page = nearestPage(pages, stackEl, scrollEl.scrollTop)
    const next =
      page &&
      scaleToFitWidth(page, scrollEl.clientWidth, PAGE_STACK_PADDING_PX)
    if (next == null) {
      return
    }

    prepareCenter()
    onScaleChange(next)
  }, [onScaleChange, pages, prepareCenter])

  useImperativeHandle(
    ref,
    () => ({
      prepareZoomAnchorCenter: prepareCenter,
      prepareZoomAnchorPoint: preparePoint,
      fitWidth,
    }),
    [fitWidth, prepareCenter, preparePoint],
  )

  const showEmpty = status === 'empty'
  const showLoading = status === 'loading'
  const showError = status === 'error' && errorMessage
  const showPages = status === 'ready' && document && pages.length > 0

  return (
    <div
      ref={scrollRef}
      className={`document-scroll${pan.isPanning ? ' document-scroll--panning' : ''}`}
      onPointerDown={pan.onPointerDown}
      onPointerMove={pan.onPointerMove}
      onPointerUp={pan.endPan}
      onPointerCancel={pan.endPan}
    >
      {showEmpty && (
        <p className="document-message document-message--empty">
          Open a PDF to get started.
        </p>
      )}
      {showLoading && (
        <p className="document-message document-message--loading">Loading…</p>
      )}
      {showError && (
        <p className="document-message document-message--error" role="alert">
          {errorMessage}
        </p>
      )}
      {showPages && (
        <div ref={pageStackRef} className="page-stack">
          {pages.map((page) => (
            <div
              key={page.pageNumber}
              className="page-wrapper"
              data-page-wrapper={page.pageNumber}
            >
              <PageCanvas page={page} scale={scale} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

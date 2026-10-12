import { useEffect, useRef } from 'react'
import type { PDFPageProxy } from 'pdfjs-dist'

import { renderPageToCanvas } from '../pdf/index.ts'

type PageCanvasProps = {
  page: PDFPageProxy
  scale: number
}

/**
 * One PDF page as a `<canvas>`. Re-renders when `page` or `scale` changes.
 * pdf.js `page.render()` is asynchronous (often hundreds of ms per page), while
 * zoom can change again immediately (wheel, buttons, fit width), so a prior task
 * may still be running when deps change. Effect cleanup cancels that task
 * (unmount or before the next run) so an older, slower render never finishes
 * after a newer scale or document.
 */
export function PageCanvas({ page, scale }: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const handle = renderPageToCanvas({ page, canvas, scale })

    return () => {
      handle.cancel()
    }
  }, [page, scale])

  return (
    <canvas
      ref={canvasRef}
      className="page-canvas"
      data-page-number={page.pageNumber}
    />
  )
}

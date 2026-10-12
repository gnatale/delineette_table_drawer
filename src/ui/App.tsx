import { useCallback, useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

import { LoadPdfError, loadDocument } from '../pdf/index.ts'
import { DocumentView, type DocumentViewHandle } from './document/DocumentView.tsx'
import { zoomInFromToolbar, zoomOutFromToolbar } from './shared/zoom.ts'
import { Toolbar } from './toolbar/Toolbar.tsx'
import './App.css'

type ViewerStatus = 'empty' | 'loading' | 'ready' | 'error'

export default function App() {
  const [status, setStatus] = useState<ViewerStatus>('empty')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null)
  const [scale, setScale] = useState(1)

  const documentViewRef = useRef<DocumentViewHandle>(null)
  const sourceBytesRef = useRef<ArrayBuffer | null>(null)
  const documentRef = useRef<PDFDocumentProxy | null>(null)
  // Increments on every open so an in-flight load can tell it is no longer
  // the latest and drop its result instead of replacing the newer document.
  const loadGenerationRef = useRef(0)

  const destroyDocument = useCallback(() => {
    const current = documentRef.current
    documentRef.current = null
    if (current) {
      void current.cleanup()
    }
    setDocument(null)
  }, [])

  useEffect(() => {
    return () => {
      destroyDocument()
    }
  }, [destroyDocument])

  const onOpenFile = useCallback(
    async (file: File) => {
      const generation = loadGenerationRef.current + 1
      loadGenerationRef.current = generation

      setStatus('loading')
      setErrorMessage(null)
      destroyDocument()

      let bytes: ArrayBuffer
      try {
        bytes = await file.arrayBuffer()
      } catch {
        setStatus('error')
        setErrorMessage('Could not read this file.')
        return
      }

      if (loadGenerationRef.current !== generation) {
        return
      }

      sourceBytesRef.current = bytes

      try {
        const pdf = await loadDocument(bytes)
        if (loadGenerationRef.current !== generation) {
          void pdf.cleanup()
          return
        }
        documentRef.current = pdf
        setDocument(pdf)
        setScale(1)
        setStatus('ready')
      } catch (error: unknown) {
        if (loadGenerationRef.current !== generation) {
          return
        }
        if (error instanceof LoadPdfError) {
          setErrorMessage(error.message)
        } else {
          setErrorMessage('Could not open this PDF.')
        }
        setStatus('error')
      }
    },
    [destroyDocument],
  )

  const onZoomIn = useCallback(() => {
    zoomInFromToolbar(scale, documentViewRef.current, setScale)
  }, [scale])

  const onZoomOut = useCallback(() => {
    zoomOutFromToolbar(scale, documentViewRef.current, setScale)
  }, [scale])

  const onFitWidth = useCallback(() => {
    documentViewRef.current?.fitWidth()
  }, [])

  return (
    <div className="app">
      <Toolbar
        scale={scale}
        onOpenFile={onOpenFile}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFitWidth={onFitWidth}
        documentOpen={status === 'ready'}
      />
      <DocumentView
        ref={documentViewRef}
        document={document}
        scale={scale}
        onScaleChange={setScale}
        status={status}
        errorMessage={errorMessage}
      />
    </div>
  )
}

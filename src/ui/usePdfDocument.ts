import { useCallback, useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

import { LoadPdfError, loadDocument } from '../pdf/index.ts'

type ViewerStatus = 'empty' | 'loading' | 'ready' | 'error'

export function usePdfDocument(onOpened: () => void) {
  const [status, setStatus] = useState<ViewerStatus>('empty')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null)

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
        onOpened()
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
    [destroyDocument, onOpened],
  )

  return { status, errorMessage, document, onOpenFile }
}

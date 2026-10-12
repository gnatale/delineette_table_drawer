import { useRef, type ChangeEvent } from 'react'

import { formatZoomPercent } from '../shared/zoom.ts'
import './Toolbar.css'

type ToolbarProps = {
  scale: number
  onOpenFile: (file: File) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitWidth: () => void
  documentOpen: boolean
}

export function Toolbar({
  scale,
  onOpenFile,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  documentOpen,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onPickFile = () => {
    fileInputRef.current?.click()
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) {
      onOpenFile(file)
    }
  }

  return (
    <header className="toolbar">
      <h1 className="toolbar-title">Delineette - PDF Table Grid Drawer</h1>
      <div className="toolbar-actions">
        <button type="button" className="toolbar-button" onClick={onPickFile}>
          Open PDF
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="toolbar-file-input"
          onChange={onFileChange}
        />
        <span className="toolbar-separator" aria-hidden="true" />
        <button
          type="button"
          className="toolbar-button"
          onClick={onZoomOut}
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="toolbar-zoom-label">{formatZoomPercent(scale)}</span>
        <button
          type="button"
          className="toolbar-button"
          onClick={onZoomIn}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="toolbar-button"
          onClick={onFitWidth}
          disabled={!documentOpen}
        >
          Fit width
        </button>
      </div>
    </header>
  )
}

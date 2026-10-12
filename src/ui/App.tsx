import { useCallback, useRef, useState } from "react";

import {
  DocumentView,
  type DocumentViewHandle,
} from "./document/DocumentView.tsx";
import { zoomInFromToolbar, zoomOutFromToolbar } from "./shared/zoom.ts";
import { Toolbar } from "./toolbar/Toolbar.tsx";
import { usePdfDocument } from "./usePdfDocument.ts";
import "./App.css";

export default function App() {
  const [scale, setScale] = useState(1);
  const documentViewRef = useRef<DocumentViewHandle>(null);

  const onOpened = useCallback(() => {
    setScale(1);
  }, []);

  const { status, errorMessage, document, onOpenFile } =
    usePdfDocument(onOpened);

  const onZoomIn = useCallback(() => {
    zoomInFromToolbar(scale, documentViewRef.current, setScale);
  }, [scale]);

  const onZoomOut = useCallback(() => {
    zoomOutFromToolbar(scale, documentViewRef.current, setScale);
  }, [scale]);

  const onFitWidth = useCallback(() => {
    documentViewRef.current?.fitWidth();
  }, []);

  return (
    <div className="app">
      <Toolbar
        scale={scale}
        onOpenFile={onOpenFile}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFitWidth={onFitWidth}
        documentOpen={status === "ready"}
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
  );
}

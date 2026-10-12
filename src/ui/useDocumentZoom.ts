import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from 'react'

import { anchorAtCenter, scrollToHoldAnchor, type ZoomAnchor } from './zoomAnchor.ts'
import { scaleFromWheelDelta } from './zoom.ts'

export function useDocumentZoom(
  scrollRef: RefObject<HTMLDivElement | null>,
  scale: number,
  onScaleChange: (scale: number) => void,
) {
  const prevScaleRef = useRef(scale)
  const zoomAnchorRef = useRef<ZoomAnchor | null>(null)

  const prepareCenter = useCallback(() => {
    const el = scrollRef.current
    if (!el) {
      return
    }
    zoomAnchorRef.current = anchorAtCenter(el.getBoundingClientRect())
  }, [scrollRef])

  const preparePoint = useCallback((clientX: number, clientY: number) => {
    zoomAnchorRef.current = { clientX, clientY }
  }, [])

  useLayoutEffect(() => {
    const prev = prevScaleRef.current
    if (prev === scale) {
      return
    }

    const el = scrollRef.current
    const anchor = zoomAnchorRef.current
    if (el && anchor) {
      scrollToHoldAnchor(el, anchor, prev, scale)
      /* reset the anchor to null so it must be set again for the next zoom */
      zoomAnchorRef.current = null
    }

    prevScaleRef.current = scale
  }, [scale, scrollRef])

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) {
      return
    }

    const onWheel = (event: WheelEvent) => {
      // Plain wheel scrolls. Ctrl+wheel, Cmd+wheel, and trackpad pinch (ctrlKey) zoom.
      if (!(event.ctrlKey || event.metaKey)) {
        return
      }
      event.preventDefault()
      preparePoint(event.clientX, event.clientY)
      onScaleChange(scaleFromWheelDelta(scale, event.deltaY))
    }

    scrollEl.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      scrollEl.removeEventListener('wheel', onWheel)
    }
  }, [onScaleChange, preparePoint, scale, scrollRef])

  return { prepareCenter, preparePoint }
}

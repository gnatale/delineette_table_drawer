import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react'

import {
  canStartPan,
  isTextEntryTarget,
  panFromPointer,
  scrollFromPan,
  type PanSession,
} from './panGesture.ts'

export function useDocumentPan(scrollRef: RefObject<HTMLDivElement | null>) {
  /** True while Space is held, which arms click-drag panning.
   * NOTE: on my Mac / Firefox, pressing Space and releasing opens
   * again the dialog to open a file. TO BE REVIEWED.
   */
  const spaceHeldRef = useRef(false)
  const panRef = useRef<PanSession | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        if (isTextEntryTarget(event.target)) {
          return
        }
        event.preventDefault()
        spaceHeldRef.current = true
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        spaceHeldRef.current = false
        /* if no pan is underway, we stop the panning */
        if (!panRef.current) {
          setIsPanning(false)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!canStartPan(event.button)) {
        return
      }

      event.preventDefault()
      const el = scrollRef.current
      if (!el) {
        return
      }

      panRef.current = panFromPointer(
        event.pointerId,
        event.clientX,
        event.clientY,
        el.scrollLeft,
        el.scrollTop,
      )
      setIsPanning(true)
      /* capture the pointer so we can move the page without losing it 
      * when the pointer leaves the element */
      el.setPointerCapture(event.pointerId)
    },
    [scrollRef],
  )

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const pan = panRef.current
      const el = scrollRef.current
      if (!pan || !el || event.pointerId !== pan.pointerId) {
        return
      }

      const next = scrollFromPan(pan, event.clientX, event.clientY)
      el.scrollLeft = next.scrollLeft
      el.scrollTop = next.scrollTop
    },
    [scrollRef],
  )

  const endPan = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const pan = panRef.current
      const el = scrollRef.current
      if (!pan || !el || event.pointerId !== pan.pointerId) {
        return
      }

      panRef.current = null
      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId)
      }
      if (!spaceHeldRef.current) {
        setIsPanning(false)
      }
    },
    [scrollRef],
  )

  return { isPanning, onPointerDown, onPointerMove, endPan }
}

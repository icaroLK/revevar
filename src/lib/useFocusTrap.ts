import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Traps Tab focus inside the container, closes on Escape, locks body scroll, restores focus on unmount. */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onEscape: () => void,
): RefObject<T | null> {
  const containerRef = useRef<T>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const node = containerRef.current
    node?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onEscape()
        return
      }
      if (e.key === 'Tab' && node) {
        const items = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalOverflow
      previouslyFocused.current?.focus()
    }
  }, [active, onEscape])

  return containerRef
}

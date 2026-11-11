import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { IconButton } from './IconButton'

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

/** Centered dialog on desktop, bottom sheet on mobile (spec §4 Modal/Sheet). */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const node = dialogRef.current
    node?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
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
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-t-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-5 shadow-card md:rounded-2xl',
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          <IconButton
            aria-label="Fechar"
            variant="ghost"
            className="ml-auto"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

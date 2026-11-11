import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useFocusTrap } from '../../lib/useFocusTrap'
import { IconButton } from './IconButton'

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
  const dialogRef = useFocusTrap<HTMLDivElement>(open, onClose)

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

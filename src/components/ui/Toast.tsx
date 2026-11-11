import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/cn'

type ToastVariant = 'default' | 'error'
type ToastItem = { id: number; message: string; variant: ToastVariant }

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DISPLAY_MS = 3000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const show = useCallback(
    (message: string, variant: ToastVariant = 'default') => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, message, variant }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, DISPLAY_MS)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 md:items-end md:pr-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto rounded-full border px-4 py-2.5 text-sm font-medium shadow-card',
              toast.variant === 'error'
                ? 'border-red bg-red-tint text-white'
                : 'border-border-strong bg-surface text-text',
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider/context
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

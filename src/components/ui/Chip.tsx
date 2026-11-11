import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type ChipProps = {
  active?: boolean
  count?: number
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Chip({
  active = false,
  count,
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex h-11 flex-none cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-semibold tabular-nums transition active:scale-[0.96]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-tint',
        active
          ? 'border-red bg-red-tint text-white'
          : 'border-border text-muted hover:text-text',
        className,
      )}
      {...rest}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 text-xs font-semibold',
            active ? 'bg-white/20' : 'bg-white-tint-strong',
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

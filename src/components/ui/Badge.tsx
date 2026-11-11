import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type BadgeProps = {
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Badge({ icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-white-tint px-3 py-1.5 text-xs font-medium text-muted',
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

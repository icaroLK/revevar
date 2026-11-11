import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong px-6 py-14 text-center',
        className,
      )}
    >
      {icon}
      <p className="text-[15px] text-muted">{title}</p>
      {description && <p className="text-sm text-subtle">{description}</p>}
      {action}
    </div>
  )
}

type ErrorStateProps = Omit<EmptyStateProps, 'description'>

export function ErrorState(props: ErrorStateProps) {
  return <EmptyState {...props} />
}

import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type CardRadius = 'lg' | 'xl' | '2xl'

type CardProps = HTMLAttributes<HTMLDivElement> & { radius?: CardRadius }

const radiusClasses: Record<CardRadius, string> = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
}

export function Card({
  radius = 'xl',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'border border-border bg-gradient-to-b from-card-from to-card-to shadow-card',
        radiusClasses[radius],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

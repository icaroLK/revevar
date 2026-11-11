import { cn } from '../../lib/cn'

type SkeletonProps = { className?: string }

/** A single shimmer block; stack them to match a card or row's shape. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-white-tint-strong motion-reduce:animate-none',
        className,
      )}
    />
  )
}

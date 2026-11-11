import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { Thumbnail } from './Thumbnail'

type ReplayRowProps = {
  time: string
  note: string
  thumbnailUrl?: string | null
  active?: boolean
  to?: string
  className?: string
}

export function ReplayRow({
  time,
  note,
  thumbnailUrl = null,
  active = false,
  to,
  className,
}: ReplayRowProps) {
  const classes = cn(
    'flex items-center gap-3 rounded-md border p-2 transition-colors',
    active
      ? 'border-white-tint-strong bg-white-tint-strong text-text'
      : 'border-transparent text-text hover:bg-white-tint',
    className,
  )

  const content = (
    <>
      <Thumbnail thumbnailUrl={thumbnailUrl} className="w-[104px] flex-none" />
      <span className="flex flex-col gap-0.5">
        <span className="text-base font-bold tabular-nums">{time}</span>
        <span className="text-xs text-subtle">{note}</span>
      </span>
    </>
  )

  // The current item in the list is shown but not clickable (spec §7.1).
  if (active || !to) {
    return <div className={classes}>{content}</div>
  }

  return (
    <Link to={to} className={classes}>
      {content}
    </Link>
  )
}

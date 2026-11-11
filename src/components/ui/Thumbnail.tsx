import { Play } from 'lucide-react'
import { cn } from '../../lib/cn'

export type ThumbnailStatus = 'processing' | 'ready' | 'failed'

type ThumbnailProps = {
  thumbnailUrl: string | null
  cameraLabel?: string
  durationLabel?: string
  status?: ThumbnailStatus
  showPlay?: boolean
  className?: string
  /** The hero "último replay" thumbnail is the LCP candidate — load it eagerly
   * instead of lazily so the browser doesn't wait to discover it (spec §11). */
  priority?: boolean
}

export function Thumbnail({
  thumbnailUrl,
  cameraLabel,
  durationLabel,
  status = 'ready',
  showPlay = false,
  className,
  priority = false,
}: ThumbnailProps) {
  return (
    <div
      className={cn(
        'relative aspect-video overflow-hidden rounded-lg bg-thumb',
        className,
      )}
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          className="h-full w-full object-cover"
        />
      ) : (
        <FieldLinesPlaceholder />
      )}

      {cameraLabel && (
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-text">
          {cameraLabel}
        </span>
      )}

      {durationLabel && status !== 'failed' && (
        <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-text">
          {durationLabel}
        </span>
      )}

      {showPlay && status === 'ready' && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10">
            <Play
              className="h-3.5 w-3.5 fill-white text-white"
              aria-hidden="true"
            />
          </span>
        </span>
      )}

      {status === 'processing' && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/70 text-center text-xs font-medium text-muted motion-safe:animate-pulse">
          Processando…
        </div>
      )}

      {status === 'failed' && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/80 text-center text-xs font-medium text-muted">
          Câmera indisponível
        </div>
      )}
    </div>
  )
}

function FieldLinesPlaceholder() {
  return (
    <svg
      viewBox="0 0 160 90"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <g fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7">
        <rect x="10" y="10" width="140" height="70" />
        <line x1="80" y1="10" x2="80" y2="80" />
        <circle cx="80" cy="45" r="11" />
        <rect x="10" y="29" width="16" height="32" />
        <rect x="134" y="29" width="16" height="32" />
      </g>
    </svg>
  )
}

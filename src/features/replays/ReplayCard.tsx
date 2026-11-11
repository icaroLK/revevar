import { Download, Play } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Thumbnail } from '../../components/ui/Thumbnail'
import { useDownloadFlow } from '../download/DownloadFlowProvider'
import { formatDuration, formatRelativeDay, formatTime } from '../../lib/dates'
import type { ReplayEvent } from '../../lib/api/types'
import type { CameraFilter } from './filters'

type ReplayCardProps = {
  event: ReplayEvent
  camera: CameraFilter
}

export function ReplayCard({ event, camera }: ReplayCardProps) {
  const location = useLocation()
  const { requestDownload } = useDownloadFlow()
  const visibleClips =
    camera === 'ambas'
      ? event.clips
      : event.clips.filter((clip) => String(clip.cameraIndex) === camera)
  const firstVisibleIndex = visibleClips[0]?.cameraIndex
  const downloadableClipIds = visibleClips
    .filter((clip) => clip.status === 'ready')
    .map((clip) => clip.id)
  const allClipsFailed = event.clips.every((clip) => clip.status === 'failed')
  const href = `/replays/${event.id}${camera !== 'ambas' ? `?camera=${camera}` : ''}`
  const timeLabel = formatTime(event.pressedAt)
  // So the replay detail page's "Voltar aos replays" returns to this exact filtered view.
  const backState = { from: `${location.pathname}${location.search}` }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-gradient-to-b from-card-from to-card-to p-3 shadow-card">
      <Link
        to={href}
        state={backState}
        aria-label={`Assistir replay das ${timeLabel}`}
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${visibleClips.length}, minmax(0, 1fr))`,
        }}
      >
        {visibleClips.map((clip) => (
          <Thumbnail
            key={clip.id}
            thumbnailUrl={clip.thumbnailUrl}
            status={clip.status}
            cameraLabel={clip.cameraLabel}
            showPlay={clip.cameraIndex === firstVisibleIndex}
          />
        ))}
      </Link>

      <div className="flex items-center justify-between gap-3 px-1.5 pb-1 pt-0.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-bold tabular-nums md:text-[19px]">
            {timeLabel}
          </span>
          <span className="hidden text-[13px] text-subtle md:block">
            {formatRelativeDay(event.pressedAt)} · {event.clubName} ·{' '}
            {event.courtName}
          </span>
          <span className="text-xs text-subtle md:hidden">
            {formatDuration(event.durationSec)} · {event.clips.length} ângulos
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            as="link"
            to={href}
            state={backState}
            icon={<Play className="h-3 w-3" aria-hidden="true" />}
          >
            <span className="hidden md:inline">Assistir</span>
            <span className="md:hidden">Ver</span>
          </Button>
          {!allClipsFailed && (
            <IconButton
              aria-label={`Baixar replay das ${timeLabel}`}
              onClick={() => requestDownload(downloadableClipIds)}
            >
              <Download className="h-[18px] w-[18px]" aria-hidden="true" />
            </IconButton>
          )}
        </div>
      </div>
    </article>
  )
}

import { useRef, useState } from 'react'
import { PlayerControls } from '../../components/ui/VideoPlayer'
import { cn } from '../../lib/cn'

type SideBySidePlayerProps = {
  sources: { src: string; poster?: string | null }[]
  buttonOffsetSec: number
  className?: string
}

const DRIFT_THRESHOLD_SEC = 0.3

/** "Lado a lado" (desktop only): two videos, one shared control bar, drift-corrected sync (spec §7.3). */
export function SideBySidePlayer({
  sources,
  buttonOffsetSec,
  className,
}: SideBySidePlayerProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  function eachVideo(fn: (video: HTMLVideoElement) => void) {
    for (const video of videoRefs.current) {
      if (video) fn(video)
    }
  }

  function togglePlay() {
    if (playing) eachVideo((v) => v.pause())
    else eachVideo((v) => void v.play())
  }

  function seek(time: number) {
    const clamped = Math.max(0, Math.min(time, duration || 0))
    eachVideo((v) => {
      v.currentTime = clamped
    })
    setCurrentTime(clamped)
  }

  function onTimeUpdate(index: number, time: number) {
    if (index === 0) setCurrentTime(time)
    const other = videoRefs.current[index === 0 ? 1 : 0]
    if (other && Math.abs(other.currentTime - time) > DRIFT_THRESHOLD_SEC) {
      other.currentTime = time
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="text-center text-xs text-subtle">
        Os dois ângulos tocam sincronizados
      </p>
      <div className="grid grid-cols-2 gap-2">
        {sources.map((source, index) => (
          <div
            key={index}
            className="relative aspect-video overflow-hidden rounded-player bg-thumb"
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el
              }}
              src={source.src}
              poster={source.poster ?? undefined}
              playsInline
              preload="metadata"
              className="h-full w-full"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) =>
                onTimeUpdate(index, e.currentTarget.currentTime)
              }
              onLoadedMetadata={(e) => {
                if (index === 0) setDuration(e.currentTarget.duration)
              }}
            />
          </div>
        ))}
      </div>
      <PlayerControls
        playing={playing}
        currentTime={currentTime}
        duration={duration}
        buttonOffsetSec={buttonOffsetSec}
        onTogglePlay={togglePlay}
        onSeek={seek}
        className="rounded-player"
      />
    </div>
  )
}

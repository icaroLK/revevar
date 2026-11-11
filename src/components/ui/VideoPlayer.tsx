import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { Maximize, Pause, Play } from 'lucide-react'
import { formatDuration } from '../../lib/dates'
import { cn } from '../../lib/cn'

export type VideoPlayerHandle = {
  getCurrentTime: () => number
  isPlaying: () => boolean
  seekTo: (time: number) => void
  play: () => void
  pause: () => void
}

type VideoPlayerProps = {
  src: string
  poster?: string | null
  buttonOffsetSec: number
  /** Seek here once the video's metadata loads — used to preserve playback position across a camera-tab switch. */
  initialTime?: number
  className?: string
}

/** A single <video> with the custom control bar from spec §7.3. */
export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(
    { src, poster, buttonOffsetSec, initialTime, className },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [playing, setPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
      isPlaying: () => !(videoRef.current?.paused ?? true),
      seekTo: (time) => {
        if (videoRef.current) videoRef.current.currentTime = time
      },
      play: () => void videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
    }))

    function seek(time: number) {
      const video = videoRef.current
      if (!video) return
      video.currentTime = Math.max(
        0,
        Math.min(time, duration || video.duration || 0),
      )
    }

    function togglePlay() {
      const video = videoRef.current
      if (!video) return
      if (video.paused) void video.play()
      else video.pause()
    }

    function enterFullscreen() {
      const video = videoRef.current as
        (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
      if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen() // iOS Safari has no element.requestFullscreen for <video>
      } else {
        void wrapperRef.current?.requestFullscreen?.()
      }
    }

    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
      const key = e.key.toLowerCase()
      if (key === ' ' || key === 'k') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        seek(currentTime - 5)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        seek(currentTime + 5)
      } else if (key === 'f') {
        enterFullscreen()
      }
    }

    return (
      <div
        ref={wrapperRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={cn(
          'relative aspect-video overflow-hidden rounded-player bg-thumb outline-none',
          className,
        )}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster ?? undefined}
          playsInline
          preload="metadata"
          className="h-full w-full"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration)
            if (initialTime) e.currentTarget.currentTime = initialTime
          }}
        />
        <PlayerControls
          playing={playing}
          currentTime={currentTime}
          duration={duration}
          buttonOffsetSec={buttonOffsetSec}
          onTogglePlay={togglePlay}
          onSeek={seek}
          onFullscreen={enterFullscreen}
          className="absolute inset-x-0 bottom-0"
        />
      </div>
    )
  },
)

type PlayerControlsProps = {
  playing: boolean
  currentTime: number
  duration: number
  buttonOffsetSec: number
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onFullscreen?: () => void
  className?: string
}

export function PlayerControls({
  playing,
  currentTime,
  duration,
  buttonOffsetSec,
  onTogglePlay,
  onSeek,
  onFullscreen,
  className,
}: PlayerControlsProps) {
  const barRef = useRef<HTMLDivElement>(null)

  function handleBarClick(e: MouseEvent<HTMLDivElement>) {
    const bar = barRef.current
    if (!bar || !duration) return
    const rect = bar.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    onSeek(ratio * duration)
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const markerPercent = duration > 0 ? (buttonOffsetSec / duration) * 100 : 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-black/55 px-3 py-2.5 backdrop-blur-md',
        className,
      )}
    >
      <button
        type="button"
        aria-label={playing ? 'Pausar' : 'Reproduzir'}
        onClick={onTogglePlay}
        className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-red text-white active:scale-[0.96]"
      >
        {playing ? (
          <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
        ) : (
          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
        )}
      </button>

      <span className="flex-none text-xs font-medium tabular-nums text-text">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </span>

      <div
        ref={barRef}
        role="slider"
        aria-label="Progresso do vídeo"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        onClick={handleBarClick}
        className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/20"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-red"
          style={{ width: `${progressPercent}%` }}
        />
        {duration > 0 && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${markerPercent}%` }}
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-red">
              Botão
            </span>
            <span className="block h-2.5 w-0.5 bg-red" />
          </div>
        )}
      </div>

      {onFullscreen && (
        <button
          type="button"
          aria-label="Tela cheia"
          onClick={onFullscreen}
          className="flex h-8 w-8 flex-none items-center justify-center text-text/80 hover:text-text"
        >
          <Maximize className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

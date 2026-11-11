import { useEffect, useRef, useState, type RefObject } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Clock, Download, Home } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { IconButton } from '../../components/ui/IconButton'
import { ReplayRow } from '../../components/ui/ReplayRow'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { Skeleton } from '../../components/ui/Skeleton'
import {
  VideoPlayer,
  type VideoPlayerHandle,
} from '../../components/ui/VideoPlayer'
import { useDownloadFlow } from '../download/DownloadFlowProvider'
import { ApiError } from '../../lib/api/errors'
import {
  useClubs,
  useConfig,
  useCourts,
  useReplay,
  useReplays,
} from '../../lib/api/hooks'
import type { Clip } from '../../lib/api/types'
import { cn } from '../../lib/cn'
import {
  formatExpiry,
  formatRelativeDay,
  formatTime,
  toLocalDateString,
} from '../../lib/dates'
import { ShareActions } from './ShareActions'
import { SideBySidePlayer } from './SideBySidePlayer'

type CameraView = 'c1' | 'c2' | 'lado'

export function ReplayDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const cameraParam = searchParams.get('camera')
  const [view, setView] = useState<CameraView>(
    cameraParam === 'lado' ? 'lado' : cameraParam === '2' ? 'c2' : 'c1',
  )

  const configQuery = useConfig()

  // Poll while a clip is still processing (spec §7.3), stop once resolved.
  const [pollEnabled, setPollEnabled] = useState(false)
  const replayQuery = useReplay(eventId, {
    refetchInterval: pollEnabled ? 5000 : false,
  })
  const event = replayQuery.data?.event
  const hasProcessing =
    event?.clips.some((c) => c.status === 'processing') ?? false
  if (hasProcessing !== pollEnabled) setPollEnabled(hasProcessing)

  const cam1 = event?.clips.find((c) => c.cameraIndex === 1)
  const cam2 = event?.clips.find((c) => c.cameraIndex === 2)

  // Auto-switch away from a failed camera (spec §7.3).
  if (cam1 && cam2) {
    if (view === 'c1' && cam1.status === 'failed' && cam2.status !== 'failed')
      setView('c2')
    else if (
      view === 'c2' &&
      cam2.status === 'failed' &&
      cam1.status !== 'failed'
    )
      setView('c1')
  }

  // "Voltar aos replays" — prefer the catalog's own URL (passed via router
  // state when the user came from there), falling back to one built from
  // the event's own club/court/day/hour.
  const clubsQuery = useClubs()
  const matchedClub = clubsQuery.data?.items.find((c) => c.id === event?.clubId)
  const courtsQuery = useCourts(matchedClub?.id)
  const matchedCourt = courtsQuery.data?.items.find(
    (c) => c.id === event?.courtId,
  )

  let fallbackBackHref = '/replays'
  if (event) {
    const pressed = new Date(event.pressedAt)
    const todayStr = toLocalDateString(new Date())
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const pressedStr = toLocalDateString(pressed)
    const dia =
      pressedStr === todayStr
        ? 'hoje'
        : pressedStr === toLocalDateString(yesterday)
          ? 'ontem'
          : pressedStr
    const params = new URLSearchParams()
    if (matchedClub) params.set('clube', matchedClub.slug)
    if (matchedCourt) params.set('quadra', matchedCourt.slug)
    params.set('dia', dia)
    params.set('hora', String(pressed.getHours()))
    fallbackBackHref = `/replays?${params.toString()}`
  }
  const backHref =
    (location.state as { from?: string } | null)?.from ?? fallbackBackHref

  // Aside: other plays in the same court/hour (spec §7.5).
  const eventHour = event ? new Date(event.pressedAt).getHours() : undefined
  const eventDate = event
    ? toLocalDateString(new Date(event.pressedAt))
    : undefined
  const asideQuery = useReplays(
    { courtId: event?.courtId, date: eventDate, hour: eventHour, limit: 6 },
    {},
  )
  const asideItems = asideQuery.data?.pages[0]?.items ?? []

  const playerRef = useRef<VideoPlayerHandle>(null)
  const [seekOnSwitch, setSeekOnSwitch] = useState(0)
  const wasPlayingRef = useRef(false)

  useEffect(() => {
    if (wasPlayingRef.current) playerRef.current?.play()
  }, [view])

  function switchView(next: CameraView) {
    wasPlayingRef.current = playerRef.current?.isPlaying() ?? false
    setSeekOnSwitch(playerRef.current?.getCurrentTime() ?? 0)
    setView(next)
  }

  if (replayQuery.isLoading) {
    return (
      <main className="mx-auto max-w-[1180px] px-4 py-9 md:px-7 md:py-16">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="aspect-video w-full max-w-3xl rounded-player" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-11 w-36 rounded-md" />
          <Skeleton className="h-11 w-36 rounded-md" />
        </div>
      </main>
    )
  }

  if (replayQuery.isError) {
    const error = replayQuery.error
    if (error instanceof ApiError && error.status === 404) {
      return (
        <ErrorPage
          title="Replay não encontrado."
          actionLabel="Ver replays"
          actionHref="/replays"
        />
      )
    }
    if (error instanceof ApiError && error.status === 410) {
      return (
        <ErrorPage
          title={`Este replay expirou. Os vídeos ficam disponíveis por ${configQuery.data?.retentionHours ?? 24} horas.`}
          actionLabel="Ver replays de hoje"
          actionHref="/replays?dia=hoje"
        />
      )
    }
    return (
      <main className="mx-auto max-w-[1180px] px-4 py-16 md:px-7">
        <ErrorState
          title="Não foi possível carregar o replay."
          action={
            <Button
              size="md"
              variant="secondary"
              onClick={() => replayQuery.refetch()}
            >
              Tentar de novo
            </Button>
          }
        />
      </main>
    )
  }

  if (!event) return null

  const activeClip = view === 'c2' ? cam2 : cam1
  const isSideBySide = view === 'lado'

  return (
    <>
      <title>
        {formatRelativeDay(event.pressedAt)}, {formatTime(event.pressedAt)} ·
        Revê VAR
      </title>

      {/* Mobile "replay mode" context bar (spec §3.1) */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
        <IconButton
          as="link"
          to={backHref}
          aria-label="Voltar aos replays"
          variant="ghost"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </IconButton>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-base font-bold">
            {formatRelativeDay(event.pressedAt)}, {formatTime(event.pressedAt)}
          </span>
          <span className="truncate text-xs text-subtle">
            {event.clubName} · {event.courtName} · {event.durationSec} segundos
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-[1180px] px-4 py-5 md:px-7 md:py-9">
        <Link
          to={backHref}
          className="mb-4 hidden items-center gap-1.5 text-sm font-semibold text-muted hover:text-text md:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar aos replays
        </Link>

        <div className="mb-6 hidden flex-wrap items-center justify-between gap-4 md:flex">
          <div>
            <h1 className="font-display text-5xl uppercase">
              {formatRelativeDay(event.pressedAt)},{' '}
              {formatTime(event.pressedAt)}
            </h1>
            <p className="mt-1 text-base text-muted">
              {event.clubName} · {event.courtName} · {event.durationSec}{' '}
              segundos
            </p>
          </div>
          <Badge icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />}>
            Disponível até {formatExpiry(event.expiresAt)}
          </Badge>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <div className="min-w-0 flex-1">
            <div className="mb-3 hidden md:block">
              <SegmentedControl
                label="Ângulo"
                value={view}
                onChange={switchView}
                options={[
                  { value: 'c1', label: 'Câmera 1' },
                  { value: 'c2', label: 'Câmera 2' },
                  { value: 'lado', label: 'Lado a lado' },
                ]}
              />
            </div>
            <div className="mb-3 md:hidden">
              <SegmentedControl
                label="Ângulo"
                value={view === 'lado' ? 'c1' : view}
                onChange={switchView}
                options={[
                  { value: 'c1', label: 'Câmera 1' },
                  { value: 'c2', label: 'Câmera 2' },
                ]}
              />
            </div>

            {isSideBySide && (
              <SideBySidePlayer
                sources={[
                  { src: cam1?.streamUrl ?? '', poster: cam1?.thumbnailUrl },
                  { src: cam2?.streamUrl ?? '', poster: cam2?.thumbnailUrl },
                ]}
                buttonOffsetSec={event.buttonOffsetSec}
                className="hidden md:flex"
              />
            )}
            {/* Mobile never shows "lado a lado" (spec §7.2) — falls back to câmera 1 there. */}
            <div className={isSideBySide ? 'md:hidden' : undefined}>
              <ClipArea
                clip={isSideBySide ? cam1 : activeClip}
                playerRef={playerRef}
                buttonOffsetSec={event.buttonOffsetSec}
                initialTime={seekOnSwitch}
              />
            </div>

            <p className="mt-3 text-xs text-subtle md:hidden">
              A marca vermelha na barra é o momento em que o botão foi apertado.
            </p>

            <div className="mt-4">
              <ActionsRow
                view={view}
                cam1={cam1}
                cam2={cam2}
                eventId={event.id}
              />
            </div>

            <div className="mt-3 md:hidden">
              <Badge
                icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                Disponível até {formatExpiry(event.expiresAt)}
              </Badge>
            </div>
          </div>

          <aside className="flex w-full flex-col gap-1.5 rounded-xl border border-border bg-gradient-to-b from-card-from to-card-to p-4 md:w-[300px] md:flex-none">
            <h2 className="mb-1.5 px-1.5 text-[13px] font-semibold uppercase tracking-wide text-subtle">
              Mais lances às {eventHour}h
            </h2>
            {asideItems.map((item) => (
              <ReplayRow
                key={item.id}
                time={formatTime(item.pressedAt)}
                note={
                  item.id === event.id
                    ? 'Assistindo agora'
                    : `${item.clips.length} ângulos`
                }
                thumbnailUrl={
                  item.clips.find((c) => c.cameraIndex === 1)?.thumbnailUrl
                }
                active={item.id === event.id}
                to={item.id === event.id ? undefined : `/replays/${item.id}`}
              />
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                as="link"
                to={
                  replayQuery.data?.prevEventId
                    ? `/replays/${replayQuery.data.prevEventId}`
                    : '#'
                }
                variant="secondary"
                size="md"
                icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
                aria-disabled={!replayQuery.data?.prevEventId}
                className={cn(
                  !replayQuery.data?.prevEventId &&
                    'pointer-events-none opacity-40',
                )}
              >
                Anterior
              </Button>
              <Button
                as="link"
                to={
                  replayQuery.data?.nextEventId
                    ? `/replays/${replayQuery.data.nextEventId}`
                    : '#'
                }
                variant="secondary"
                size="md"
                aria-disabled={!replayQuery.data?.nextEventId}
                className={cn(
                  !replayQuery.data?.nextEventId &&
                    'pointer-events-none opacity-40',
                )}
              >
                Próximo
              </Button>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}

function ClipArea({
  clip,
  playerRef,
  buttonOffsetSec,
  initialTime,
}: {
  clip: Clip | undefined
  playerRef: RefObject<VideoPlayerHandle | null>
  buttonOffsetSec: number
  initialTime: number
}) {
  if (!clip || clip.status === 'processing') {
    return (
      <div className="flex aspect-video items-center justify-center rounded-player bg-thumb text-sm text-muted">
        Processando o vídeo…
      </div>
    )
  }

  if (clip.status === 'failed' || !clip.streamUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-player bg-thumb text-sm text-muted">
        Este ângulo não está disponível.
      </div>
    )
  }

  return (
    <VideoPlayer
      ref={playerRef}
      src={clip.streamUrl}
      poster={clip.thumbnailUrl}
      buttonOffsetSec={buttonOffsetSec}
      initialTime={initialTime}
    />
  )
}

function ActionsRow({
  view,
  cam1,
  cam2,
  eventId,
}: {
  view: CameraView
  cam1: Clip | undefined
  cam2: Clip | undefined
  eventId: string
}) {
  const { requestDownload, storedEmail, forgetLead } = useDownloadFlow()

  if (view === 'lado') {
    const bothFailed = cam1?.status === 'failed' && cam2?.status === 'failed'
    const clipIds = [cam1, cam2]
      .filter((c) => c?.status === 'ready')
      .map((c) => c!.id)
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {!bothFailed && (
            <Button
              size="lg"
              icon={
                <Download className="h-[18px] w-[18px]" aria-hidden="true" />
              }
              onClick={() => requestDownload(clipIds)}
            >
              Baixar os 2 ângulos
            </Button>
          )}
          <ShareActions eventId={eventId} />
        </div>
        <LeadLine storedEmail={storedEmail} onForget={forgetLead} />
      </div>
    )
  }

  const activeIndex = view === 'c2' ? 2 : 1
  const activeClip = view === 'c2' ? cam2 : cam1
  const activeFailed = activeClip?.status === 'failed'
  const otherClip = view === 'c2' ? cam1 : cam2
  const otherIndex = view === 'c2' ? 1 : 2

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {!activeFailed && activeClip && (
          <Button
            size="lg"
            icon={<Download className="h-[18px] w-[18px]" aria-hidden="true" />}
            onClick={() => requestDownload([activeClip.id])}
          >
            Baixar câmera {activeIndex}
          </Button>
        )}
        {otherClip && otherClip.status !== 'failed' && (
          <Button
            variant="secondary"
            size="lg"
            icon={<Download className="h-[18px] w-[18px]" aria-hidden="true" />}
            onClick={() => requestDownload([otherClip.id])}
          >
            Baixar câmera {otherIndex}
          </Button>
        )}
        <ShareActions eventId={eventId} />
      </div>
      <LeadLine storedEmail={storedEmail} onForget={forgetLead} />
    </div>
  )
}

function LeadLine({
  storedEmail,
  onForget,
}: {
  storedEmail: string | null
  onForget: () => void
}) {
  if (!storedEmail) return null
  return (
    <p className="text-xs text-subtle">
      Baixando como {storedEmail} ·{' '}
      <button
        type="button"
        onClick={onForget}
        className="cursor-pointer underline hover:text-text"
      >
        trocar
      </button>
    </p>
  )
}

function ErrorPage({
  title,
  actionLabel,
  actionHref,
}: {
  title: string
  actionLabel: string
  actionHref: string
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[1180px] flex-col items-center justify-center gap-4 p-7 text-center">
      <title>Replay · Revê VAR</title>
      <EmptyState
        title={title}
        action={
          <Button
            as="link"
            to={actionHref}
            icon={<Home className="h-4 w-4" aria-hidden="true" />}
          >
            {actionLabel}
          </Button>
        }
      />
    </main>
  )
}

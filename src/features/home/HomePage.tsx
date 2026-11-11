import { ArrowRight, ChevronRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { Thumbnail } from '../../components/ui/Thumbnail'
import { formatDuration, formatRelativeDay, formatTime } from '../../lib/dates'
import { useClubs, useCourts, useReplays } from '../../lib/api/hooks'
import type { ReplayEvent } from '../../lib/api/types'

const RECENT_REFETCH_MS = 60_000
const EMPTY_TODAY_MESSAGE =
  'Nenhum replay ainda hoje. Aperte o botão na quadra depois de um lance!'

export function HomePage() {
  const clubsQuery = useClubs()
  const clubs = clubsQuery.data?.items ?? []
  const singleClub = clubs.length === 1 ? clubs[0] : null

  const courtsQuery = useCourts(singleClub?.id)
  const courts = courtsQuery.data?.items ?? []
  const singleCourt = courts.length === 1 ? courts[0] : null

  const replaysQuery = useReplays(
    { limit: 8 },
    { refetchInterval: RECENT_REFETCH_MS },
  )
  const replays = replaysQuery.data?.pages[0]?.items ?? []
  const featured = replays[0]

  const chipLabel =
    singleClub && singleCourt
      ? `${singleClub.name} · ${singleCourt.name}`
      : 'Replay automático'

  return (
    <>
      <title>Revê VAR</title>
      <Hero
        chipLabel={chipLabel}
        featured={featured}
        isLoading={replaysQuery.isLoading}
      />

      {replaysQuery.isError ? (
        <section className="mx-auto max-w-[1180px] px-4 py-10 md:px-7">
          <ErrorState
            title="Não foi possível carregar os replays."
            action={
              <Button
                size="md"
                variant="secondary"
                onClick={() => replaysQuery.refetch()}
              >
                Tentar de novo
              </Button>
            }
          />
        </section>
      ) : (
        <>
          <FeaturedReplayMobile
            replay={featured}
            isLoading={replaysQuery.isLoading}
          />
          <RecentReplays replays={replays} isLoading={replaysQuery.isLoading} />
        </>
      )}

      <ClubsTeaser />
    </>
  )
}

function Hero({
  chipLabel,
  featured,
  isLoading,
}: {
  chipLabel: string
  featured: ReplayEvent | undefined
  isLoading: boolean
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <svg
        viewBox="0 0 1440 640"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1.5">
          <rect x="80" y="60" width="1280" height="520" rx="4" />
          <line x1="720" y1="60" x2="720" y2="580" />
          <circle cx="720" cy="320" r="110" />
          <rect x="80" y="200" width="150" height="240" />
          <rect x="1210" y="200" width="150" height="240" />
        </g>
      </svg>

      <div className="relative mx-auto flex max-w-[1180px] flex-wrap items-center gap-12 px-4 py-9 md:gap-16 md:px-7 md:py-16">
        <div className="flex min-w-0 flex-1 basis-[440px] flex-col gap-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border py-1.5 pl-2.5 pr-3 text-[12px] font-medium text-[#D4D4D8] md:text-[13px]">
            <span className="h-1.5 w-1.5 rounded-full bg-red shadow-[0_0_0_4px_rgba(225,6,19,0.18)]" />
            {chipLabel}
          </span>
          <h1 className="font-display text-[52px] uppercase leading-[0.98] md:text-[84px]">
            Replays
            <br />
            <span className="text-red">da quadra</span>
          </h1>
          <p className="max-w-[470px] text-base leading-relaxed text-muted md:text-lg">
            Os lances salvos pelo botão ficam disponíveis aqui, gravados por
            duas câmeras. Escolha o dia e o horário do seu jogo para assistir e
            baixar.
          </p>
          <div className="flex flex-col gap-2.5 pt-1.5 md:flex-row md:flex-wrap">
            <Button
              as="link"
              to="/replays"
              size="lg"
              icon={<Play className="h-3.5 w-3.5" aria-hidden="true" />}
            >
              Ver replays
            </Button>
            <Button as="link" to="/como-funciona" variant="secondary" size="lg">
              Como funciona
            </Button>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 basis-[520px] md:block">
          <HeroReplayCard featured={featured} isLoading={isLoading} />
        </div>
      </div>
    </section>
  )
}

function HeroReplayCard({
  featured,
  isLoading,
}: {
  featured: ReplayEvent | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-3.5">
        <Skeleton className="aspect-video w-full rounded-[14px]" />
        <Skeleton className="mt-3.5 h-5 w-32" />
      </div>
    )
  }

  if (!featured) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5">
        <EmptyState title={EMPTY_TODAY_MESSAGE} />
      </div>
    )
  }

  const camera1 = featured.clips.find((c) => c.cameraIndex === 1)
  const camera2 = featured.clips.find((c) => c.cameraIndex === 2)

  return (
    <Link
      to={`/replays/${featured.id}`}
      aria-label="Assistir o último replay"
      className="block rounded-2xl border border-border bg-gradient-to-b from-[#16171A] to-surface p-3.5 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_30px_80px_rgba(0,0,0,0.55)]"
    >
      <Thumbnail
        thumbnailUrl={camera1?.thumbnailUrl ?? null}
        status={camera1?.status}
        cameraLabel="Câmera 1"
        durationLabel={
          featured.durationSec
            ? formatDuration(featured.durationSec)
            : undefined
        }
        showPlay
        className="rounded-[14px]"
      />
      <div className="flex items-center justify-between gap-3 px-1.5 pb-1 pt-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Último replay
          </span>
          <span className="text-[17px] font-bold">
            {formatRelativeDay(featured.pressedAt)},{' '}
            {formatTime(featured.pressedAt)}
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="aspect-video w-[72px] rounded-md border-2 border-red bg-thumb" />
          <span
            className={`aspect-video w-[72px] rounded-md bg-thumb ${camera2 ? 'border border-border-strong' : 'border border-dashed border-border'}`}
          />
        </div>
      </div>
    </Link>
  )
}

function FeaturedReplayMobile({
  replay,
  isLoading,
}: {
  replay: ReplayEvent | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1180px] px-4 pb-2 pt-7 md:hidden">
        <Skeleton className="aspect-video w-full rounded-lg" />
      </section>
    )
  }

  if (!replay) {
    return (
      <section className="mx-auto max-w-[1180px] px-4 pb-2 pt-7 md:hidden">
        <EmptyState title={EMPTY_TODAY_MESSAGE} />
      </section>
    )
  }

  const camera1 = replay.clips.find((c) => c.cameraIndex === 1)

  return (
    <section
      aria-labelledby="ultimo"
      className="mx-auto max-w-[1180px] px-4 pb-2 pt-7 md:hidden"
    >
      <h2
        id="ultimo"
        className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-subtle"
      >
        Último replay
      </h2>
      <Link
        to={`/replays/${replay.id}`}
        className="flex flex-col gap-2.5 rounded-xl border border-border bg-gradient-to-b from-card-from to-card-to p-2.5 shadow-card"
      >
        <Thumbnail
          thumbnailUrl={camera1?.thumbnailUrl ?? null}
          status={camera1?.status}
          cameraLabel={`${replay.clips.length} ângulos`}
          showPlay
        />
        <div className="flex items-center justify-between px-1 pb-0.5">
          <span className="text-lg font-bold">
            {formatRelativeDay(replay.pressedAt)},{' '}
            {formatTime(replay.pressedAt)}
          </span>
          <span className="text-[13px] text-subtle">{replay.courtName}</span>
        </div>
      </Link>
    </section>
  )
}

function RecentReplays({
  replays,
  isLoading,
}: {
  replays: ReplayEvent[]
  isLoading: boolean
}) {
  // Desktop grid shows all 8 (the featured one included, matching the mockup);
  // mobile list skips it since it's already shown just above as "Último replay".
  const mobileList = replays.slice(1, 5)
  const showEmptyDesktop = !isLoading && replays.length === 0

  return (
    <section
      aria-labelledby="ultimos"
      className="mx-auto max-w-[1180px] px-4 py-6 md:px-7 md:py-20"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2
            id="ultimos"
            className="font-display text-2xl uppercase md:text-4xl"
          >
            Últimos replays
          </h2>
          <span className="hidden text-[15px] text-muted md:block">
            Atualizado a cada novo lance
          </span>
        </div>
        <div className="hidden md:block">
          <Button
            as="link"
            to="/replays"
            variant="secondary"
            icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          >
            Ver todos
          </Button>
        </div>
        <Link
          to="/replays"
          className="flex min-h-11 items-center text-sm font-semibold md:hidden"
        >
          Ver todos
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-video w-full rounded-[14px]" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {showEmptyDesktop ? null : (
            <div className="hidden grid-cols-1 gap-5 md:grid md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
              {replays.map((event) => (
                <RecentReplayCard key={event.id} event={event} />
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2 md:hidden">
            {mobileList.map((event) => (
              <RecentReplayRow key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function RecentReplayCard({ event }: { event: ReplayEvent }) {
  const camera1 = event.clips.find((c) => c.cameraIndex === 1)

  return (
    <Link to={`/replays/${event.id}`} className="flex flex-col gap-3 text-text">
      <Thumbnail
        thumbnailUrl={camera1?.thumbnailUrl ?? null}
        status={camera1?.status}
        cameraLabel={`${event.clips.length} ângulos`}
        durationLabel={
          event.durationSec ? formatDuration(event.durationSec) : undefined
        }
        className="rounded-[14px] border border-border"
      />
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[15px] font-semibold">
          {formatRelativeDay(event.pressedAt)}, {formatTime(event.pressedAt)}
        </span>
        <span className="text-[13px] text-subtle">{event.courtName}</span>
      </div>
    </Link>
  )
}

function RecentReplayRow({ event }: { event: ReplayEvent }) {
  const camera1 = event.clips.find((c) => c.cameraIndex === 1)

  return (
    <Link
      to={`/replays/${event.id}`}
      className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-2"
    >
      <Thumbnail
        thumbnailUrl={camera1?.thumbnailUrl ?? null}
        status={camera1?.status}
        className="w-[104px] flex-none"
      />
      <div className="flex flex-1 flex-col">
        <span className="text-base font-bold tabular-nums">
          {formatRelativeDay(event.pressedAt)}, {formatTime(event.pressedAt)}
        </span>
        <span className="text-xs text-subtle">
          {event.courtName} · {event.clips.length} ângulos
        </span>
      </div>
      <ChevronRight
        className="h-[18px] w-[18px] flex-none text-subtle"
        aria-hidden="true"
      />
    </Link>
  )
}

function ClubsTeaser() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-9 pt-2 md:hidden">
      <Link
        to="/para-clubes"
        className="flex flex-col gap-2 rounded-xl border border-border bg-gradient-to-b from-[#16171A] to-surface p-5"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
          Para clubes
        </span>
        <span className="font-display text-[26px] uppercase leading-tight">
          Quer o Revê VAR no seu clube?
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4D4D8]">
          Saiba mais
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </section>
  )
}

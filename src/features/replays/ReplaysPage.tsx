import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import {
  useAvailability,
  useClubs,
  useConfig,
  useCourts,
  useReplays,
} from '../../lib/api/hooks'
import { toLocalDateString } from '../../lib/dates'
import type { ReplayEvent } from '../../lib/api/types'
import { FilterBar } from './FilterBar'
import { ReplayCard } from './ReplayCard'
import {
  filtersToParams,
  parseFilters,
  pickDefaultHour,
  resolveDateParam,
  withClubChange,
  withDayChange,
  type CameraFilter,
} from './filters'

const TODAY_REFETCH_MS = 30_000
const FALLBACK_HOURS = Array.from({ length: 18 }, (_, i) => ({ hour: i + 6 }))

function dayLabel(dia: string): string {
  if (dia === 'hoje') return 'Hoje'
  if (dia === 'ontem') return 'Ontem'
  const [y, m, d] = dia.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
}

export function ReplaysPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFilters(searchParams)

  const configQuery = useConfig()
  const clubsQuery = useClubs()
  const clubs = clubsQuery.data?.items ?? []

  // Default = the only club, or the first (spec §6.2).
  const effectiveClub = clubs.find((c) => c.slug === filters.clube) ?? clubs[0]

  const courtsQuery = useCourts(effectiveClub?.id)
  const courts = courtsQuery.data?.items ?? []
  // Default = the only court; if several and none chosen, "all courts" (effectiveCourt undefined).
  const effectiveCourt =
    courts.find((c) => c.slug === filters.quadra) ??
    (courts.length === 1 ? courts[0] : undefined)

  const isToday = filters.dia === 'hoje'
  const dateParam = resolveDateParam(filters.dia)

  const availabilityQuery = useAvailability(
    {
      clubId: effectiveClub?.id ?? '',
      courtId: effectiveCourt?.id,
      date: dateParam,
    },
    { refetchInterval: isToday ? TODAY_REFETCH_MS : undefined },
  )
  const hours = availabilityQuery.isError
    ? FALLBACK_HOURS
    : (availabilityQuery.data?.hours ?? [])

  // Default-hour rule (spec §6.2): once availability has loaded and the URL
  // doesn't pin an hour, write the computed default into the URL (replace).
  // This reads/writes the router's URL state (an external system), so it's a
  // legitimate effect rather than a render-time state adjustment.
  useEffect(() => {
    if (filters.hora !== '') return
    if (!availabilityQuery.data) return
    const defaultHour = pickDefaultHour(
      availabilityQuery.data.hours,
      new Date().getHours(),
    )
    setSearchParams(filtersToParams({ ...filters, hora: defaultHour }), {
      replace: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-running on every `filters` identity change would loop
  }, [availabilityQuery.data, filters.hora, setSearchParams])

  const replaysQuery = useReplays(
    {
      clubId: effectiveClub?.id,
      courtId: effectiveCourt?.id,
      date: dateParam,
      hour:
        filters.hora !== 'todas' && filters.hora !== ''
          ? Number(filters.hora)
          : undefined,
      limit: 20,
    },
    { refetchInterval: isToday ? TODAY_REFETCH_MS : undefined },
  )

  // "Novos replays" pill (spec §6.4): a background refetch on "hoje" can bring
  // newer events. Don't swap them in under the user — freeze what's shown and
  // offer a pill instead. The snapshot is tagged with the filter key it
  // belongs to, and rendering only ever trusts a snapshot whose key matches
  // the *current* filters — this is what keeps a change of filters (which
  // itself triggers a render-time state adjustment below) from ever being
  // able to race against "new data arrived for the old filters" and get
  // stuck showing a frozen-forever empty list.
  type FirstPageSnapshot = { key: string; items: ReplayEvent[] }
  const [frozen, setFrozen] = useState<FirstPageSnapshot | null>(null)
  const [lastSeen, setLastSeen] = useState<FirstPageSnapshot | null>(null)
  const [hasNewReplays, setHasNewReplays] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const filterKey = `${effectiveClub?.id}|${effectiveCourt?.id ?? ''}|${dateParam}|${filters.hora}`
  const firstPageItems = replaysQuery.data?.pages[0]?.items ?? null

  if (
    firstPageItems &&
    (lastSeen === null ||
      lastSeen.key !== filterKey ||
      lastSeen.items !== firstPageItems)
  ) {
    setLastSeen({ key: filterKey, items: firstPageItems })
    if (frozen === null || frozen.key !== filterKey) {
      setFrozen({ key: filterKey, items: firstPageItems })
      setHasNewReplays(false)
    } else if (frozen.items[0]?.id !== firstPageItems[0]?.id) {
      setHasNewReplays(true)
    } else {
      // Same newest item — safe to sync silently (e.g. a clip finished processing).
      setFrozen({ key: filterKey, items: firstPageItems })
    }
  } else if (!firstPageItems && frozen !== null && frozen.key !== filterKey) {
    // Filters changed and the new fetch hasn't resolved yet — don't keep showing the old filter's cards.
    setFrozen(null)
    setHasNewReplays(false)
  }

  function showNewReplays() {
    if (firstPageItems) setFrozen({ key: filterKey, items: firstPageItems })
    setHasNewReplays(false)
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const laterPages = (replaysQuery.data?.pages ?? [])
    .slice(1)
    .flatMap((p) => p.items)
  const displayedFirstPage =
    frozen && frozen.key === filterKey ? frozen.items : []
  const items = [...displayedFirstPage, ...laterPages]
  const nextCursor =
    replaysQuery.data?.pages[replaysQuery.data.pages.length - 1]?.nextCursor ??
    null

  const retentionHours = configQuery.data?.retentionHours ?? 24
  const retentionDays = Math.max(1, Math.ceil(retentionHours / 24))
  const today = new Date()
  const minDateObj = new Date(today)
  minDateObj.setDate(minDateObj.getDate() - retentionDays)
  const minDate = toLocalDateString(minDateObj)
  const maxDate = toLocalDateString(today)

  const resultCount =
    filters.hora === 'todas'
      ? availabilityQuery.data?.total
      : availabilityQuery.data?.hours.find(
          (h) => h.hour === Number(filters.hora),
        )?.count
  const resultCountLabel =
    resultCount !== undefined
      ? resultCount === 1
        ? '1 replay'
        : `${resultCount} replays`
      : null
  const resultTitle =
    dayLabel(filters.dia) +
    (filters.hora === 'todas' || filters.hora === ''
      ? ''
      : `, ${filters.hora}h`)

  const isInitialLoading = replaysQuery.isLoading
  const isEmpty =
    !isInitialLoading && !replaysQuery.isError && items.length === 0
  const noReplaysAllDay = isToday && availabilityQuery.data?.total === 0

  return (
    <>
      <title>Replays · Revê VAR</title>

      <section className="mx-auto flex max-w-[1180px] flex-col gap-2.5 px-4 pb-0 pt-9 md:px-7 md:pb-7 md:pt-16">
        <h1 className="font-display text-5xl uppercase">Replays</h1>
        <p className="hidden text-base text-muted md:block">
          Escolha o clube, a quadra, o dia e o horário do seu jogo. Cada lance
          vem com os dois ângulos.
        </p>
        <p className="text-sm text-muted md:hidden">
          Escolha onde e quando você jogou.
        </p>
      </section>

      <FilterBar
        clubs={clubs}
        courts={courts}
        filters={filters}
        effectiveClube={effectiveClub?.slug ?? ''}
        effectiveQuadra={effectiveCourt?.slug ?? ''}
        hours={hours}
        minDate={minDate}
        maxDate={maxDate}
        onClubChange={(slug) =>
          setSearchParams(filtersToParams(withClubChange(filters, slug)), {
            replace: true,
          })
        }
        onQuadraChange={(slug) =>
          setSearchParams(
            filtersToParams({ ...filters, quadra: slug || null }),
            { replace: true },
          )
        }
        onDayChange={(dia) =>
          setSearchParams(filtersToParams(withDayChange(filters, dia)), {
            replace: true,
          })
        }
        onHourChange={(hora) =>
          setSearchParams(filtersToParams({ ...filters, hora }), {
            replace: true,
          })
        }
        onCameraChange={(camera: CameraFilter) =>
          setSearchParams(filtersToParams({ ...filters, camera }), {
            replace: true,
          })
        }
      />

      <section
        aria-labelledby="res"
        ref={resultsRef}
        className="mx-auto max-w-[1180px] px-4 py-7 md:px-7 md:pb-[104px]"
      >
        <div className="mb-5 flex items-baseline gap-3">
          <h2 id="res" className="text-xl font-bold">
            {resultTitle}
          </h2>
          {resultCountLabel && (
            <span className="text-sm text-subtle">{resultCountLabel}</span>
          )}
        </div>

        {hasNewReplays && (
          <button
            type="button"
            onClick={showNewReplays}
            className="mb-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-red bg-red-tint px-4 text-sm font-semibold text-white"
          >
            Novos replays · Ver
          </button>
        )}

        {replaysQuery.isError ? (
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
        ) : isInitialLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-xl border border-border p-3"
              >
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            title="Nenhum replay nesse horário."
            description={
              noReplaysAllDay
                ? 'Tente outro horário ou dia. Ainda não teve replay hoje.'
                : 'Tente outro horário ou dia.'
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[repeat(auto-fill,minmax(500px,1fr))]">
              {items.map((event) => (
                <ReplayCard
                  key={event.id}
                  event={event}
                  camera={filters.camera}
                />
              ))}
            </div>
            {nextCursor && (
              <div className="mt-7 flex justify-center">
                <Button
                  variant="secondary"
                  loading={replaysQuery.isFetchingNextPage}
                  onClick={() => replaysQuery.fetchNextPage()}
                >
                  Carregar mais
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}

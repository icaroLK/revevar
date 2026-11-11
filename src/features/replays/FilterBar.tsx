import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { SelectField } from '../../components/ui/SelectField'
import type { Club, Court } from '../../lib/api/types'
import { DayFilterGroup } from './DayFilterGroup'
import { HourChips } from './HourChips'
import type { CameraFilter, ReplaysFilters } from './filters'

type FilterBarProps = {
  clubs: Club[]
  courts: Court[]
  filters: ReplaysFilters
  effectiveClube: string
  effectiveQuadra: string
  hours: { hour: number; count?: number }[]
  minDate: string
  maxDate: string
  onClubChange: (slug: string) => void
  onQuadraChange: (slug: string) => void
  onDayChange: (dia: string) => void
  onHourChange: (hora: string) => void
  onCameraChange: (camera: CameraFilter) => void
}

const CAMERA_OPTIONS: { value: CameraFilter; label: string }[] = [
  { value: 'ambas', label: 'Ambas' },
  { value: '1', label: 'Câm 1' },
  { value: '2', label: 'Câm 2' },
]

/** Sticky filter bar (spec §6.1) — one row on desktop, stacked on mobile. */
export function FilterBar({
  clubs,
  courts,
  filters,
  effectiveClube,
  effectiveQuadra,
  hours,
  minDate,
  maxDate,
  onClubChange,
  onQuadraChange,
  onDayChange,
  onHourChange,
  onCameraChange,
}: FilterBarProps) {
  const clubOptions = clubs.map((c) => ({ value: c.slug, label: c.name }))
  const courtOptions =
    courts.length > 1
      ? [
          { value: '', label: 'Todas' },
          ...courts.map((c) => ({ value: c.slug, label: c.name })),
        ]
      : courts.map((c) => ({ value: c.slug, label: c.name }))
  const showDivider = clubOptions.length > 1 || courtOptions.length > 1

  return (
    <section
      aria-label="Filtros"
      className="sticky top-14 z-[5] border-y border-border bg-bg/85 backdrop-blur-[14px] md:top-[69px]"
    >
      <div className="mx-auto hidden max-w-[1180px] flex-wrap items-center gap-3 px-7 py-4 md:flex">
        <SelectField
          label="Clube"
          value={effectiveClube}
          onChange={onClubChange}
          options={clubOptions}
        />
        <SelectField
          label="Quadra"
          value={effectiveQuadra}
          onChange={onQuadraChange}
          options={courtOptions}
        />
        {showDivider && (
          <span aria-hidden="true" className="h-7 w-px bg-border" />
        )}
        <DayFilterGroup
          dia={filters.dia}
          onChange={onDayChange}
          minDate={minDate}
          maxDate={maxDate}
          layout="row"
        />
        <span aria-hidden="true" className="h-7 w-px bg-border" />
        <HourChips hours={hours} value={filters.hora} onChange={onHourChange} />
        <div className="flex-1" />
        <SegmentedControl
          label="Câmera"
          value={filters.camera}
          onChange={onCameraChange}
          options={CAMERA_OPTIONS}
        />
      </div>

      <div className="flex flex-col gap-2.5 px-4 py-2.5 md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="Clube"
            value={effectiveClube}
            onChange={onClubChange}
            options={clubOptions}
          />
          <SelectField
            label="Quadra"
            value={effectiveQuadra}
            onChange={onQuadraChange}
            options={courtOptions}
          />
        </div>
        <DayFilterGroup
          dia={filters.dia}
          onChange={onDayChange}
          minDate={minDate}
          maxDate={maxDate}
          layout="grid3"
        />
        <HourChips
          hours={hours}
          value={filters.hora}
          onChange={onHourChange}
          scrollable
        />
      </div>
    </section>
  )
}

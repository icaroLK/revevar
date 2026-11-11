import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '../../lib/cn'

type DayFilterGroupProps = {
  dia: string
  onChange: (dia: string) => void
  minDate: string
  maxDate: string
  layout: 'row' | 'grid3'
}

function formatCustomDateLabel(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split('-').map(Number)
  return format(new Date(y, m - 1, d), "d 'de' MMM", { locale: ptBR })
}

function segmentClasses(active: boolean): string {
  return cn(
    'h-10 cursor-pointer whitespace-nowrap rounded-[9px] px-4 text-sm transition active:scale-[0.96]',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red',
    active
      ? 'bg-text font-semibold text-bg'
      : 'bg-transparent font-medium text-muted hover:text-text',
  )
}

/** The "Hoje / Ontem / Data" group (spec §6.1) — the date picker lives in the same pill as the segmented toggle. */
export function DayFilterGroup({
  dia,
  onChange,
  minDate,
  maxDate,
  layout,
}: DayFilterGroupProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const isCustom = dia !== 'hoje' && dia !== 'ontem'

  return (
    <div
      role="group"
      aria-label="Dia"
      className={cn(
        'gap-1 rounded-md border border-border bg-surface p-1',
        layout === 'row' ? 'inline-flex' : 'grid grid-cols-3',
      )}
    >
      <button
        type="button"
        aria-pressed={dia === 'hoje'}
        onClick={() => onChange('hoje')}
        className={segmentClasses(dia === 'hoje')}
      >
        Hoje
      </button>
      <button
        type="button"
        aria-pressed={dia === 'ontem'}
        onClick={() => onChange('ontem')}
        className={segmentClasses(dia === 'ontem')}
      >
        Ontem
      </button>
      {pickerOpen ? (
        <input
          type="date"
          autoFocus
          min={minDate}
          max={maxDate}
          defaultValue={isCustom ? dia : maxDate}
          onChange={(e) => {
            if (e.target.value) onChange(e.target.value)
            setPickerOpen(false)
          }}
          onBlur={() => setPickerOpen(false)}
          className={cn(segmentClasses(true), 'cursor-pointer')}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={cn(
            segmentClasses(isCustom),
            'inline-flex items-center justify-center gap-1.5',
          )}
        >
          <Calendar className="h-[15px] w-[15px]" aria-hidden="true" />
          {isCustom
            ? formatCustomDateLabel(dia)
            : layout === 'row'
              ? 'Data'
              : 'Outra data'}
        </button>
      )}
    </div>
  )
}

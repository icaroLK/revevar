import { Chip } from '../../components/ui/Chip'
import { cn } from '../../lib/cn'

type HourChipsProps = {
  hours: { hour: number; count?: number }[]
  value: string
  onChange: (hora: string) => void
  scrollable?: boolean
}

/** Hour chips from availability, plus "Todas" (spec §6.2). */
export function HourChips({
  hours,
  value,
  onChange,
  scrollable = false,
}: HourChipsProps) {
  return (
    <div
      role="group"
      aria-label="Horário"
      className={cn(
        'flex gap-1.5',
        scrollable
          ? 'overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'flex-wrap',
      )}
    >
      <Chip
        active={value === 'todas'}
        onClick={() => onChange('todas')}
        className={scrollable ? 'flex-none' : undefined}
      >
        Todas
      </Chip>
      {hours.map((h) => (
        <Chip
          key={h.hour}
          active={value === String(h.hour)}
          count={h.count}
          onClick={() => onChange(String(h.hour))}
          className={scrollable ? 'flex-none' : undefined}
        >
          {h.hour}h
        </Chip>
      ))}
    </div>
  )
}

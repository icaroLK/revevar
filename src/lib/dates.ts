import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** "19:43" */
export function formatTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm', { locale: ptBR })
}

/** "Hoje" / "Ontem" / "10 de nov." (spec §11). */
export function formatRelativeDay(iso: string): string {
  const date = parseISO(iso)
  if (isToday(date)) return 'Hoje'
  if (isYesterday(date)) return 'Ontem'
  return format(date, "d 'de' MMM", { locale: ptBR })
}

/** "0:35" from a duration in seconds. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** "yyyy-MM-dd" in local time, for API date params and availability lookups. */
export function toLocalDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

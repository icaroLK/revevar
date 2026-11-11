import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
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

/** "19:43 de amanhã" / "19:43 de hoje" / "19:43 de 10 de nov." — the expiry badge text. */
export function formatExpiry(expiresAtIso: string): string {
  const expires = parseISO(expiresAtIso)
  const time = formatTime(expiresAtIso)
  if (isTomorrow(expires)) return `${time} de amanhã`
  if (isToday(expires)) return `${time} de hoje`
  return `${time} de ${format(expires, "d 'de' MMM", { locale: ptBR })}`
}

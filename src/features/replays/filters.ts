import { toLocalDateString } from '../../lib/dates'

export type CameraFilter = 'ambas' | '1' | '2'

export type ReplaysFilters = {
  clube: string | null
  quadra: string | null
  dia: string // 'hoje' | 'ontem' | 'YYYY-MM-DD'
  hora: string // '0'-'23' | 'todas' | '' (unresolved — default-hour rule applies)
  camera: CameraFilter
}

const CAMERA_VALUES: CameraFilter[] = ['ambas', '1', '2']

export function parseFilters(params: URLSearchParams): ReplaysFilters {
  const camera = params.get('camera')
  return {
    clube: params.get('clube'),
    quadra: params.get('quadra'),
    dia: params.get('dia') ?? 'hoje',
    hora: params.get('hora') ?? '',
    camera: CAMERA_VALUES.includes(camera as CameraFilter)
      ? (camera as CameraFilter)
      : 'ambas',
  }
}

/** Inverse of parseFilters — omits values equal to the default so the URL stays clean. */
export function filtersToParams(filters: ReplaysFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.clube) params.set('clube', filters.clube)
  if (filters.quadra) params.set('quadra', filters.quadra)
  if (filters.dia !== 'hoje') params.set('dia', filters.dia)
  if (filters.hora) params.set('hora', filters.hora)
  if (filters.camera !== 'ambas') params.set('camera', filters.camera)
  return params
}

/** `dia` -> the `YYYY-MM-DD` the API expects. `now` is injectable for tests. */
export function resolveDateParam(dia: string, now: Date = new Date()): string {
  if (dia === 'hoje') return toLocalDateString(now)
  if (dia === 'ontem') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return toLocalDateString(yesterday)
  }
  return dia
}

/**
 * "Pick the current hour if it has replays, else the most recent hour that
 * has replays, else todas" (spec §6.2).
 */
export function pickDefaultHour(
  hours: { hour: number; count: number }[],
  currentHour: number,
): string {
  if (hours.length === 0) return 'todas'
  if (hours.some((h) => h.hour === currentHour)) return String(currentHour)

  const past = hours.filter((h) => h.hour <= currentHour)
  const pool = past.length > 0 ? past : hours
  const mostRecent = pool.reduce((latest, h) =>
    h.hour > latest.hour ? h : latest,
  )
  return String(mostRecent.hour)
}

/** Changing the club resets the court and hour (spec §6.2). */
export function withClubChange(
  filters: ReplaysFilters,
  clube: string,
): ReplaysFilters {
  return { ...filters, clube, quadra: null, hora: '' }
}

/** Changing the day resets the hour back to the default rule (spec §6.2). */
export function withDayChange(
  filters: ReplaysFilters,
  dia: string,
): ReplaysFilters {
  return { ...filters, dia, hora: '' }
}

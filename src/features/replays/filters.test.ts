import { describe, expect, it } from 'vitest'
import {
  filtersToParams,
  parseFilters,
  pickDefaultHour,
  resolveDateParam,
  withClubChange,
  withDayChange,
  type ReplaysFilters,
} from './filters'

describe('parseFilters', () => {
  it('defaults to hoje/ambas/unresolved hour when the URL has nothing', () => {
    expect(parseFilters(new URLSearchParams())).toEqual({
      clube: null,
      quadra: null,
      dia: 'hoje',
      hora: '',
      camera: 'ambas',
    })
  })

  it('reads every param when present', () => {
    const params = new URLSearchParams(
      'clube=tupi&quadra=quadra-1&dia=ontem&hora=19&camera=1',
    )
    expect(parseFilters(params)).toEqual({
      clube: 'tupi',
      quadra: 'quadra-1',
      dia: 'ontem',
      hora: '19',
      camera: '1',
    })
  })

  it('falls back to ambas for an invalid camera value', () => {
    expect(parseFilters(new URLSearchParams('camera=lado')).camera).toBe(
      'ambas',
    )
  })
})

describe('filtersToParams', () => {
  it('omits every value equal to its default', () => {
    const filters: ReplaysFilters = {
      clube: null,
      quadra: null,
      dia: 'hoje',
      hora: '',
      camera: 'ambas',
    }
    expect(filtersToParams(filters).toString()).toBe('')
  })

  it('round-trips through parseFilters for a non-default set', () => {
    const filters: ReplaysFilters = {
      clube: 'tupi',
      quadra: 'quadra-1',
      dia: '2026-11-01',
      hora: '20',
      camera: '2',
    }
    expect(parseFilters(filtersToParams(filters))).toEqual(filters)
  })
})

describe('resolveDateParam', () => {
  const now = new Date(2026, 10, 11, 19, 43) // Nov 11 2026, local time

  it('resolves hoje to the given date', () => {
    expect(resolveDateParam('hoje', now)).toBe('2026-11-11')
  })

  it('resolves ontem to the day before', () => {
    expect(resolveDateParam('ontem', now)).toBe('2026-11-10')
  })

  it('passes a literal date straight through', () => {
    expect(resolveDateParam('2026-10-05', now)).toBe('2026-10-05')
  })
})

describe('pickDefaultHour', () => {
  it('returns todas when nothing has replays', () => {
    expect(pickDefaultHour([], 19)).toBe('todas')
  })

  it('picks the current hour when it has replays', () => {
    const hours = [
      { hour: 18, count: 2 },
      { hour: 19, count: 3 },
    ]
    expect(pickDefaultHour(hours, 19)).toBe('19')
  })

  it('falls back to the most recent past hour when the current hour is empty', () => {
    const hours = [
      { hour: 17, count: 1 },
      { hour: 18, count: 2 },
    ]
    expect(pickDefaultHour(hours, 20)).toBe('18')
  })

  it('falls back to the latest available hour when nothing is in the past yet', () => {
    // e.g. clock skew, or the court's first-ever replay happened later than "now"
    const hours = [
      { hour: 21, count: 1 },
      { hour: 22, count: 1 },
    ]
    expect(pickDefaultHour(hours, 10)).toBe('22')
  })
})

describe('withClubChange', () => {
  it('resets quadra and hora, keeps dia and camera', () => {
    const filters: ReplaysFilters = {
      clube: 'tupi',
      quadra: 'quadra-1',
      dia: 'ontem',
      hora: '19',
      camera: '2',
    }
    expect(withClubChange(filters, 'vila')).toEqual({
      clube: 'vila',
      quadra: null,
      dia: 'ontem',
      hora: '',
      camera: '2',
    })
  })
})

describe('withDayChange', () => {
  it('resets hora, keeps everything else', () => {
    const filters: ReplaysFilters = {
      clube: 'tupi',
      quadra: 'quadra-1',
      dia: 'hoje',
      hora: '19',
      camera: '1',
    }
    expect(withDayChange(filters, 'ontem')).toEqual({
      clube: 'tupi',
      quadra: 'quadra-1',
      dia: 'ontem',
      hora: '',
      camera: '1',
    })
  })
})

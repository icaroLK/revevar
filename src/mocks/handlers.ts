import { http, HttpResponse, type HttpHandler } from 'msw'
import { z } from 'zod'
import { toLocalDateString } from '../lib/dates'
import {
  EXPIRED_EVENT_ID,
  MOCK_CLUB,
  MOCK_CLUBS,
  MOCK_COURTS,
  MOCK_EVENTS,
} from './data'

const CONSENT_VERSION = '2026-11-v1'

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  return HttpResponse.json({ error: { code, message, details } }, { status })
}

const downloadRequestSchema = z.object({
  clipIds: z.array(z.string()).min(1),
  email: z.email(),
  name: z.string().optional(),
  consent: z.boolean(),
  consentVersion: z.string(),
})

export const handlers: HttpHandler[] = [
  http.get('/api/v1/config', () =>
    HttpResponse.json({
      retentionHours: 168, // 7 days — per Ícaro, 2026-11-11 (real value still to be confirmed with the client/backend)
      whatsappNumber: '5541999999999',
      instagramHandle: 'revevar',
      consentVersion: CONSENT_VERSION,
      privacyPolicyUrl: '/privacidade',
      supportEmail: null,
    }),
  ),

  http.get('/api/v1/clubs', () => HttpResponse.json({ items: MOCK_CLUBS })),

  http.get('/api/v1/clubs/:clubId/courts', ({ params }) => {
    if (params.clubId !== MOCK_CLUB.id) return HttpResponse.json({ items: [] })
    return HttpResponse.json({ items: MOCK_COURTS })
  }),

  http.get('/api/v1/replays/availability', ({ request }) => {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    if (!date)
      return errorResponse(
        400,
        'VALIDATION_ERROR',
        'Parâmetro "date" é obrigatório.',
      )

    const dayEvents = MOCK_EVENTS.filter(
      (e) => toLocalDateString(new Date(e.pressedAt)) === date,
    )
    const counts = new Map<number, number>()
    for (const e of dayEvents) {
      const hour = new Date(e.pressedAt).getHours()
      counts.set(hour, (counts.get(hour) ?? 0) + 1)
    }
    const hours = [...counts.entries()]
      .sort(([a], [b]) => a - b)
      .map(([hour, count]) => ({ hour, count }))

    return HttpResponse.json({ date, hours, total: dayEvents.length })
  }),

  http.get('/api/v1/replays', ({ request }) => {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const hour = url.searchParams.get('hour')
    const limit = Number(url.searchParams.get('limit') ?? 20)
    const cursor = url.searchParams.get('cursor')

    let filtered = MOCK_EVENTS
    if (date) {
      filtered = filtered.filter(
        (e) => toLocalDateString(new Date(e.pressedAt)) === date,
      )
    }
    if (date && hour !== null) {
      const h = Number(hour)
      filtered = filtered.filter((e) => new Date(e.pressedAt).getHours() === h)
    }

    const offset = cursor ? Number(cursor) : 0
    const items = filtered.slice(offset, offset + limit)
    const nextOffset = offset + limit
    const nextCursor = nextOffset < filtered.length ? String(nextOffset) : null

    return HttpResponse.json({ items, nextCursor })
  }),

  http.get('/api/v1/replays/:eventId', ({ params }) => {
    const eventId = String(params.eventId)
    if (eventId === EXPIRED_EVENT_ID) {
      return errorResponse(410, 'REPLAY_EXPIRED', 'Este replay expirou.')
    }

    const sorted = [...MOCK_EVENTS].sort((a, b) =>
      a.pressedAt.localeCompare(b.pressedAt),
    )
    const idx = sorted.findIndex((e) => e.id === eventId)
    if (idx === -1)
      return errorResponse(404, 'NOT_FOUND', 'Replay não encontrado.')

    return HttpResponse.json({
      event: sorted[idx],
      prevEventId: idx > 0 ? sorted[idx - 1].id : null,
      nextEventId: idx < sorted.length - 1 ? sorted[idx + 1].id : null,
    })
  }),

  http.post('/api/v1/downloads', async ({ request }) => {
    const json: unknown = await request.json()
    const parsed = downloadRequestSchema.safeParse(json)
    if (!parsed.success) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Dados inválidos.')
    }
    if (!parsed.data.consent) {
      return errorResponse(
        400,
        'CONSENT_REQUIRED',
        'É necessário autorizar o uso dos dados.',
      )
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    const downloads = parsed.data.clipIds.map((clipId) => ({
      clipId,
      url: `/mock-download/${clipId}`,
      fileName: `revevar_${clipId}.mp4`,
      expiresAt,
    }))

    return HttpResponse.json({ downloads }, { status: 201 })
  }),
]

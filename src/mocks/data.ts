import type {
  Clip,
  ClipStatus,
  Club,
  Court,
  ReplayEvent,
} from '../lib/api/types'

// Fake catalog for dev/tests, matching docs/build-plan.md M2: 1 club, 1 court
// (built so a 2nd court is trivial to add), ~40 events over today/yesterday
// between 17h-22h, 2 clips each, a couple "processing", one "failed".
// No real media yet: thumbnailUrl/streamUrl stay null (spec-valid — Thumbnail
// falls back to the placeholder SVG). Real media wiring happens at M7.

export const MOCK_CLUB: Club = {
  id: 'club_tupi',
  slug: 'tupi',
  name: 'Tupi',
  city: 'Curitiba',
  state: 'PR',
  timezone: 'America/Sao_Paulo',
}

export const MOCK_COURT: Court = {
  id: 'court_quadra-1',
  clubId: MOCK_CLUB.id,
  slug: 'quadra-1',
  name: 'Quadra 1',
  cameraCount: 2,
}

export const MOCK_CLUBS: Club[] = [MOCK_CLUB]
export const MOCK_COURTS: Court[] = [MOCK_COURT]

export const EXPIRED_EVENT_ID = 'evt_expired'

function pad(n: number, width = 4): string {
  return String(n).padStart(width, '0')
}

function dateAt(daysAgo: number, hour: number, minute: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d
}

function buildClip(
  eventId: string,
  cameraIndex: number,
  status: ClipStatus,
): Clip {
  const isUsable = status === 'ready'
  return {
    id: `${eventId}_cam${cameraIndex}`,
    cameraIndex,
    cameraLabel: `Câmera ${cameraIndex}`,
    status,
    thumbnailUrl: null,
    streamUrl: null,
    durationSec: isUsable ? 35 : null,
    sizeBytes: isUsable ? 18_500_000 + cameraIndex * 1_200_000 : null,
  }
}

function buildEvent(
  index: number,
  daysAgo: number,
  hour: number,
  minute: number,
): ReplayEvent {
  const id = `evt_${pad(index)}`
  const pressedAt = dateAt(daysAgo, hour, minute)
  const startedAt = new Date(pressedAt.getTime() - 30_000)
  const expiresAt = new Date(pressedAt.getTime() + 24 * 60 * 60 * 1000)

  return {
    id,
    clubId: MOCK_CLUB.id,
    clubName: MOCK_CLUB.name,
    courtId: MOCK_COURT.id,
    courtName: MOCK_COURT.name,
    pressedAt: pressedAt.toISOString(),
    startedAt: startedAt.toISOString(),
    durationSec: 35,
    buttonOffsetSec: 30,
    expiresAt: expiresAt.toISOString(),
    clips: [buildClip(id, 1, 'ready'), buildClip(id, 2, 'ready')],
  }
}

function generateEvents(): ReplayEvent[] {
  const events: ReplayEvent[] = []
  let index = 1

  for (const daysAgo of [1, 0]) {
    for (let hour = 17; hour <= 22; hour++) {
      const perHour = hour % 2 === 0 ? 4 : 3
      for (let i = 0; i < perHour; i++) {
        const minute = (i * 17 + hour * 3) % 60
        events.push(buildEvent(index, daysAgo, hour, minute))
        index++
      }
    }
  }

  // Newest first, matching GET /replays' contract.
  events.sort((a, b) => b.pressedAt.localeCompare(a.pressedAt))

  // The 2 most recent plays: camera 2 still encoding.
  events[0].clips[1].status = 'processing'
  events[0].clips[1].durationSec = null
  events[0].clips[1].sizeBytes = null
  events[1].clips[1].status = 'processing'
  events[1].clips[1].durationSec = null
  events[1].clips[1].sizeBytes = null

  // One camera permanently down for a given play.
  const failedIndex = Math.floor(events.length / 2)
  events[failedIndex].clips[1].status = 'failed'
  events[failedIndex].clips[1].durationSec = null
  events[failedIndex].clips[1].sizeBytes = null

  return events
}

export const MOCK_EVENTS: ReplayEvent[] = generateEvents()

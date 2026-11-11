import { z } from 'zod'

// Shared types — docs/api-contract.md §1.

export const clubSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  timezone: z.string(),
})
export type Club = z.infer<typeof clubSchema>

export const courtSchema = z.object({
  id: z.string(),
  clubId: z.string(),
  slug: z.string(),
  name: z.string(),
  cameraCount: z.number(),
})
export type Court = z.infer<typeof courtSchema>

export const clipStatusSchema = z.enum(['processing', 'ready', 'failed'])
export type ClipStatus = z.infer<typeof clipStatusSchema>

export const clipSchema = z.object({
  id: z.string(),
  cameraIndex: z.number(),
  cameraLabel: z.string(),
  status: clipStatusSchema,
  thumbnailUrl: z.string().nullable(),
  streamUrl: z.string().nullable(),
  durationSec: z.number().nullable(),
  sizeBytes: z.number().nullable(),
})
export type Clip = z.infer<typeof clipSchema>

export const replayEventSchema = z.object({
  id: z.string(),
  clubId: z.string(),
  clubName: z.string(),
  courtId: z.string(),
  courtName: z.string(),
  pressedAt: z.string(),
  startedAt: z.string(),
  durationSec: z.number(),
  buttonOffsetSec: z.number(),
  expiresAt: z.string(),
  clips: z.array(clipSchema),
})
export type ReplayEvent = z.infer<typeof replayEventSchema>

// §0 — every error response.
export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
})
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>

// §2.1 GET /config
export const configSchema = z.object({
  retentionHours: z.number(),
  whatsappNumber: z.string().nullable(),
  instagramHandle: z.string().nullable(),
  consentVersion: z.string(),
  privacyPolicyUrl: z.string(),
  supportEmail: z.string().nullable(),
})
export type Config = z.infer<typeof configSchema>

// §2.2 GET /clubs
export const clubsResponseSchema = z.object({ items: z.array(clubSchema) })

// §2.3 GET /clubs/{clubId}/courts
export const courtsResponseSchema = z.object({ items: z.array(courtSchema) })

// §2.4 GET /replays
export const replaysResponseSchema = z.object({
  items: z.array(replayEventSchema),
  nextCursor: z.string().nullable(),
})

// §2.5 GET /replays/availability
export const availabilityResponseSchema = z.object({
  date: z.string(),
  hours: z.array(z.object({ hour: z.number(), count: z.number() })),
  total: z.number(),
})
export type Availability = z.infer<typeof availabilityResponseSchema>

// §2.6 GET /replays/{eventId}
export const replayDetailResponseSchema = z.object({
  event: replayEventSchema,
  prevEventId: z.string().nullable(),
  nextEventId: z.string().nullable(),
})

// §2.7 POST /downloads
export const createDownloadRequestSchema = z.object({
  clipIds: z.array(z.string()).min(1),
  email: z.email(),
  name: z.string().optional(),
  consent: z.boolean(),
  consentVersion: z.string(),
})
export type CreateDownloadInput = z.infer<typeof createDownloadRequestSchema>

export const createDownloadResponseSchema = z.object({
  downloads: z.array(
    z.object({
      clipId: z.string(),
      url: z.string(),
      fileName: z.string(),
      expiresAt: z.string(),
    }),
  ),
})

// Query param shapes — not response bodies, so plain types rather than zod schemas.
export type ReplaysParams = {
  clubId?: string
  courtId?: string
  date?: string
  hour?: number
  limit?: number
}

export type AvailabilityParams = {
  clubId: string
  courtId?: string
  date: string
}

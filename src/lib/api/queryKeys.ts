import type { AvailabilityParams, ReplaysParams } from './types'

export const queryKeys = {
  config: ['config'] as const,
  clubs: ['clubs'] as const,
  courts: (clubId: string) => ['clubs', clubId, 'courts'] as const,
  replays: (params: ReplaysParams) => ['replays', params] as const,
  availability: (params: AvailabilityParams) =>
    ['replays', 'availability', params] as const,
  replay: (eventId: string) => ['replays', eventId] as const,
}

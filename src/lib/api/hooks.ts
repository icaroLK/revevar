import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest } from './client'
import { queryKeys } from './queryKeys'
import {
  availabilityResponseSchema,
  clubsResponseSchema,
  configSchema,
  courtsResponseSchema,
  createDownloadRequestSchema,
  createDownloadResponseSchema,
  replayDetailResponseSchema,
  replaysResponseSchema,
  type AvailabilityParams,
  type CreateDownloadInput,
  type ReplaysParams,
} from './types'

export type { AvailabilityParams, ReplaysParams, CreateDownloadInput }

function toQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export function useConfig() {
  return useQuery({
    queryKey: queryKeys.config,
    queryFn: () => apiRequest('/config', configSchema),
    staleTime: Infinity,
  })
}

export function useClubs() {
  return useQuery({
    queryKey: queryKeys.clubs,
    queryFn: () => apiRequest('/clubs', clubsResponseSchema),
  })
}

export function useCourts(clubId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.courts(clubId ?? ''),
    queryFn: () => apiRequest(`/clubs/${clubId}/courts`, courtsResponseSchema),
    enabled: Boolean(clubId),
  })
}

export function useReplays(
  params: ReplaysParams,
  options?: { refetchInterval?: number },
) {
  return useInfiniteQuery({
    queryKey: queryKeys.replays(params),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      apiRequest(
        `/replays${toQueryString({ ...params, cursor: pageParam })}`,
        replaysResponseSchema,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: options?.refetchInterval,
  })
}

export function useAvailability(
  params: AvailabilityParams,
  options?: { refetchInterval?: number; enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.availability(params),
    queryFn: () =>
      apiRequest(
        `/replays/availability${toQueryString(params)}`,
        availabilityResponseSchema,
      ),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  })
}

export function useReplay(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.replay(eventId ?? ''),
    queryFn: () =>
      apiRequest(`/replays/${eventId}`, replayDetailResponseSchema),
    enabled: Boolean(eventId),
  })
}

export function useCreateDownload() {
  return useMutation({
    mutationFn: (input: CreateDownloadInput) => {
      const body = createDownloadRequestSchema.parse(input)
      return apiRequest('/downloads', createDownloadResponseSchema, {
        method: 'POST',
        body,
      })
    },
  })
}

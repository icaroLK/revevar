import type { z } from 'zod'
import { apiErrorBodySchema } from './types'
import { ApiError } from './errors'

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers:
        options.body !== undefined
          ? { 'Content-Type': 'application/json' }
          : undefined,
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Não foi possível conectar ao servidor.',
    )
  }

  if (!response.ok) {
    throw await toApiError(response)
  }

  const json: unknown = await response.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Resposta inesperada do servidor.',
      {
        issues: parsed.error.issues,
      },
    )
  }
  return parsed.data
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const json: unknown = await response.json()
    const parsed = apiErrorBodySchema.safeParse(json)
    if (parsed.success) {
      return new ApiError(
        response.status,
        parsed.data.error.code,
        parsed.data.error.message,
        parsed.data.error.details,
      )
    }
  } catch {
    // body wasn't JSON — fall through to the generic error below
  }
  return new ApiError(
    response.status,
    'UNKNOWN_ERROR',
    'Ocorreu um erro inesperado.',
  )
}

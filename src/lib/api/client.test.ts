import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { apiRequest } from './client'

const schema = z.object({ hello: z.string() })

function mockFetchOnce(response: Response) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('apiRequest', () => {
  it('returns parsed data on success', async () => {
    mockFetchOnce(
      new Response(JSON.stringify({ hello: 'world' }), { status: 200 }),
    )

    await expect(apiRequest('/hello', schema)).resolves.toEqual({
      hello: 'world',
    })
  })

  it('throws an ApiError with the server code/message on a non-2xx response', async () => {
    mockFetchOnce(
      new Response(
        JSON.stringify({
          error: { code: 'NOT_FOUND', message: 'Replay não encontrado.' },
        }),
        {
          status: 404,
        },
      ),
    )

    await expect(apiRequest('/hello', schema)).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Replay não encontrado.',
    })
  })

  it('falls back to UNKNOWN_ERROR when the error body does not match the contract', async () => {
    mockFetchOnce(new Response('not json', { status: 500 }))

    await expect(apiRequest('/hello', schema)).rejects.toMatchObject({
      status: 500,
      code: 'UNKNOWN_ERROR',
    })
  })

  it('throws INVALID_RESPONSE when a 2xx body fails schema validation', async () => {
    mockFetchOnce(
      new Response(JSON.stringify({ unexpected: true }), { status: 200 }),
    )

    await expect(apiRequest('/hello', schema)).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    })
  })

  it('throws NETWORK_ERROR when fetch itself rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('offline'))

    await expect(apiRequest('/hello', schema)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    })
  })
})

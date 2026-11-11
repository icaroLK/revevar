import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../lib/api/errors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx (404, 410, validation...) won't succeed by retrying — only
      // worth retrying network failures and 5xx. Without this, a query that
      // can never succeed (e.g. an expired/missing replay) sits retrying for
      // several seconds before its error state ever shows.
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

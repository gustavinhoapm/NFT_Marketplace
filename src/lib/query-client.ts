import { QueryClient } from '@tanstack/react-query'

/**
 * Retry policy (documented in ARCHITECTURE.md):
 * - never retry 4xx: they are deterministic client errors.
 * - retry 5xx / network failures twice with exponential backoff.
 * - mutations never retry automatically; order creation is idempotent by key
 *   and a silent retry would hide the pending state from the user.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = getHttpStatus(error)
        if (status && status >= 400 && status < 500) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})

function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const candidate = error as { status?: unknown; response?: { status?: unknown } }
  if (typeof candidate.status === 'number') return candidate.status
  if (typeof candidate.response?.status === 'number') {
    return candidate.response.status
  }
  return undefined
}

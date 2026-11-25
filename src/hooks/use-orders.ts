import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/api'
import { getSessionToken } from '@/lib/session'
import { cartQueryKey } from './use-catalog'

function orderKey(id: string) {
  return ['order', id, getSessionToken() ?? 'guest'] as const
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: id ? orderKey(id) : ['order', undefined],
    queryFn: () => api.orders.get(id as string),
    enabled: Boolean(id) && Boolean(getSessionToken()),
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' ? 1200 : false,
  })
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders', getSessionToken() ?? 'guest'],
    queryFn: () => api.orders.list(),
    enabled: Boolean(getSessionToken()),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      body,
      idempotencyKey,
    }: {
      body: Parameters<typeof api.orders.create>[0]
      idempotencyKey: string
    }) => api.orders.create(body, idempotencyKey),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cartQueryKey() })
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      await queryClient.invalidateQueries({ queryKey: ['nfts'] })
    },
  })
}

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/api'
import type { NftListQuery } from '@/contracts/nft'
import { useAuth } from './use-auth'
import { cacheScope, getSessionToken } from '@/lib/session'

export function cartQueryKey() {
  return ['cart', cacheScope()] as const
}

export function favoritesQueryKey() {
  return ['favorites', getSessionToken() ?? 'guest'] as const
}

export function useNfts(query: NftListQuery) {
  return useQuery({
    queryKey: ['nfts', query],
    queryFn: () => api.nfts.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useNft(id: string) {
  return useQuery({
    queryKey: ['nft', id],
    queryFn: () => api.nfts.get(id),
    enabled: Boolean(id),
  })
}

export function useFavorites() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: favoritesQueryKey(),
    queryFn: () => api.favorites.list(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nftId, favorite }: { nftId: string; favorite: boolean }) =>
      api.favorites.set(nftId, favorite),
    onMutate: async ({ nftId, favorite }) => {
      const key = favoritesQueryKey()
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<string[]>(key)
      queryClient.setQueryData<string[]>(key, (ids = []) =>
        favorite
          ? [...new Set([...ids, nftId])]
          : ids.filter((id) => id !== nftId),
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(favoritesQueryKey(), context?.previous)
    },
    onSuccess: (ids) => {
      queryClient.setQueryData(favoritesQueryKey(), ids)
      void queryClient.invalidateQueries({ queryKey: ['nfts'] })
    },
  })
}

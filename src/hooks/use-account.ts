import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/api'
import { getSessionToken } from '@/lib/session'
import { useAuth } from './use-auth'

function privateKey(resource: string) {
  return [resource, getSessionToken() ?? 'guest'] as const
}

export function useProfile() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: privateKey('profile'),
    queryFn: () => api.profile.get(),
    enabled: isAuthenticated,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.profile.update,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: privateKey('profile') })
      await queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: api.profile.changePassword })
}

export function useWallets() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: privateKey('wallets'),
    queryFn: () => api.wallets.list(),
    enabled: isAuthenticated,
  })
}

export function useCreateWallet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.wallets.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: privateKey('wallets') }),
  })
}

export function useUpdateWallet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: {
      id: string
      body: Parameters<typeof api.wallets.update>[1]
    }) => api.wallets.update(variables.id, variables.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: privateKey('wallets') }),
  })
}

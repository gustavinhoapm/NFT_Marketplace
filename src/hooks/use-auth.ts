import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/api'
import { clearSessionToken, getSessionToken, setSessionToken } from '@/lib/session'

export function useSession() {
  const token = getSessionToken()
  return useQuery({
    queryKey: ['session', token],
    queryFn: () => api.auth.me(),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  })
}

export function useAuth() {
  const { data, isLoading } = useSession()
  return {
    session: data,
    user: data?.user,
    isAuthenticated: Boolean(data),
    isLoading,
  }
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.auth.login,
    onSuccess: async ({ session }) => {
      setSessionToken(session.token)
      await queryClient.invalidateQueries()
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.auth.register,
    onSuccess: async ({ session }) => {
      setSessionToken(session.token)
      await queryClient.invalidateQueries()
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.auth.logout,
    onSuccess: async () => {
      clearSessionToken()
      queryClient.removeQueries({
        predicate: (query) =>
          ['session', 'favorites', 'cart', 'orders', 'order', 'profile', 'wallets'].includes(
            String(query.queryKey[0]),
          ),
      })
      await queryClient.invalidateQueries({ queryKey: ['nfts'] })
    },
  })
}

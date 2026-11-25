import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/api'
import { clearSessionToken, getSessionToken, setSessionToken } from '@/lib/session'
import { disconnectSocket } from '@/lib/socket'

/**
 * Chave constante: todos os componentes observam a MESMA query de sessão.
 * Assim `setQueryData(['session'], undefined)` no logout notifica cada
 * observer imediatamente (chaves derivadas do token deixariam observers
 * órfãos segurando o último resultado).
 */
export const sessionQueryKey = ['session'] as const

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => api.auth.me(),
    enabled: Boolean(getSessionToken()),
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

const PRIVATE_RESOURCES = ['session', 'favorites', 'cart', 'orders', 'order', 'profile', 'wallets']

function isPrivateQuery(query: { queryKey: readonly unknown[] }): boolean {
  return PRIVATE_RESOURCES.includes(String(query.queryKey[0]))
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.auth.logout,
    onSuccess: async () => {
      /**
       * Zera os dados ANTES de remover: `removeQueries()` não notifica os
       * observers montados, que segurariam o último resultado (ex.: o nome do
       * usuário no header) até um re-render não relacionado.
       */
      queryClient.setQueriesData({ predicate: isPrivateQuery }, () => undefined)
      clearSessionToken()
      disconnectSocket()
      queryClient.removeQueries({ predicate: isPrivateQuery })
      /**
       * Redirect de página após logout: garante que nenhum observer montado
       * retenha dados da sessão anterior (header, carrinho, favoritos) e que a
       * subscription do socket seja recriada do zero.
       */
      window.location.assign('/')
    },
  })
}

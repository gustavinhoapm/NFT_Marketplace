import axios from 'axios'

import type { ApiErrorBody } from '@/contracts/common'
import { ApiError } from '@/lib/api-error'
import { getGuestId, getSessionToken } from '@/lib/session'

export const http = axios.create({
  baseURL: '/api',
  timeout: 9000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getSessionToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  config.headers.set('X-Guest-Id', getGuestId())
  return config
})

http.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data
    const timedOut = error.code === 'ECONNABORTED'
    throw new ApiError(
      body?.code ?? (timedOut ? 'timeout' : 'network_error'),
      body?.message ??
        (timedOut
          ? 'O servidor demorou para responder. Tente novamente.'
          : 'Não foi possível conectar. Verifique sua conexão.'),
      body?.fieldErrors,
      error.response?.status ?? 0,
    )
  }
  throw error
})

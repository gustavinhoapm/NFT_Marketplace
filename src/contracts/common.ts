/**
 * Contratos compartilhados por transporte (Axios), estado (TanStack Query) e UI.
 * Nenhum destes tipos conhece MSW: os mocks implementam exatamente estes shapes.
 */

export type Network = 'ethereum' | 'polygon' | 'solana'

/**
 * Erros de domínio. O servidor simulado sempre responde neste formato, e o
 * cliente Axios normaliza qualquer falha para `ApiError` antes de chegar na UI.
 */
export type ApiErrorCode =
  | 'validation_error'
  | 'invalid_credentials'
  | 'session_expired'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'insufficient_stock'
  | 'invalid_coupon'
  | 'expired_coupon'
  | 'price_changed'
  | 'quote_stale'
  | 'idempotency_conflict'
  | 'payment_declined'
  | 'network_error'
  | 'timeout'
  | 'server_error'

export interface ApiErrorBody {
  code: ApiErrorCode
  message: string
  /** Erros por campo, no formato que o formulário consome direto. */
  fieldErrors?: Record<string, string>
  details?: Record<string, unknown>
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** Valores monetários em ETH viajam sempre como string decimal. */
export type EthAmount = string

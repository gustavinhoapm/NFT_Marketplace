import type { EthAmount, Network } from './common'

export const REALTIME_EVENTS = {
  nftUpdated: 'nft.updated',
  orderUpdated: 'order.updated',
} as const

export type RealtimeEventName =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS]

/**
 * Envelope de todo evento. `id` permite descartar duplicatas e `version`
 * impede que um evento antigo sobrescreva um estado mais novo (requisitos W7-W9).
 */
export interface RealtimeEnvelope<TName extends RealtimeEventName, TPayload> {
  id: string
  event: TName
  /** Versão monotônica por `resourceKey`. */
  version: number
  emittedAt: string
  /** Identidade estável do recurso, ex.: `nft:emerald-ape-042`. */
  resourceKey: string
  payload: TPayload
}

export type NftUpdateReason =
  | 'price-changed'
  | 'edition-sold-out'
  | 'stock-changed'

export interface NftUpdatedPayload {
  nftId: string
  editionId: string
  editionLabel: string
  priceEth: EthAmount
  available: number
  reason: NftUpdateReason
}

export interface OrderUpdatedPayload {
  orderId: string
  status: 'pending' | 'confirmed' | 'declined'
  transactionHash: string | null
  explorerUrl: string | null
  failureReason: string | null
  network: Network
}

export type NftUpdatedEvent = RealtimeEnvelope<
  typeof REALTIME_EVENTS.nftUpdated,
  NftUpdatedPayload
>

export type OrderUpdatedEvent = RealtimeEnvelope<
  typeof REALTIME_EVENTS.orderUpdated,
  OrderUpdatedPayload
>

/** Mapa usado para tipar `socket.on(...)` no cliente. */
export interface RealtimeEventMap {
  [REALTIME_EVENTS.nftUpdated]: NftUpdatedEvent
  [REALTIME_EVENTS.orderUpdated]: OrderUpdatedEvent
}

/**
 * Eventos emitidos pelo cliente. Como o binding não suporta acknowledgements,
 * toda confirmação de entrega vem por evento do servidor.
 */
export interface ClientToServerEventMap {
  'cart.replace': { items: Array<{ nftId: string; editionId: string }> }
}

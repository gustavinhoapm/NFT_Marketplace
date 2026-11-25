import type { OrderStatus } from '@/contracts/order'
import type { NftUpdatedPayload } from '@/contracts/realtime'

import { queryClient } from '@/lib/query-client'

import { worker } from './browser'
import { db, getConfig, setConfig, type MockConfig, type RealtimeEvent } from './db'

export interface KurioDevtools {
  /** Restaura catálogo, usuários, carrinhos e pedidos ao estado inicial. */
  reset(): void
  /** Lê ou altera os cenários de rede/negócio. */
  config(patch?: Partial<MockConfig>): MockConfig
  /** Muda preço/estoque no servidor, refletindo em REST e no socket. */
  patchEdition(
    nftId: string,
    editionId: string,
    patch: { priceEth?: string; available?: number },
    reason?: NftUpdatedPayload['reason'],
  ): NftUpdatedPayload
  /** Força a transição de um pedido (testes de reconexão/versão). */
  forceOrderStatus(orderId: string, status: OrderStatus): boolean
  /** Eventosemitidos pelo servidor, para asserts de E2E. */
  events(): RealtimeEvent[]
  /** Handlers registrados no worker (diagnóstico de MSW). */
  handlers(): Array<{ kind: string; header: string }>
  /** Snapshot do cache do TanStack Query (diagnóstico de isolamento/chaves). */
  cache(): Array<{ key: unknown; status: string; hasData: boolean }>
}

declare global {
  interface Window {
    __KURIO__?: KurioDevtools
  }
}

const emitted: RealtimeEvent[] = []

export function trackEvent(event: RealtimeEvent): void {
  emitted.push(event)
  if (emitted.length > 100) emitted.shift()
}

export function installDevtools(): void {
  window.__KURIO__ = {
    reset: () => {
      db.reset()
      emitted.length = 0
    },
    config: (patch) => (patch ? setConfig(patch) : getConfig()),
    patchEdition: (nftId, editionId, patch, reason) =>
      db.patchEdition(nftId, editionId, patch, reason ?? 'price-changed'),
    forceOrderStatus: (orderId, status) => {
      const userId = db.orderOwnerId(orderId)
      if (!userId) return false
      db.forceOrderStatus(userId, orderId, status)
      return true
    },
    events: () => [...emitted],
    handlers: () =>
      worker.listHandlers().map((handler) =>
        'info' in handler
          ? { kind: 'http', header: String(handler.info.header) }
          : { kind: 'websocket', header: handler.constructor.name },
      ),
    cache: () =>
      queryClient.getQueryCache().getAll().map((query) => ({
        key: query.queryKey,
        status: query.state.status,
        hasData: query.state.data !== undefined,
      })),
  }
}

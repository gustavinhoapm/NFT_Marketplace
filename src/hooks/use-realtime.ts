import { useQueryClient } from '@tanstack/react-query'
import {
  REALTIME_EVENTS,
  type NftUpdatedEvent,
  type OrderUpdatedEvent,
  type RealtimeEnvelope,
  type RealtimeEventName,
} from '@/contracts/realtime'
import { toast } from 'sonner'
import { useEffect } from 'react'

import { getSocket } from '@/lib/socket'
import { getSessionToken } from '@/lib/session'

const seenIds = new Set<string>()
const versions = new Map<string, number>()

/** Descarta duplicatas e eventos antigos antes de tocar no cache (W6-W8). */
function shouldApply(event: RealtimeEnvelope<RealtimeEventName, unknown>): boolean {
  if (seenIds.has(event.id)) return false
  seenIds.add(event.id)
  const current = versions.get(event.resourceKey) ?? 0
  if (event.version <= current) return false
  versions.set(event.resourceKey, event.version)
  return true
}

export function useRealtime(): void {
  const queryClient = useQueryClient()
  const token = getSessionToken()

  useEffect(() => {
    const socket = getSocket()

    const onNft = (event: NftUpdatedEvent) => {
      if (!shouldApply(event)) return
      void queryClient.invalidateQueries({ queryKey: ['nfts'] })
      void queryClient.invalidateQueries({ queryKey: ['nft', event.payload.nftId] })
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
    }

    const onOrder = (event: OrderUpdatedEvent) => {
      if (!shouldApply(event)) return
      void queryClient.invalidateQueries({
        queryKey: ['order', event.payload.orderId],
      })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      if (event.payload.status === 'confirmed') {
        toast.success('Pagamento confirmado na blockchain simulada.')
      } else if (event.payload.status === 'declined') {
        toast.error(event.payload.failureReason ?? 'Pagamento recusado.')
      }
    }

    /**
     * Reconciliação pós-reconexão (W9): eventos perdidos enquanto o socket
     * esteve fora são compensados recarregando os recursos ativos via REST.
     */
    const onConnect = () => {
      void queryClient.invalidateQueries({ queryKey: ['nfts'] })
      void queryClient.invalidateQueries({ queryKey: ['nft'] })
      void queryClient.invalidateQueries({ queryKey: ['order'] })
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
    }

    socket.on(REALTIME_EVENTS.nftUpdated, onNft)
    socket.on(REALTIME_EVENTS.orderUpdated, onOrder)
    socket.on('connect', onConnect)

    return () => {
      socket.off(REALTIME_EVENTS.nftUpdated, onNft)
      socket.off(REALTIME_EVENTS.orderUpdated, onOrder)
      socket.off('connect', onConnect)
    }
  }, [queryClient, token])
}

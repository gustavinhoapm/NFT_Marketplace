import type { CartTotals } from './cart'
import type { EthAmount, Network } from './common'

export const ORDER_STATUSES = ['pending', 'confirmed', 'declined'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Processando',
  confirmed: 'Confirmado',
  declined: 'Recusado',
}

/** Snapshot imutável: mudanças posteriores no catálogo não afetam o recibo. */
export interface OrderItemSnapshot {
  nftId: string
  editionId: string
  name: string
  imageUrl: string
  editionLabel: string
  quantity: number
  unitPriceEth: EthAmount
  lineTotalEth: EthAmount
}

export interface Order {
  id: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
  transactionHash: string | null
  explorerUrl: string | null
  walletLabel: string
  walletAddress: string
  network: Network
  couponCode: string | null
  items: OrderItemSnapshot[]
  totals: CartTotals
  failureReason: string | null
  /** Incrementa a cada transição; o cliente ignora versões anteriores. */
  version: number
}

export const WALLET_TYPES = ['metamask', 'walletconnect', 'coinbase'] as const

export type WalletType = (typeof WALLET_TYPES)[number]

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  metamask: 'MetaMask',
  walletconnect: 'WalletConnect',
  coinbase: 'Coinbase Wallet',
}

/** Dados do colecionador no checkout (formulário do layout desktop). */
export interface CollectorDetails {
  displayName: string
  username: string
  profileName: string
  email: string
  ensName: string
  walletAddress: string
  walletType: WalletType
  referralCode: string
  note?: string
}

export interface CreateOrderItem {
  nftId: string
  editionId: string
  quantity: number
}

export interface CreateOrderRequest {
  quoteId: string
  walletId: string
  network: Network
  couponCode: string | null
  collector: CollectorDetails
  items: CreateOrderItem[]
}

/**
 * Resposta da criação do pedido.
 * `idempotentReplay` indica que a chave já existia e o mesmo pedido foi
 * devolvido em vez de criar outro.
 */
export interface CreateOrderResponse {
  order: Order
  idempotentReplay: boolean
}

import type { EthAmount } from './common'

/** Cupom aplicado a uma cotação. */
export interface Coupon {
  code: string
  percentOff: number
}

/**
 * Totais sempre calculados pelo servidor simulado. O cliente apenas exibe.
 * Os testes de carrinho dependem disso.
 */
export interface CartTotals {
  subtotalEth: EthAmount
  discountEth: EthAmount
  networkFeeEth: EthAmount
  totalEth: EthAmount
}

export interface CartItem {
  id: string
  nftId: string
  /** Token exibível ("#0042"), como no frame do carrinho. */
  tokenId: string
  editionId: string
  name: string
  imageUrl: string
  editionLabel: string
  quantity: number
  unitPriceEth: EthAmount
  lineTotalEth: EthAmount
  /** Estoque máximo da edição, no momento da cotação. */
  available: number
  updatedAt: string
}

/**
 * Cotação: a referência para finalizar o pedido.
 * `quoteId` + `quotedAt` permitem que o checkout detecte cotação desatualizada.
 */
export interface Cart {
  items: CartItem[]
  coupon: Coupon | null
  totals: CartTotals
  quoteId: string
  quotedAt: string
  /** Preço/estoque mudaram depois desta cotação. */
  stale: boolean
}

export interface AddCartItemRequest {
  nftId: string
  editionId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface ApplyCouponRequest {
  code: string
}

export interface CartItemInput {
  nftId: string
  editionId: string
  quantity: number
}

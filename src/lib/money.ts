import Decimal from 'decimal.js'

import type { EthAmount } from '@/contracts/common'

/**
 * Valores em ETH trafegam como string decimal, nunca como number.
 * Nunca usar `number` para dinheiro: 0.1 + 0.2 !== 0.3 em ponto flutuante, e o
 * total do pedido precisa fechar centavo por centavo com a resposta da API.
 *
 * Precisão alta o bastante para 18 casas decimais de wei.
 */
Decimal.set({ precision: 60, rounding: Decimal.ROUND_HALF_UP })

export function toDecimal(value: EthAmount | number): Decimal {
  return new Decimal(value)
}

export function addEth(...values: EthAmount[]): EthAmount {
  return values.reduce((acc, value) => acc.plus(value), new Decimal(0)).toFixed()
}

export function multiplyEth(unitPrice: EthAmount, quantity: number): EthAmount {
  if (!Number.isInteger(quantity)) {
    throw new Error(`Quantidade deve ser inteira, recebido: ${quantity}`)
  }
  return new Decimal(unitPrice).times(quantity).toFixed()
}

export function subtractEth(a: EthAmount, b: EthAmount): EthAmount {
  return new Decimal(a).minus(b).toFixed()
}

export function compareEth(a: EthAmount, b: EthAmount): number {
  return new Decimal(a).comparedTo(b)
}

export function isPositiveEth(value: EthAmount): boolean {
  return new Decimal(value).greaterThan(0)
}

/** Formata para exibição em pt-BR com vírgula decimal. Nunca perde precisão. */
export function formatEth(value: EthAmount, fractionDigits = 3): string {
  const decimal = new Decimal(value)
  return decimal.toFixed(fractionDigits).replace('.', ',')
}

export function formatEthWithSymbol(value: EthAmount, fractionDigits = 3) {
  return `${formatEth(value, fractionDigits)} ETH`
}

/** Remove zeros à direita sem perder casas significativas. */
export function trimEth(value: EthAmount): string {
  return new Decimal(value).toFixed().replace(/\.?0+$/, '')
}

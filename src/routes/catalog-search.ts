import { NFT_SORTS, type CollectionId, type NftRarity, type NftSort } from '@/contracts/nft'
import type { Network } from '@/contracts/common'

export interface CatalogSearch {
  q?: string
  collections?: string
  networks?: string
  rarity?: string
  min?: string
  max?: string
  sort?: NftSort
  page?: number
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined
}

export function validateCatalogSearch(raw: Record<string, unknown>): CatalogSearch {
  const sort = str(raw.sort)
  return {
    q: str(raw.q),
    collections: str(raw.collections),
    networks: str(raw.networks),
    rarity: str(raw.rarity),
    min: str(raw.min),
    max: str(raw.max),
    sort: sort && NFT_SORTS.includes(sort as NftSort) ? (sort as NftSort) : undefined,
    page: typeof raw.page === 'number' && raw.page > 0 ? raw.page : undefined,
  }
}

export function csv<T extends string>(value: string | undefined): T[] {
  return value ? (value.split(',').filter(Boolean) as T[]) : []
}

export type ParsedCatalogSearch = {
  collections: CollectionId[]
  networks: Network[]
  rarity: NftRarity[]
  sort: NftSort
  page: number
}

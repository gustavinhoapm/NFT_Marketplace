import {
  NFT_SEGMENTS,
  NFT_SORTS,
  type CollectionId,
  type NftRarity,
  type NftSegment,
  type NftSort,
} from '@/contracts/nft'
import type { Network } from '@/contracts/common'

/** Estado de busca do catálogo — vira query string e sobrevive a refresh. */
export interface CatalogSearch {
  q?: string
  collections?: string
  networks?: string
  rarity?: string
  min?: string
  max?: string
  tab?: NftSegment
  sort?: NftSort
  fav?: '1'
  page?: number
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined
}

export function validateCatalogSearch(raw: Record<string, unknown>): CatalogSearch {
  const sort = str(raw.sort)
  const tab = str(raw.tab)
  return {
    q: str(raw.q),
    collections: str(raw.collections),
    networks: str(raw.networks),
    rarity: str(raw.rarity),
    min: str(raw.min),
    max: str(raw.max),
    tab: tab && NFT_SEGMENTS.includes(tab as NftSegment) ? (tab as NftSegment) : undefined,
    sort: sort && NFT_SORTS.includes(sort as NftSort) ? (sort as NftSort) : undefined,
    // O parser de search do Router JSON-parseia valores ("1" vira 1).
    fav: raw.fav === 1 || raw.fav === '1' || raw.fav === true ? '1' : undefined,
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
  segment: NftSegment
  sort: NftSort
  page: number
}

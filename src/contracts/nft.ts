import type { EthAmount, Network } from './common'

export const COLLECTIONS = [
  'arte-digital',
  'fotografia',
  'musica',
  'arte-3d',
  'colecionaveis',
  'generativa',
  'jogos',
  'assinaturas',
  'utilidade',
] as const

export type CollectionId = (typeof COLLECTIONS)[number]

export const COLLECTION_LABELS: Record<CollectionId, string> = {
  'arte-digital': 'Arte digital',
  fotografia: 'Fotografia',
  musica: 'Música',
  'arte-3d': 'Arte 3D',
  colecionaveis: 'Colecionáveis',
  generativa: 'Generativa',
  jogos: 'Jogos',
  assinaturas: 'Assinaturas',
  utilidade: 'Utilidade',
}

export type NftRarity = 'comum' | 'raro' | 'epico' | 'lendario'

export const RARITY_LABELS: Record<NftRarity, string> = {
  comum: 'Comum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
}

export const NFT_SORTS = ['recent', 'price-asc', 'price-desc', 'popular'] as const

export type NftSort = (typeof NFT_SORTS)[number]

export const NFT_SORT_LABELS: Record<NftSort, string> = {
  recent: 'Listados recentemente',
  'price-asc': 'Menor preço',
  'price-desc': 'Maior preço',
  popular: 'Mais populares',
}

export interface NftEdition {
  id: string
  /** Rótulo exibido no seletor de edição, ex.: "1/50". */
  label: string
  supply: number
  /** Unidades ainda disponíveis. 0 = edição esgotada. */
  available: number
  priceEth: EthAmount
}

export interface Nft {
  id: string
  tokenId: string
  name: string
  collectionId: CollectionId
  collectionName: string
  network: Network
  imageUrl: string
  rarity: NftRarity
  attributes: string[]
  description: string
  creatorName: string
  royaltyPercent: string
  contractAddress: string
  rating: { average: number; count: number }
  editions: NftEdition[]
  createdAt: string
}

/** Item de listagem: subconjunto enxuto para o grid do catálogo. */
export interface NftListItem {
  id: string
  tokenId: string
  name: string
  collectionId: CollectionId
  network: Network
  imageUrl: string
  rarity: NftRarity
  rating: { average: number; count: number }
  /** Menor preço entre as edições disponíveis. */
  priceEth: EthAmount
  /** Preço anterior, quando houve redução. */
  compareAtPriceEth: EthAmount | null
  availableEditions: number
  isFavorite: boolean
  createdAt: string
}

export interface NftListQuery {
  search?: string
  collections?: CollectionId[]
  networks?: Network[]
  rarity?: NftRarity[]
  priceMin?: EthAmount
  priceMax?: EthAmount
  sort: NftSort
  page: number
  pageSize: number
}

/** Facetas devolvidas junto da listagem para montar os filtros com contagem. */
export interface NftFacets {
  collections: Array<{ id: CollectionId; label: string; count: number }>
  networks: Array<{ id: Network; count: number }>
  priceRange: { minEth: EthAmount; maxEth: EthAmount }
}

export interface NftListResponse {
  items: NftListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  facets: NftFacets
  /** Preço máximo observado no filtro atual, usado pelo slider. */
  appliedPriceRange: { minEth: EthAmount; maxEth: EthAmount }
}

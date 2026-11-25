import type { CollectionId, Nft, NftRarity } from '@/contracts/nft'
import type { Network } from '@/contracts/common'

import { mulberry32 } from '../random'

/**
 * Arte dos NFTs. Os arquivos são recortados das telas do Figma (ver
 * docs/ASSETS.md). Enquanto o recorte não roda, `onError` do componente cai no
 * fundo creme, então nada quebra.
 */
export const ART_KEYS = [
  'emerald',
  'sage',
  'neon',
  'cosmic',
  'violet',
  'ivory',
  'golden-beat',
  'golden-signal',
  'golden-frequency',
  'onyx',
] as const

export type ArtKey = (typeof ART_KEYS)[number]

export const ART_ATTRIBUTES: Record<ArtKey, string[]> = {
  emerald: ['Óculos', 'Esmeralda', 'Raro'],
  sage: ['Bucket hat', 'Moletom', 'Comum'],
  neon: ['Óculos', 'Colete', 'Raro'],
  cosmic: ['Bucket hat', 'Moletom', 'Épico'],
  violet: ['Óculos', 'Moletom', 'Comum'],
  ivory: ['Terno', 'Gola alta', 'Épico'],
  'golden-beat': ['Fones', 'Moletom', 'Comum'],
  'golden-signal': ['Fones', 'Neon', 'Comum'],
  'golden-frequency': ['Fones', 'Bucket hat', 'Raro'],
  onyx: ['Terno', 'Ônix', 'Lendário'],
}

type Row = readonly [
  name: string,
  art: ArtKey,
  collection: CollectionId,
  network: Network,
  rarity: NftRarity,
  price: string,
  compareAt: string | null,
]

/**
 * 32 NFTs: suficiente para exercitar filtros combinados e 4 páginas de 9 itens.
 * Preços cobrem a faixa do Figma (0,02 a 12,30 ETH).
 */
const ROWS: readonly Row[] = [
  ['Emerald Ape #042', 'emerald', 'arte-digital', 'ethereum', 'raro', '1.19', null],
  ['Sage Nomad #009', 'sage', 'colecionaveis', 'polygon', 'comum', '1.69', null],
  ['Neon Vessel #552', 'neon', 'arte-digital', 'ethereum', 'raro', '1.99', '2.29'],
  ['Cosmic Bloom #118', 'cosmic', 'generativa', 'ethereum', 'epico', '1.29', null],
  ['Violet Nomad #314', 'violet', 'arte-digital', 'polygon', 'comum', '1.39', null],
  ['Ivory Baron #088', 'ivory', 'arte-digital', 'ethereum', 'epico', '1.79', null],
  ['Golden Beat #207', 'golden-beat', 'musica', 'ethereum', 'comum', '0.99', null],
  ['Golden Signal #168', 'golden-signal', 'musica', 'solana', 'comum', '0.39', null],
  ['Golden Frequency #071', 'golden-frequency', 'musica', 'solana', 'raro', '0.59', null],
  ['Onyx Baron #001', 'onyx', 'arte-digital', 'ethereum', 'lendario', '12.30', null],
  ['Emerald Ape #043', 'emerald', 'arte-digital', 'ethereum', 'raro', '1.25', null],
  ['Sage Nomad #010', 'sage', 'colecionaveis', 'polygon', 'comum', '1.49', null],
  ['Neon Vessel #553', 'neon', 'arte-3d', 'ethereum', 'raro', '2.59', null],
  ['Cosmic Bloom #119', 'cosmic', 'generativa', 'polygon', 'epico', '1.69', null],
  ['Violet Nomad #315', 'violet', 'fotografia', 'ethereum', 'comum', '1.19', null],
  ['Ivory Baron #089', 'ivory', 'fotografia', 'ethereum', 'epico', '2.29', '2.59'],
  ['Golden Beat #208', 'golden-beat', 'musica', 'ethereum', 'comum', '0.79', null],
  ['Golden Signal #169', 'golden-signal', 'musica', 'solana', 'comum', '0.25', null],
  ['Golden Frequency #072', 'golden-frequency', 'musica', 'solana', 'raro', '0.89', null],
  ['Onyx Baron #002', 'onyx', 'arte-digital', 'ethereum', 'lendario', '10.40', null],
  ['Emerald Ape #044', 'emerald', 'jogos', 'polygon', 'comum', '0.99', null],
  ['Sage Nomad #011', 'sage', 'jogos', 'polygon', 'comum', '0.89', null],
  ['Neon Vessel #554', 'neon', 'assinaturas', 'ethereum', 'raro', '3.40', null],
  ['Cosmic Bloom #120', 'cosmic', 'generativa', 'ethereum', 'epico', '2.99', null],
  ['Violet Nomad #316', 'violet', 'utilidade', 'solana', 'comum', '0.15', null],
  ['Ivory Baron #090', 'ivory', 'arte-3d', 'ethereum', 'epico', '4.20', null],
  ['Golden Beat #209', 'golden-beat', 'musica', 'ethereum', 'comum', '0.02', null],
  ['Golden Signal #170', 'golden-signal', 'musica', 'solana', 'comum', '0.08', null],
  ['Golden Frequency #073', 'golden-frequency', 'musica', 'solana', 'raro', '5.20', null],
  ['Onyx Baron #003', 'onyx', 'arte-digital', 'ethereum', 'lendario', '8.90', '9.60'],
  ['Sage Nomad #012', 'sage', 'colecionaveis', 'polygon', 'comum', '1.49', null],
  ['Violet Nomad #317', 'violet', 'assinaturas', 'ethereum', 'raro', '6.90', null],
]

const CREATORS = ['Nova Sato', 'Kurio Studio', 'Iris Delgado', 'Tomás Rei']
const COLLECTION_NAMES: Record<CollectionId, string> = {
  'arte-digital': 'Kurio Editions',
  fotografia: 'Kurio Frames',
  musica: 'Kurio Sound',
  'arte-3d': 'Kurio Volumes',
  colecionaveis: 'Kurio Apes',
  generativa: 'Kurio Flux',
  jogos: 'Kurio Play',
  assinaturas: 'Kurio Pass',
  utilidade: 'Kurio Tools',
}

function contractFor(index: number) {
  const hex = (index * 0x9e3779b1).toString(16).slice(0, 6).toUpperCase()
  return `0x7A42${hex}F81B9E8`
}

export function createNftFixtures(): Nft[] {
  const random = mulberry32(20261125)
  const base = Date.UTC(2026, 9, 1, 12, 0, 0)

  return ROWS.map((row, index) => {
    const [name, art, collectionId, network, rarity, price, compareAt] = row
    const tokenNumber = 42 + index * 7
    const available1of1 = index === 6 ? 0 : 1
    const available1of10 = index % 5 === 0 ? 0 : 3 + (index % 4)
    const available1of50 = index % 7 === 0 ? 0 : 27 + (index % 12)

    const editions = [
      {
        id: 'ed-1-1',
        label: '1/1',
        supply: 1,
        available: available1of1,
        priceEth: price,
      },
      {
        id: 'ed-1-10',
        label: '1/10',
        supply: 10,
        available: available1of10,
        priceEth: price,
      },
      {
        id: 'ed-1-50',
        label: '1/50',
        supply: 50,
        available: available1of50,
        priceEth: price,
      },
    ]

    return {
      id: `nft_${String(index + 1).padStart(3, '0')}`,
      tokenId: `#${String(tokenNumber).padStart(4, '0')}`,
      name,
      collectionId,
      collectionName: COLLECTION_NAMES[collectionId],
      network,
      imageUrl: `/assets/nft/${art}.svg`,
      compareAtPriceEth: compareAt,
      rarity,
      attributes: ART_ATTRIBUTES[art],
      description:
        `Um colecionável digital 1/50 finalizado à mão da coleção ` +
        `${COLLECTION_NAMES[collectionId]}, verificado na rede ${networkLabel(network)}, ` +
        `com arte desbloqueável e acesso para colecionadores.`,
      creatorName: CREATORS[index % CREATORS.length] ?? 'Kurio Studio',
      royaltyPercent: '5',
      contractAddress: contractFor(index + 1),
      rating: {
        average: Number((4 + random() * 0.9).toFixed(1)),
        count: 5 + Math.floor(random() * 30),
      },
      editions,
      createdAt: new Date(base - index * 36 * 60 * 60 * 1000).toISOString(),
    }
  })
}

function networkLabel(network: Network) {
  return network === 'ethereum'
    ? 'Ethereum'
    : network === 'polygon'
      ? 'Polygon'
      : 'Solana'
}

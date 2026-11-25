import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'

import type { NftListItem } from '@/contracts/nft'
import { RARITY_LABELS } from '@/contracts/nft'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

/**
 * Card do catálogo no padrão do Figma: arte sobre fundo creme com moldura,
 * nome e preço (com preço anterior riscado em promoção). No mobile o frame
 * acrescenta o favorito no canto e o selo de raridade.
 */
export function NftCard({
  nft,
  onFavorite,
  favoritePending = false,
  mobileExtras = false,
}: {
  nft: NftListItem
  onFavorite?: (favorite: boolean) => void
  favoritePending?: boolean
  mobileExtras?: boolean
}) {
  return (
    <article className="group">
      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        className="relative block overflow-hidden rounded-md border border-line bg-surface p-2.5 transition-colors hover:border-accent-muted"
        aria-label={`Ver detalhes de ${nft.name}`}
      >
        <div className="relative overflow-hidden rounded-sm bg-cream">
          <img
            src={nft.imageUrl}
            alt={`Arte de ${nft.name}`}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {mobileExtras && (
            <span className="absolute top-2 left-2 rounded-sm bg-accent px-2 py-1 text-[9px] font-bold tracking-wider text-ink uppercase md:hidden">
              {RARITY_LABELS[nft.rarity]}
            </span>
          )}
          {nft.availableEditions === 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/75 text-[10px] font-bold tracking-wider text-danger uppercase">
              Esgotado
            </span>
          )}
        </div>

        {mobileExtras && onFavorite && (
          <button
            type="button"
            disabled={favoritePending}
            onClick={(event) => {
              event.preventDefault()
              onFavorite(!nft.isFavorite)
            }}
            aria-label={nft.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={nft.isFavorite}
            className={cn(
              'absolute top-4 right-4 rounded-full bg-ink/70 p-2 md:hidden',
              nft.isFavorite ? 'text-danger' : 'text-content-muted',
            )}
          >
            <Heart className="h-4 w-4" fill={nft.isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </Link>

      <div className="px-1 pt-3">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="block truncate text-xs font-bold tracking-wide hover:text-accent"
        >
          {nft.name}
        </Link>
        <p className="mt-1.5 text-xs font-bold text-accent">
          {formatEth(nft.priceEth)} ETH
          {nft.compareAtPriceEth && (
            <span className="ml-2 font-normal text-content-subtle line-through">
              {formatEth(nft.compareAtPriceEth)} ETH
            </span>
          )}
        </p>
      </div>
    </article>
  )
}

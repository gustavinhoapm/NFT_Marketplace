import { Link } from '@tanstack/react-router'
import { Heart, Star } from 'lucide-react'

import type { NftListItem } from '@/contracts/nft'
import { RARITY_LABELS } from '@/contracts/nft'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

import { Badge } from './ui/badge'

export function NftCard({
  nft,
  onFavorite,
  favoritePending = false,
}: {
  nft: NftListItem
  onFavorite?: (favorite: boolean) => void
  favoritePending?: boolean
}) {
  return (
    <article className="group overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-accent-muted">
      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        className="relative block aspect-square overflow-hidden bg-cream"
        aria-label={`Ver detalhes de ${nft.name}`}
      >
        <img
          src={nft.imageUrl}
          alt={`Arte de ${nft.name}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={nft.rarity === 'lendario' ? 'default' : 'muted'}>
            {RARITY_LABELS[nft.rarity]}
          </Badge>
        </div>
        {nft.availableEditions === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/75">
            <Badge variant="danger">Esgotado</Badge>
          </div>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to="/nft/$nftId"
              params={{ nftId: nft.id }}
              className="block truncate text-sm font-bold hover:text-accent"
            >
              {nft.name}
            </Link>
            <p className="mt-1 truncate text-xs text-content-subtle">{nft.tokenId}</p>
          </div>
          {onFavorite && (
            <button
              type="button"
              disabled={favoritePending}
              onClick={() => onFavorite(!nft.isFavorite)}
              aria-label={nft.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              aria-pressed={nft.isFavorite}
              className={cn(
                'rounded-sm p-1.5 transition-colors hover:bg-coffee disabled:opacity-50',
                nft.isFavorite ? 'text-danger' : 'text-content-subtle hover:text-danger',
              )}
            >
              <Heart className="h-4 w-4" fill={nft.isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] tracking-wider text-content-subtle uppercase">Preço atual</p>
            <p className="text-sm font-bold text-accent">
              {formatEth(nft.priceEth)} ETH
            </p>
            {nft.compareAtPriceEth && (
              <p className="text-[10px] text-content-subtle line-through">
                {formatEth(nft.compareAtPriceEth)} ETH
              </p>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-content-muted">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {nft.rating.average.toFixed(1)}
            <span className="text-content-subtle">({nft.rating.count})</span>
          </span>
        </div>
      </div>
    </article>
  )
}

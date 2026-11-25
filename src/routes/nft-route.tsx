import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { Heart, Minus, Plus, ShoppingBag, Star, ZoomIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useAuthUi } from '@/components/auth-ui'
import { MobileTopBar } from '@/components/layout/mobile-top-bar'
import { NftCard } from '@/components/nft-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Network } from '@/contracts/common'
import type { CollectionId, NftListQuery } from '@/contracts/nft'
import { ApiError, errorMessage } from '@/lib/api-error'
import { formatEth, multiplyEth } from '@/lib/money'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useAddToCart } from '@/hooks/use-cart'
import { useFavorites, useNft, useNfts, useToggleFavorite } from '@/hooks/use-catalog'

import { rootRoute } from './root-route'

export const nftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$nftId',
  component: NftPage,
})

function NftPage() {
  const { nftId } = nftRoute.useParams()
  const navigate = useNavigate()
  const { openAuth } = useAuthUi()
  const { isAuthenticated } = useAuth()
  const add = useAddToCart()
  const favorite = useToggleFavorite()
  const { data: favorites } = useFavorites()
  const { data: nft, isPending, isError, error } = useNft(nftId)
  const [editionId, setEditionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState<'detalhes' | 'avaliacoes'>('detalhes')
  const [galleryIndex, setGalleryIndex] = useState(0)

  useEffect(() => {
    if (!nft || editionId) return
    const available = nft.editions.find((edition) => edition.available > 0)
    setEditionId(available?.id ?? nft.editions[0]?.id ?? '')
  }, [nft, editionId])

  useEffect(() => {
    setEditionId('')
    setQuantity(1)
    setGalleryIndex(0)
  }, [nftId])

  const edition = nft?.editions.find((item) => item.id === editionId)
  const isFavorite = favorites?.includes(nftId) ?? false

  const sameCollection: NftListQuery | null = nft
    ? {
        collections: [nft.collectionId as CollectionId],
        networks: undefined as Network[] | undefined,
        sort: 'popular',
        page: 1,
        pageSize: 9,
      }
    : null
  const collection = useNfts(sameCollection ?? { sort: 'popular', page: 1, pageSize: 9 })

  function toggleFavorite() {
    if (!isAuthenticated) {
      openAuth()
      return
    }
    favorite.mutate({ nftId, favorite: !isFavorite })
  }

  function submit(buyNow: boolean) {
    if (!nft || !edition) return
    add.mutate(
      { nftId: nft.id, editionId: edition.id, quantity },
      {
        onSuccess: () => {
          if (buyNow) void navigate({ to: '/pagamento' })
          else toast.success('Adicionado ao carrinho.')
        },
        onError: (failure) => {
          toast.error(
            failure instanceof ApiError && failure.code === 'insufficient_stock'
              ? 'Esta edição esgotou. Escolha outra.'
              : errorMessage(failure),
          )
        },
      },
    )
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link do NFT copiado.')
    } catch {
      toast.error('Não foi possível copiar o link neste navegador.')
    }
  }

  if (isPending) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <MobileTopBar title="Detalhes do NFT" />
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </main>
    )
  }

  if (isError || !nft) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">NFT não encontrado</h1>
        <p className="mt-3 text-sm text-content-muted">{errorMessage(error)}</p>
        <Button className="mt-6" onClick={() => void navigate({ to: '/' })}>
          Voltar ao catálogo
        </Button>
      </main>
    )
  }

  const soldOut = !edition || edition.available === 0
  const ratingStars = Math.round(nft.rating.average)

  const editionChips = (
    <div className="flex flex-wrap gap-2">
      {nft.editions.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={item.available === 0}
          onClick={() => {
            setEditionId(item.id)
            setQuantity(1)
          }}
          aria-pressed={editionId === item.id}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[11px] font-bold',
            editionId === item.id
              ? 'border-accent text-accent'
              : 'border-line text-content-muted hover:border-accent-muted',
            item.available === 0 && 'opacity-40 line-through',
          )}
        >
          {item.label}
        </button>
      ))}
      <span className="rounded-full border border-line px-3 py-1.5 text-[11px] text-content-muted">
        {soldOut ? 'ESGOTADA' : 'ABERTA'}
      </span>
    </div>
  )

  const stepper = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={quantity <= 1}
        onClick={() => setQuantity((value) => value - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-ink disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span aria-live="polite" className="w-6 text-center text-sm font-bold">{quantity}</span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={quantity >= (edition?.available ?? 1)}
        onClick={() => setQuantity((value) => value + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-ink disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )

  const metaRows = (
    <dl className="space-y-2.5 text-[11px]">
      <div className="flex gap-2">
        <dt className="text-content-muted">ID do token:</dt>
        <dd className="text-accent">{nft.tokenId}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="text-content-muted">Coleção:</dt>
        <dd className="text-accent">{nft.collectionName}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="text-content-muted">Atributos:</dt>
        <dd className="text-accent">{nft.attributes.join(', ')}</dd>
      </div>
    </dl>
  )

  return (
    <>
      <MobileTopBar
        title="Detalhes do NFT"
        right={
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={isFavorite}
            className={cn('rounded-full bg-surface p-2', isFavorite ? 'text-danger' : 'text-content-muted')}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        }
      />

      <main className="mx-auto max-w-[1200px] px-4 py-6 pb-28 sm:px-6 md:pb-10 lg:px-[30px]">
        <nav aria-label="Trilha de navegação" className="hidden text-xs text-content-muted lg:block">
          <Link to="/" className="hover:text-accent">Início</Link> /{' '}
          <Link to="/" search={{ tab: 'all', page: 1 }} className="hover:text-accent">Mercado</Link>
        </nav>

        <div className="mt-4 grid gap-8 lg:mt-6 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-12">
          {/* Galeria */}
          <div className="flex gap-4">
            <div className="order-2 hidden flex-col gap-3 lg:order-1 lg:flex">
              {nft.editions.slice(0, 4).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGalleryIndex(index)}
                  aria-label={`Ver miniatura ${index + 1}`}
                  className={cn(
                    'h-20 w-20 overflow-hidden rounded-md border-2 bg-cream',
                    galleryIndex === index ? 'border-accent' : 'border-line',
                  )}
                >
                  <img src={nft.imageUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="order-1 relative flex-1 overflow-hidden rounded-lg border border-line bg-surface p-4 lg:order-2">
              <img
                src={nft.imageUrl}
                alt={`Arte de ${nft.name}`}
                className="aspect-square w-full rounded-md object-cover"
              />
              <span className="absolute top-6 right-6 rounded-full bg-ink/70 p-2 text-content-muted">
                <ZoomIn className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Informações */}
          <div>
            <h1 className="text-2xl font-bold tracking-wide lg:text-3xl">{nft.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 border-b border-line pb-4">
              <p className="text-lg font-bold text-accent">
                {formatEth(edition?.priceEth ?? nft.editions[0].priceEth)} ETH
              </p>
              <p className="flex items-center gap-2 text-[11px] text-content-muted">
                <span aria-hidden="true" className="flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3 w-3" fill={index < ratingStars ? 'currentColor' : 'none'} />
                  ))}
                </span>
                {nft.rating.count} avaliações de colecionadores
              </p>
            </div>

            <h2 className="mt-5 text-xs font-bold">Sobre este NFT:</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-content-muted">{nft.description}</p>

            <h2 className="mt-5 text-xs font-bold">Edição:</h2>
            <div className="mt-2">{editionChips}</div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {stepper}
              <div className="flex flex-1 justify-end gap-3">
                <Button disabled={soldOut || add.isPending} onClick={() => submit(true)} className="rounded-sm px-8">
                  Comprar
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  className="rounded-sm"
                  aria-pressed={isFavorite}
                >
                  <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                  Favoritar
                </Button>
              </div>
            </div>
            {soldOut && <p className="mt-3 text-xs text-danger">Esta edição está esgotada.</p>}

            <div className="mt-6">{metaRows}</div>

            <p className="mt-5 flex items-center gap-3 text-[11px] font-bold">
              Compartilhar este NFT:
              <button type="button" onClick={() => void share()} className="rounded-sm border border-line px-2 py-1 text-content-muted hover:border-accent hover:text-accent">
                in
              </button>
              <button type="button" onClick={() => void share()} className="rounded-sm border border-line px-2 py-1 text-content-muted hover:border-accent hover:text-accent">
                ✉
              </button>
              <button type="button" onClick={() => void share()} className="rounded-sm border border-line px-2 py-1 text-content-muted hover:border-accent hover:text-accent">
                x
              </button>
            </p>
          </div>
        </div>

        {/* Abas de conteúdo */}
        <div className="mt-12 border-b border-line">
          <div role="tablist" aria-label="Conteúdo do NFT" className="flex gap-8">
            {(
              [
                ['detalhes', 'Detalhes do NFT'],
                ['avaliacoes', `Avaliações de colecionadores (${nft.rating.count})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  '-mb-px border-b-2 pb-3 text-xs font-bold tracking-wide',
                  tab === id ? 'border-accent text-accent' : 'border-transparent text-content-muted hover:text-content',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'detalhes' ? (
          <div className="mt-6 space-y-4 text-[11px] leading-relaxed text-content-muted">
            <p>{nft.description} Cada atributo fica armazenado nos metadados do token e verificado na rede {nft.network}.</p>
            <p>
              A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um
              registro permanente de procedência registrada na rede. O criador recebe {nft.royaltyPercent}% de
              direitos autorais nas vendas secundárias.
            </p>
            <div>
              <h3 className="font-bold text-content">Rede:</h3>
              <p className="mt-1">Cunhado na rede {nft.network} com procedência imutável e metadados armazenados no IPFS.</p>
            </div>
            <div>
              <h3 className="font-bold text-content">Contrato:</h3>
              <p className="mt-1">Direitos autorais do criador: {nft.royaltyPercent}% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.</p>
            </div>
            <div>
              <h3 className="font-bold text-content">Direitos autorais:</h3>
              <p className="mt-1 break-all">{nft.contractAddress} • Contrato inteligente ERC-721 verificado.</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-line bg-surface p-8 text-center text-xs text-content-muted">
            <p className="font-bold text-content">Média {nft.rating.average.toFixed(1)} de {nft.rating.count} avaliações</p>
            <p className="mt-2">
              Os comentários escritos não fazem parte desta demonstração; apenas a consolidação numérica é
              exibida, como no frame.
            </p>
          </div>
        )}

        {/* Rail da coleção */}
        {collection.data && collection.data.items.length > 0 && (
          <section aria-labelledby="collection-title" className="mt-14">
            <h2 id="collection-title" className="border-b border-line pb-3 text-sm font-bold tracking-wide text-accent">
              Mais desta coleção
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {collection.data.items
                .filter((item) => item.id !== nft.id)
                .slice(0, 5)
                .map((item) => (
                  <li key={item.id}>
                    <NftCard nft={item} />
                  </li>
                ))}
            </ul>
          </section>
        )}
      </main>

      {/* Barra de compra fixa no mobile, como no frame */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-content-muted">Qtd.</span>
            {stepper}
          </div>
          <p className="text-sm font-bold text-accent">
            {formatEth(edition ? multiplyEth(edition.priceEth, quantity) : '0')} ETH
          </p>
        </div>
        <div className="mt-3 flex gap-3">
          <Button full size="lg" className="rounded-full" disabled={soldOut || add.isPending} onClick={() => submit(false)}>
            Comprar NFT
          </Button>
          <Link
            to="/carrinho"
            aria-label="Ir para o carrinho"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coffee text-accent"
          >
            <ShoppingBag className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  )
}

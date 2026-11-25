import { createRoute, useNavigate } from '@tanstack/react-router'
import { Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useAuthUi } from '@/components/auth-ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEth, multiplyEth } from '@/lib/money'
import { ApiError, errorMessage } from '@/lib/api-error'
import { useAuth } from '@/hooks/use-auth'
import { useAddToCart } from '@/hooks/use-cart'
import { useFavorites, useNft, useToggleFavorite } from '@/hooks/use-catalog'

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

  useEffect(() => {
    if (!nft || editionId) return
    const available = nft.editions.find((edition) => edition.available > 0)
    setEditionId(available?.id ?? nft.editions[0]?.id ?? '')
  }, [nft, editionId])

  useEffect(() => {
    setEditionId('')
    setQuantity(1)
  }, [nftId])

  const edition = nft?.editions.find((item) => item.id === editionId)
  const isFavorite = favorites?.includes(nftId) ?? false

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

  if (isPending) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
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

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-[30px]">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-lg border border-line bg-cream">
            <img
              src={nft.imageUrl}
              alt={`Arte de ${nft.name}`}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="mt-3 flex gap-3">
            {nft.editions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setEditionId(item.id)
                  setQuantity(1)
                }}
                className={`h-16 w-16 overflow-hidden rounded-sm border-2 ${
                  editionId === item.id ? 'border-accent' : 'border-line'
                }`}
                aria-label={`Selecionar edição ${item.label}`}
              >
                <img src={nft.imageUrl} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="outline">{nft.collectionName}</Badge>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{nft.name}</h1>
              <p className="mt-1 text-sm text-content-subtle">
                {nft.tokenId} · {nft.network}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) return openAuth()
                favorite.mutate({ nftId: nft.id, favorite: !isFavorite })
              }}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className={`rounded-sm border border-line p-3 ${
                isFavorite ? 'text-danger' : 'text-content-muted hover:text-danger'
              }`}
            >
              <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-content-muted">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-bold text-content">{nft.rating.average.toFixed(1)}</span>
            <span>({nft.rating.count} avaliações)</span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-content-muted">{nft.description}</p>

          <div className="mt-8 rounded-md border border-line bg-surface p-5">
            <Label htmlFor="edition">Edição</Label>
            <Select
              id="edition"
              value={editionId}
              onChange={(event) => {
                setEditionId(event.target.value)
                setQuantity(1)
              }}
            >
              {nft.editions.map((item) => (
                <option key={item.id} value={item.id} disabled={item.available === 0}>
                  {item.label} — {formatEth(item.priceEth)} ETH
                  {item.available === 0 ? ' (esgotado)' : ` (${item.available} disp.)`}
                </option>
              ))}
            </Select>

            <div className="mt-5 flex items-center justify-between">
              <Label htmlFor="quantity">Quantidade</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => value - 1)}
                  className="rounded-sm border border-line p-2 disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  id="quantity"
                  aria-label="Quantidade"
                  type="number"
                  min={1}
                  max={edition?.available ?? 1}
                  value={quantity}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    if (Number.isInteger(next) && next > 0) setQuantity(next)
                  }}
                  className="w-12 border-b border-accent bg-transparent text-center text-sm font-bold focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  disabled={quantity >= (edition?.available ?? 1)}
                  onClick={() => setQuantity((value) => value + 1)}
                  className="rounded-sm border border-line p-2 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <p className="text-xs text-content-subtle">Total estimado</p>
              <p className="mt-1 text-2xl font-bold text-accent">
                {formatEth(edition ? multiplyEth(edition.priceEth, quantity) : '0')} ETH
              </p>
              <p className="mt-1 text-[11px] text-content-subtle">
                Taxas calculadas no carrinho pelo servidor.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                variant="secondary"
                disabled={!edition || edition.available === 0 || add.isPending}
                onClick={() => submit(false)}
              >
                <ShoppingBag className="h-4 w-4" /> Adicionar
              </Button>
              <Button
                disabled={!edition || edition.available === 0 || add.isPending}
                onClick={() => submit(true)}
              >
                Comprar agora
              </Button>
            </div>
            {edition?.available === 0 && (
              <p className="mt-3 text-xs text-danger">Esta edição está esgotada.</p>
            )}
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
            <div><dt className="text-content-subtle">Criador</dt><dd className="mt-1 font-bold">{nft.creatorName}</dd></div>
            <div><dt className="text-content-subtle">Royalty</dt><dd className="mt-1 font-bold">{nft.royaltyPercent}%</dd></div>
            <div className="col-span-2"><dt className="text-content-subtle">Contrato</dt><dd className="mt-1 break-all font-bold">{nft.contractAddress}</dd></div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {nft.attributes.map((attribute) => (
              <Badge key={attribute} variant="muted">{attribute}</Badge>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

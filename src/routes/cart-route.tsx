import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { MobileTopBar } from '@/components/layout/mobile-top-bar'
import { NftCard } from '@/components/nft-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError, errorMessage } from '@/lib/api-error'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'
import {
  useApplyCoupon,
  useCart,
  useRefreshQuote,
  useRemoveCartItem,
  useRemoveCoupon,
  useUpdateCartItem,
} from '@/hooks/use-cart'
import { useNfts } from '@/hooks/use-catalog'

import { rootRoute } from './root-route'

export const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/carrinho',
  component: CartPage,
})

function CartPage() {
  const navigate = useNavigate()
  const { data: cart, isPending, isError, refetch } = useCart()
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const applyCoupon = useApplyCoupon()
  const removeCoupon = useRemoveCoupon()
  const refresh = useRefreshQuote()
  const [code, setCode] = useState('')
  const [railPage, setRailPage] = useState(0)
  const recommendations = useNfts({ sort: 'popular', page: 1, pageSize: 15 })

  function submitCoupon(event: FormEvent) {
    event.preventDefault()
    applyCoupon.mutate(code, {
      onSuccess: () => {
        setCode('')
        toast.success('Cupom aplicado.')
      },
      onError: (error) => toast.error(errorMessage(error)),
    })
  }

  function scrollRail(page: number) {
    setRailPage(page)
  }

  if (isPending) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-[30px]">
        <MobileTopBar title="Carrinho de NFTs" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="mt-6 h-72 w-full" />
      </main>
    )
  }

  if (isError || !cart) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Não foi possível carregar o carrinho</h1>
        <Button className="mt-6" onClick={() => void refetch()}>Tentar novamente</Button>
      </main>
    )
  }

  const summary = (
    <aside className="h-fit rounded-md border border-line bg-surface p-5 lg:border-none lg:bg-transparent lg:p-0">
      <h2 className="hidden text-sm font-bold tracking-wide lg:block">Resumo da carteira</h2>

      <form onSubmit={submitCoupon} className="mt-4">
        <Label htmlFor="coupon" className="hidden lg:block">Código promocional</Label>
        <div className="flex">
          <Input
            id="coupon"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Digite o código promocional..."
            invalid={applyCoupon.error instanceof ApiError}
            className="rounded-r-none"
          />
          <Button
            type="submit"
            className="rounded-l-none"
            disabled={applyCoupon.isPending || !code}
          >
            Aplicar
          </Button>
        </div>
        {applyCoupon.error && (
          <p role="alert" className="mt-2 text-xs text-danger">{errorMessage(applyCoupon.error)}</p>
        )}
      </form>

      {cart.coupon && (
        <div className="mt-3 flex items-center justify-between rounded-sm bg-coffee px-3 py-2 text-xs">
          <span className="font-bold text-accent">{cart.coupon.code} · -{cart.coupon.percentOff}%</span>
          <button type="button" onClick={() => removeCoupon.mutate()} className="text-content-muted hover:text-danger">
            Remover
          </button>
        </div>
      )}

      <dl className="mt-6 space-y-3 text-xs">
        <div className="flex justify-between">
          <dt className="text-content-muted">Subtotal</dt>
          <dd>{formatEth(cart.totals.subtotalEth)} ETH</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-content-muted">Desconto do lançamento</dt>
          <dd>(-) {formatEth(cart.totals.discountEth)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-content-muted">Taxa de rede</dt>
          <dd className="text-right">
            {formatEth(cart.totals.networkFeeEth)} ETH
            <span className="block text-[10px] text-accent">Taxa estimada</span>
          </dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-sm font-bold">
          <dt>Total</dt>
          <dd className="text-accent">{formatEth(cart.totals.totalEth)} ETH</dd>
        </div>
      </dl>

      <p className="mt-2 text-[10px] text-content-subtle">
        Cotação {cart.quoteId.slice(0, 12)} · valores definidos pelo servidor.
      </p>

      <Button
        full
        size="lg"
        className="mt-6 rounded-md"
        disabled={cart.stale || cart.items.length === 0}
        onClick={() => void navigate({ to: '/pagamento' })}
      >
        Conectar e finalizar
      </Button>
      <Link to="/" className="mt-4 block text-center text-xs text-content-muted hover:text-accent">
        Continuar explorando
      </Link>
    </aside>
  )

  return (
    <>
      <MobileTopBar title="Carrinho de NFTs" />

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-[30px]">
        <nav aria-label="Trilha de navegação" className="hidden text-xs text-content-muted lg:block">
          <Link to="/" className="hover:text-accent">Início</Link> /{' '}
          <Link to="/" search={{ tab: 'all', page: 1 }} className="hover:text-accent">Mercado</Link> /{' '}
          <span className="text-content">Carrinho</span>
        </nav>

        {cart.stale && (
          <div role="status" className="mt-4 rounded-md border border-danger/40 bg-danger/10 p-4 text-sm">
            <p className="font-bold text-danger">Preço ou disponibilidade mudaram.</p>
            <p className="mt-1 text-content-muted">Atualize a cotação antes de pagar. Nenhum valor foi cobrado.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={refresh.isPending}
              onClick={() => refresh.mutate(undefined, { onSuccess: () => toast.success('Cotação atualizada.') })}
            >
              Atualizar cotação
            </Button>
          </div>
        )}

        {cart.items.length === 0 ? (
          <div className="mt-8 rounded-md border border-line bg-surface p-12 text-center">
            <p className="text-lg font-bold">Seu carrinho está vazio</p>
            <p className="mt-2 text-sm text-content-muted">Explore o catálogo e escolha suas obras favoritas.</p>
            <Link to="/" className="mt-6 inline-block"><Button>Explorar NFTs</Button></Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              {/* Cabeçalho da tabela (desktop) */}
              <div className="hidden grid-cols-[1fr_120px_140px_120px_40px] gap-4 border-b border-line pb-3 text-xs font-bold lg:grid">
                <span>NFTs</span>
                <span>Preço</span>
                <span>Edições</span>
                <span>Total</span>
                <span />
              </div>

              <ul className="mt-4 space-y-4 lg:mt-5 lg:space-y-3">
                {cart.items.map((item) => (
                  <li
                    key={item.id}
                    className="card-hover rounded-md border border-line bg-surface p-3 lg:grid lg:grid-cols-[1fr_120px_140px_120px_40px] lg:items-center lg:gap-4 lg:border-none lg:p-2 lg:hover:transform-none"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-sm object-cover lg:h-16 lg:w-16" />
                      </Link>
                      <div className="min-w-0">
                        <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="block truncate text-xs font-bold hover:text-accent">
                          {item.name}
                        </Link>
                        <p className="mt-1 text-[10px] text-content-subtle">ID do token: {item.tokenId}</p>
                        <p className="mt-1 text-[10px] text-content-subtle">Edição: {item.editionLabel}</p>
                        <p className="mt-2 text-xs font-bold text-accent lg:hidden">
                          {formatEth(item.lineTotalEth)} ETH
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 hidden text-xs font-bold lg:mt-0 lg:block">
                      {formatEth(item.unitPriceEth)} ETH
                    </p>

                    <div className="mt-3 flex items-center gap-2 lg:mt-0 lg:justify-center">
                      <button
                        type="button"
                        aria-label={`Diminuir quantidade de ${item.name}`}
                        disabled={item.quantity <= 1 || update.isPending}
                        onClick={() => update.mutate({ itemId: item.id, quantity: item.quantity - 1 }, { onError: (error) => toast.error(errorMessage(error)) })}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-ink disabled:opacity-40"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span aria-live="polite" className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Aumentar quantidade de ${item.name}`}
                        disabled={item.quantity >= item.available || update.isPending}
                        onClick={() => update.mutate({ itemId: item.id, quantity: item.quantity + 1 }, { onError: (error) => toast.error(errorMessage(error)) })}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-ink disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <p className="hidden text-xs font-bold text-accent lg:block">
                      {formatEth(item.lineTotalEth)} ETH
                    </p>

                    <button
                      type="button"
                      aria-label={`Remover ${item.name} do carrinho`}
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(item.id, { onError: (error) => toast.error(errorMessage(error)) })}
                      className="mt-3 ml-auto flex h-8 w-8 items-center justify-center rounded-full text-content-subtle hover:bg-coffee hover:text-danger lg:mt-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {summary}
          </div>
        )}

        {recommendations.data && recommendations.data.items.length > 0 && (
          <section aria-labelledby="also-title" className="mt-16">
            <h2 id="also-title" className="border-b border-line pb-3 text-sm font-bold tracking-wide text-accent">
              Colecionadores também viram
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {recommendations.data.items.slice(railPage * 5, railPage * 5 + 5).map((nft) => (
                <li key={nft.id}>
                  <NftCard nft={nft} />
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-center gap-2">
              {[0, 1, 2].map((page) => (
                <button
                  key={page}
                  type="button"
                  aria-label={`Ir para o grupo ${page + 1} de recomendações`}
                  onClick={() => scrollRail(page)}
                  className={cn(
                    'h-2 w-2 rounded-full',
                    railPage === page ? 'bg-accent' : 'border border-accent-muted bg-transparent',
                  )}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}

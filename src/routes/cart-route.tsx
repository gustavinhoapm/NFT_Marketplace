import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError, errorMessage } from '@/lib/api-error'
import { formatEth } from '@/lib/money'
import {
  useApplyCoupon,
  useCart,
  useRefreshQuote,
  useRemoveCartItem,
  useRemoveCoupon,
  useUpdateCartItem,
} from '@/hooks/use-cart'

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

  if (isPending) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-8 h-64 w-full" />
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

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-[30px]">
      <h1 className="text-3xl font-bold tracking-tight">Seu carrinho</h1>
      <p className="mt-2 text-sm text-content-muted">
        {cart.items.length} {cart.items.length === 1 ? 'item' : 'itens'}
      </p>

      {cart.stale && (
        <div role="status" className="mt-6 rounded-md border border-danger/40 bg-danger/10 p-4 text-sm">
          <p className="font-bold text-danger">Preço ou disponibilidade mudaram.</p>
          <p className="mt-1 text-content-muted">
            Atualize a cotação antes de pagar. Nenhum valor foi cobrado.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={refresh.isPending}
            onClick={() =>
              refresh.mutate(undefined, { onSuccess: () => toast.success('Cotação atualizada.') })
            }
          >
            Atualizar cotação
          </Button>
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="mt-8 rounded-md border border-line bg-surface p-12 text-center">
          <p className="text-lg font-bold">Seu carrinho está vazio</p>
          <p className="mt-2 text-sm text-content-muted">
            Explore o catálogo e escolha suas obras favoritas.
          </p>
          <Link to="/" className="mt-6 inline-block"><Button>Explorar NFTs</Button></Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-4">
            {cart.items.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 rounded-md border border-line bg-surface p-4"
              >
                <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-24 w-24 rounded-sm object-cover sm:h-28 sm:w-28"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to="/nft/$nftId"
                        params={{ nftId: item.nftId }}
                        className="text-sm font-bold hover:text-accent"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-content-subtle">
                        Edição {item.editionLabel} · {formatEth(item.unitPriceEth)} ETH / un.
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remover ${item.name}`}
                      disabled={remove.isPending}
                      onClick={() =>
                        remove.mutate(item.id, {
                          onError: (error) => toast.error(errorMessage(error)),
                        })
                      }
                      className="rounded-sm p-2 text-content-subtle hover:bg-coffee hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        disabled={item.quantity <= 1 || update.isPending}
                        onClick={() =>
                          update.mutate(
                            { itemId: item.id, quantity: item.quantity - 1 },
                            { onError: (error) => toast.error(errorMessage(error)) },
                          )
                        }
                        className="rounded-sm border border-line p-1.5 disabled:opacity-40"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span aria-live="polite" className="w-6 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        disabled={item.quantity >= item.available || update.isPending}
                        onClick={() =>
                          update.mutate(
                            { itemId: item.id, quantity: item.quantity + 1 },
                            { onError: (error) => toast.error(errorMessage(error)) },
                          )
                        }
                        className="rounded-sm border border-line p-1.5 disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <span className="ml-2 text-[10px] text-content-subtle">
                        máx. {item.available}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-accent">
                      {formatEth(item.lineTotalEth)} ETH
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-md border border-line bg-surface p-5">
            <h2 className="text-base font-bold">Resumo</h2>

            <form onSubmit={submitCoupon} className="mt-5">
              <Label htmlFor="coupon">Cupom</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="KURIO10"
                  invalid={applyCoupon.error instanceof ApiError}
                />
                <Button type="submit" variant="secondary" disabled={applyCoupon.isPending}>
                  Aplicar
                </Button>
              </div>
              {applyCoupon.error && (
                <p role="alert" className="mt-2 text-xs text-danger">
                  {errorMessage(applyCoupon.error)}
                </p>
              )}
            </form>

            {cart.coupon && (
              <div className="mt-3 flex items-center justify-between rounded-sm bg-coffee px-3 py-2 text-xs">
                <span className="font-bold text-accent">{cart.coupon.code} · -{cart.coupon.percentOff}%</span>
                <button
                  type="button"
                  onClick={() => removeCoupon.mutate()}
                  className="text-content-muted hover:text-danger"
                >
                  Remover
                </button>
              </div>
            )}

            <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-content-muted">Subtotal</dt>
                <dd>{formatEth(cart.totals.subtotalEth)} ETH</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-content-muted">Desconto</dt>
                <dd className="text-success">-{formatEth(cart.totals.discountEth)} ETH</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-content-muted">Taxa de rede</dt>
                <dd>{formatEth(cart.totals.networkFeeEth)} ETH</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 text-base font-bold">
                <dt>Total</dt>
                <dd className="text-accent">{formatEth(cart.totals.totalEth)} ETH</dd>
              </div>
            </dl>

            <p className="mt-3 text-[10px] leading-relaxed text-content-subtle">
              Valores calculados pelo servidor na cotação {cart.quoteId.slice(0, 12)}.
            </p>

            <Button
              full
              size="lg"
              className="mt-6"
              disabled={cart.stale || cart.items.length === 0}
              onClick={() => void navigate({ to: '/pagamento' })}
            >
              Ir para o pagamento
            </Button>
          </aside>
        </div>
      )}
    </main>
  )
}

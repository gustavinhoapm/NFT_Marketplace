import { createRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, Clock, ExternalLink, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ORDER_STATUS_LABELS } from '@/contracts/order'
import { errorMessage } from '@/lib/api-error'
import { formatEth } from '@/lib/money'
import { useOrder } from '@/hooks/use-orders'

import { rootRoute } from './root-route'

export const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pedido/$orderId',
  component: ConfirmationPage,
})

function ConfirmationPage() {
  const { orderId } = confirmationRoute.useParams()
  const { data: order, isPending, isError, error, refetch } = useOrder(orderId)

  if (isPending) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-8 h-64 w-full" />
      </main>
    )
  }

  if (isError || !order) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Pedido não encontrado</h1>
        <p className="mt-3 text-sm text-content-muted">{errorMessage(error)}</p>
        <Button className="mt-6" onClick={() => void refetch()}>Tentar novamente</Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center">
        {order.status === 'pending' && (
          <>
            <Clock className="h-14 w-14 animate-pulse text-accent" />
            <p className="mt-5 text-xs font-bold tracking-[0.28em] text-accent uppercase">
              Processando
            </p>
            <h1 className="mt-3 text-3xl font-bold">Pagamento em andamento</h1>
            <p className="mt-3 text-sm text-content-muted">
              Aguardando a confirmação da simulação. Esta página atualiza sozinha — pode
              recolher a página e voltar depois.
            </p>
          </>
        )}
        {order.status === 'confirmed' && (
          <>
            <CheckCircle2 className="h-14 w-14 text-success" />
            <p className="mt-5 text-xs font-bold tracking-[0.28em] text-success uppercase">
              Confirmado
            </p>
            <h1 className="mt-3 text-3xl font-bold">Sua compra foi confirmada!</h1>
            <p className="mt-3 text-sm text-content-muted">
              As obras abaixo agora fazem parte da sua coleção simulada.
            </p>
          </>
        )}
        {order.status === 'declined' && (
          <>
            <XCircle className="h-14 w-14 text-danger" />
            <p className="mt-5 text-xs font-bold tracking-[0.28em] text-danger uppercase">
              Recusado
            </p>
            <h1 className="mt-3 text-3xl font-bold">Pagamento não autorizado</h1>
            <p className="mt-3 text-sm text-content-muted">
              {order.failureReason ?? 'A operadora recusou a transação.'} Seus itens continuam
              no carrinho.
            </p>
          </>
        )}
      </div>

      <Card className="mt-10">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Resumo do pedido</CardTitle>
          <span className="font-mono text-xs text-content-subtle">{order.id}</span>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 border-b border-line pb-5 text-xs sm:grid-cols-2">
            <div><p className="text-content-subtle">Status</p><p className="mt-1 font-bold">{ORDER_STATUS_LABELS[order.status]}</p></div>
            <div><p className="text-content-subtle">Carteira</p><p className="mt-1 font-bold">{order.walletLabel} · {order.walletAddress.slice(0, 12)}…</p></div>
            <div><p className="text-content-subtle">Rede</p><p className="mt-1 font-bold">{order.network}</p></div>
            <div>
              <p className="text-content-subtle">Transação</p>
              {order.transactionHash ? (
                <a
                  href={order.explorerUrl ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-bold text-accent hover:underline"
                >
                  {order.transactionHash.slice(0, 14)}… <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <p className="mt-1 font-bold text-content-subtle">Aguardando…</p>
              )}
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {order.items.map((item) => (
              <li key={`${item.nftId}-${item.editionId}`} className="flex items-center gap-3">
                <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-sm object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{item.name}</p>
                  <p className="text-[10px] text-content-subtle">Edição {item.editionLabel} · ×{item.quantity}</p>
                </div>
                <p className="text-xs font-bold text-accent">{formatEth(item.lineTotalEth)} ETH</p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-line pt-5 text-xs">
            <div className="flex justify-between"><dt className="text-content-muted">Subtotal</dt><dd>{formatEth(order.totals.subtotalEth)} ETH</dd></div>
            <div className="flex justify-between"><dt className="text-content-muted">Desconto</dt><dd>-{formatEth(order.totals.discountEth)} ETH</dd></div>
            <div className="flex justify-between"><dt className="text-content-muted">Taxa de rede</dt><dd>{formatEth(order.totals.networkFeeEth)} ETH</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-sm font-bold">
              <dt>Total</dt><dd className="text-accent">{formatEth(order.totals.totalEth)} ETH</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button
          variant="secondary"
          onClick={() =>
            void refetch().then(() => toast.info('Status verificado novamente.'))
          }
        >
          Verificar status
        </Button>
        {order.status === 'declined' ? (
          <Link to="/carrinho"><Button>Tentar novamente</Button></Link>
        ) : (
          <Link to="/"><Button>Voltar ao catálogo</Button></Link>
        )}
      </div>
    </main>
  )
}

import { createRoute, Link, redirect } from '@tanstack/react-router'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ORDER_STATUS_LABELS } from '@/contracts/order'
import { errorMessage } from '@/lib/api-error'
import { formatEth } from '@/lib/money'
import { getSessionToken } from '@/lib/session'
import { useOrders } from '@/hooks/use-orders'

import { rootRoute } from './root-route'

export const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pedidos',
  beforeLoad: ({ location }) => {
    if (!getSessionToken()) {
      throw redirect({ to: '/entrar', search: { redirect: location.href } })
    }
  },
  component: OrdersPage,
})

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  declined: XCircle,
} as const

const STATUS_COLORS = {
  pending: 'text-accent',
  confirmed: 'text-success',
  declined: 'text-danger',
} as const

function OrdersPage() {
  const { data: orders, isPending, isError, error, refetch } = useOrders()

  if (isPending) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Não foi possível carregar seus pedidos</h1>
        <p className="mt-3 text-sm text-content-muted">{errorMessage(error)}</p>
        <Button className="mt-6" onClick={() => void refetch()}>Tentar novamente</Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Meus pedidos</h1>
      <p className="mt-2 text-sm text-content-muted">
        Histórico persistido pela API simulada. Clique em um pedido para ver o recibo.
      </p>

      {!orders?.length ? (
        <div className="mt-8 rounded-md border border-line bg-surface p-12 text-center">
          <p className="text-lg font-bold">Nenhum pedido ainda</p>
          <p className="mt-2 text-sm text-content-muted">
            Quando você finalizar uma compra, ela aparecerá aqui.
          </p>
          <Link to="/" className="mt-6 inline-block"><Button>Explorar NFTs</Button></Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => {
            const Icon = STATUS_ICONS[order.status]
            return (
              <li key={order.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-4">
                    <Icon className={`h-6 w-6 shrink-0 ${STATUS_COLORS[order.status]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">
                        {ORDER_STATUS_LABELS[order.status]}
                        <span className="ml-2 font-mono text-xs font-normal text-content-subtle">
                          {order.id.slice(0, 16)}…
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-content-muted">
                        {new Date(order.createdAt).toLocaleString('pt-BR')} ·{' '}
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                        {order.items.length === 1 ? 'obra' : 'obras'} · {order.network}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-accent">
                      {formatEth(order.totals.totalEth)} ETH
                    </p>
                    <Link
                      to="/pedido/$orderId"
                      params={{ orderId: order.id }}
                      className="rounded-sm border border-accent px-4 py-2 text-xs font-bold text-accent hover:bg-accent hover:text-ink"
                    >
                      Ver recibo
                    </Link>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}

import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { Clock, X, XCircle } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { MobileTopBar } from '@/components/layout/mobile-top-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { ThankYouEnvelope } from '@/components/ui/thank-you-envelope'
import { errorMessage } from '@/lib/api-error'
import { formatEth } from '@/lib/money'
import { useOrder } from '@/hooks/use-orders'

import { rootRoute } from './root-route'

export const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pedido/$orderId',
  component: ConfirmationPage,
})

/**
 * Recibo no padrão do frame: card centralizado com selo, meta da transação,
 * tabela de itens do snapshot e link simulado de explorador. Estados não
 * desenhados (pendente/recusado) seguem o mesmo padrão visual.
 */
function ConfirmationPage() {
  const { orderId } = confirmationRoute.useParams()
  const navigate = useNavigate()
  const { data: order, isPending, isError, error, refetch } = useOrder(orderId)
  const [explorerOpen, setExplorerOpen] = useState(false)

  if (isPending) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Skeleton className="h-72 w-full rounded-md" />
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

  const confirmed = order.status === 'confirmed'
  const declined = order.status === 'declined'
  // "Bloco" determinístico derivado do hash: explorador é simulado (enunciado).
  const blockNumber = order.transactionHash
    ? 18_000_000 + (parseInt(order.transactionHash.slice(2, 10), 16) % 900_000)
    : null

  return (
    <>
      <MobileTopBar title="Confirmação de pedido" />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:py-16">
        <section
          aria-labelledby="receipt-title"
          className="relative overflow-hidden rounded-md border border-line bg-surface"
        >
          <button
            type="button"
            aria-label="Fechar recibo e voltar ao início"
            onClick={() => void navigate({ to: '/' })}
            className="absolute top-4 right-4 text-content-muted hover:text-content"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="px-6 pt-10 pb-6 text-center">
            {confirmed && <ThankYouEnvelope className="mx-auto h-16 w-16 text-accent" />}
            {order.status === 'pending' && (
              <Clock aria-hidden="true" className="mx-auto h-14 w-14 animate-pulse text-accent" />
            )}
            {declined && <XCircle aria-hidden="true" className="mx-auto h-14 w-14 text-danger" />}
            <h1 id="receipt-title" className="mt-5 text-sm font-bold tracking-wide">
              {confirmed && 'Seus NFTs agora estão na sua carteira'}
              {order.status === 'pending' && 'Pagamento em andamento: esta página atualiza sozinha'}
              {declined && (order.failureReason ?? 'Pagamento não autorizado')}
            </h1>
          </div>

          <dl className="grid grid-cols-2 gap-y-4 border-y border-line px-6 py-4 text-[11px] sm:grid-cols-4">
            <div>
              <dt className="font-bold">ID da transação</dt>
              <dd className="mt-1 text-content-muted">
                {order.transactionHash ? `${order.transactionHash.slice(0, 6)}…${order.transactionHash.slice(-4)}` : 'Aguardando…'}
              </dd>
            </div>
            <div>
              <dt className="font-bold">Data</dt>
              <dd className="mt-1 text-content-muted">
                {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </dd>
            </div>
            <div>
              <dt className="font-bold">Total</dt>
              <dd className="mt-1 text-content-muted">{formatEth(order.totals.totalEth)} ETH</dd>
            </div>
            <div>
              <dt className="font-bold">Carteira</dt>
              <dd className="mt-1 text-content-muted">{order.walletLabel}</dd>
            </div>
          </dl>

          <div className="px-6 py-6">
            <h2 className="text-xs font-bold">Detalhes da transação</h2>
            <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-4 border-b border-line pb-2 text-xs font-bold">
              <span>NFTs</span>
              <span>Edições</span>
              <span>Subtotal</span>
            </div>
            <ul className="mt-4 space-y-4">
              {order.items.map((item) => (
                <li key={`${item.nftId}-${item.editionId}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
                  <span className="flex min-w-0 items-center gap-3">
                    <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-sm object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold">{item.name}</span>
                      <span className="block text-[10px] text-content-subtle">ID do token: {item.tokenId}</span>
                    </span>
                  </span>
                  <span className="text-[11px] text-content-muted">(x {item.quantity})</span>
                  <span className="text-xs font-bold text-accent">{formatEth(item.lineTotalEth)} ETH</span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-content-muted">Taxa de rede</dt>
                <dd>{formatEth(order.totals.networkFeeEth)} ETH</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-sm font-bold">
                <dt>Total</dt>
                <dd className="text-accent">{formatEth(order.totals.totalEth)} ETH</dd>
              </div>
            </dl>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-content-muted">
              {confirmed
                ? `Transação confirmada na rede ${order.network}. A propriedade foi transferida para sua carteira conectada e registrada na rede.`
                : declined
                  ? 'Nenhum valor foi cobrado. Seus itens continuam no carrinho.'
                  : 'Aguardando a confirmação da simulação. Você pode recarregar a página: o pedido é recuperado pelo mesmo identificador.'}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {confirmed && order.transactionHash && (
                <button
                  type="button"
                  onClick={() => setExplorerOpen(true)}
                  className="rounded-sm bg-accent px-6 py-3 text-xs font-bold text-ink hover:bg-accent-hover"
                >
                  Ver no Etherscan
                </button>
              )}
              {declined && (
                <Link to="/carrinho" className="rounded-sm bg-accent px-6 py-3 text-xs font-bold text-ink hover:bg-accent-hover">
                  Tentar novamente
                </Link>
              )}
              <Link to="/" className="rounded-sm border border-line px-6 py-3 text-xs font-bold text-content-muted hover:border-accent hover:text-accent">
                Voltar ao catálogo
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className="h-1.5 bg-accent" />
        </section>

        <Dialog
          open={explorerOpen}
          onOpenChange={setExplorerOpen}
          title="Explorador simulado"
          description="Referência de transação e link de exploração são simulados, como prevê o enunciado — nenhum dado sai desta demonstração."
        >
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-content-muted">Transação</dt>
              <dd className="break-all font-mono text-accent">{order.transactionHash}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-content-muted">Rede</dt>
              <dd className="font-bold capitalize">{order.network}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-content-muted">Bloco</dt>
              <dd className="font-bold">{blockNumber?.toLocaleString('pt-BR')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-content-muted">Status</dt>
              <dd className="font-bold text-success">Confirmado (12 confirmações)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-content-muted">Timestamp</dt>
              <dd className="font-bold">{new Date(order.updatedAt).toLocaleString('pt-BR')}</dd>
            </div>
          </dl>
        </Dialog>
      </main>
    </>
  )
}

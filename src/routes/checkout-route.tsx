import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Loader2, Wallet } from 'lucide-react'
import { useMemo, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldError, Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Network } from '@/contracts/common'
import type { CollectorDetails, CreateOrderRequest } from '@/contracts/order'
import type { WalletType } from '@/contracts/order'
import { WALLET_TYPE_LABELS } from '@/contracts/order'
import { ApiError, errorMessage } from '@/lib/api-error'
import { formatEth } from '@/lib/money'
import { getSessionToken } from '@/lib/session'
import { useProfile, useWallets } from '@/hooks/use-account'
import { useCart, useRefreshQuote } from '@/hooks/use-cart'
import { useCreateOrder } from '@/hooks/use-orders'

import { rootRoute } from './root-route'

export const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pagamento',
  beforeLoad: ({ location }) => {
    if (!getSessionToken()) {
      throw redirect({ to: '/entrar', search: { redirect: location.href } })
    }
  },
  component: CheckoutPage,
})

const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']
const WALLET_TYPES = Object.keys(WALLET_TYPE_LABELS) as WalletType[]

function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart } = useCart()
  const { data: wallets } = useWallets()
  const { data: profile } = useProfile()
  const createOrder = useCreateOrder()
  const refresh = useRefreshQuote()

  const [walletId, setWalletId] = useState('')
  const [network, setNetwork] = useState<Network>('ethereum')
  const [walletType, setWalletType] = useState<WalletType>('metamask')
  const [walletAddress, setWalletAddress] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [note, setNote] = useState('')
  const [decline, setDecline] = useState(false)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const idempotencyKey = useRef(crypto.randomUUID())

  const activeWallet = useMemo(
    () => wallets?.find((wallet) => wallet.id === walletId),
    [wallets, walletId],
  )

  function selectWallet(id: string) {
    const wallet = wallets?.find((item) => item.id === id)
    setWalletId(id)
    if (!wallet) return
    setNetwork(wallet.network)
    setWalletType(wallet.type)
    setWalletAddress(wallet.address)
    setReferralCode(wallet.referralCode)
    setEnsName(wallet.ensName ?? '')
  }

  function connectWallet() {
    setConnecting(true)
    window.setTimeout(() => {
      setConnecting(false)
      setConnected(true)
      toast.success('Carteira conectada.')
    }, 700)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!cart || !activeWallet || cart.items.length === 0) return

    const collector: CollectorDetails = {
      displayName,
      username,
      profileName: displayName,
      email,
      ensName,
      walletAddress,
      walletType,
      referralCode,
      note: decline ? 'Simular recusa de pagamento (recusar)' : note,
    }
    const body: CreateOrderRequest = {
      quoteId: cart.quoteId,
      walletId,
      network,
      couponCode: cart.coupon?.code ?? null,
      collector,
      items: cart.items.map((item) => ({
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quantity,
      })),
    }

    createOrder.mutate(
      { body, idempotencyKey: idempotencyKey.current },
      {
        onSuccess: ({ order }) => {
          void navigate({ to: '/pedido/$orderId', params: { orderId: order.id } })
        },
        onError: (error) => {
          if (
            error instanceof ApiError &&
            (error.code === 'price_changed' || error.code === 'quote_stale')
          ) {
            setNeedsConfirmation(true)
            toast.error('Os valores mudaram. Atualize a cotação para continuar.')
          } else {
            toast.error(errorMessage(error))
          }
        },
      },
    )
  }

  const fieldError = createOrder.error instanceof ApiError ? createOrder.error.fieldErrors : undefined

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-[30px]">
      <h1 className="text-3xl font-bold tracking-tight">Pagamento</h1>
      <p className="mt-2 text-sm text-content-muted">
        Revise os dados e confirme com sua carteira conectada.
      </p>

      {needsConfirmation && (
        <div role="alert" className="mt-6 rounded-md border border-danger/40 bg-danger/10 p-4 text-sm">
          <p className="font-bold text-danger">A cotação mudou.</p>
          <p className="mt-1 text-content-muted">
            Para evitar cobranças incorretas, atualize os valores e confirme novamente.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={refresh.isPending}
            onClick={() =>
              refresh.mutate(undefined, {
                onSuccess: () => {
                  setNeedsConfirmation(false)
                  idempotencyKey.current = crypto.randomUUID()
                  toast.success('Cotação atualizada. Confirme novamente.')
                },
              })
            }
          >
            Atualizar e confirmar de novo
          </Button>
        </div>
      )}

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Carteira e rede</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="wallet" required>Carteira cadastrada</Label>
                <Select
                  id="wallet"
                  value={walletId}
                  onChange={(event) => selectWallet(event.target.value)}
                >
                  <option value="">Selecione…</option>
                  {(wallets ?? []).map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.label} — {wallet.address.slice(0, 10)}…
                    </option>
                  ))}
                </Select>
                <FieldError>{fieldError?.walletId}</FieldError>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="network" required>Rede</Label>
                  <Select
                    id="network"
                    value={network}
                    onChange={(event) => setNetwork(event.target.value as Network)}
                  >
                    {NETWORKS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="wallet-type">Tipo</Label>
                  <Select
                    id="wallet-type"
                    value={walletType}
                    onChange={(event) => setWalletType(event.target.value as WalletType)}
                  >
                    {WALLET_TYPES.map((item) => (
                      <option key={item} value={item}>{WALLET_TYPE_LABELS[item]}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="wallet-address" required>Endereço</Label>
                <Input
                  id="wallet-address"
                  value={walletAddress}
                  onChange={(event) => setWalletAddress(event.target.value)}
                  placeholder="0x…"
                />
                <FieldError>{fieldError?.walletAddress}</FieldError>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-sm border border-line bg-coffee/40 p-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!walletId || connecting}
                  onClick={connectWallet}
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                  {connecting ? 'Conectando…' : connected ? 'Conectado' : 'Conectar carteira'}
                </Button>
                {connected && (
                  <button
                    type="button"
                    onClick={() => setConnected(false)}
                    className="text-xs text-content-muted hover:text-danger"
                  >
                    Desconectar
                  </button>
                )}
                <span className="text-[11px] text-content-subtle">
                  {connected ? 'Sessão da carteira ativa nesta aba.' : 'Conexão simulada, sem assinatura real.'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Dados do colecionador</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="display-name" required>Nome completo</Label>
                <Input
                  id="display-name"
                  defaultValue={profile?.displayName ?? ''}
                  onBlur={(event) => setDisplayName(event.target.value)}
                  onChange={(event) => setDisplayName(event.target.value)}
                  key={`name-${profile?.id ?? 'none'}`}
                />
              </div>
              <div>
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={profile?.username ?? ''}
                />
              </div>
              <div>
                <Label htmlFor="checkout-email" required>E-mail</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={profile?.email ?? ''}
                />
              </div>
              <div>
                <Label htmlFor="ens">ENS</Label>
                <Input id="ens" value={ensName} onChange={(event) => setEnsName(event.target.value)} />
              </div>
              <div>
                <Label htmlFor="referral">Código de indicação</Label>
                <Input
                  id="referral"
                  value={referralCode}
                  onChange={(event) => setReferralCode(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="note">Observação</Label>
                <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-xs text-content-muted sm:col-span-2">
                <input
                  type="checkbox"
                  checked={decline}
                  onChange={(event) => setDecline(event.target.checked)}
                  className="accent-accent"
                />
                Simular recusa de pagamento (cenário de demonstração)
              </label>
            </CardContent>
          </Card>
        </div>

        <aside className="h-fit rounded-md border border-line bg-surface p-5 lg:sticky lg:top-24">
          <h2 className="text-base font-bold">3. Revisão</h2>
          <ul className="mt-4 space-y-3 border-b border-line pb-4">
            {(cart?.items ?? []).map((item) => (
              <li key={item.id} className="flex gap-3">
                <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-sm object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{item.name} × {item.quantity}</p>
                  <p className="text-[10px] text-content-subtle">Edição {item.editionLabel}</p>
                </div>
                <p className="text-xs font-bold text-accent">{formatEth(item.lineTotalEth)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between"><dt className="text-content-muted">Subtotal</dt><dd>{formatEth(cart?.totals.subtotalEth ?? '0')} ETH</dd></div>
            <div className="flex justify-between"><dt className="text-content-muted">Desconto</dt><dd>-{formatEth(cart?.totals.discountEth ?? '0')} ETH</dd></div>
            <div className="flex justify-between"><dt className="text-content-muted">Taxa de rede</dt><dd>{formatEth(cart?.totals.networkFeeEth ?? '0')} ETH</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-sm font-bold">
              <dt>Total</dt><dd className="text-accent">{formatEth(cart?.totals.totalEth ?? '0')} ETH</dd>
            </div>
          </dl>

          {createOrder.error && !(createOrder.error instanceof ApiError && (createOrder.error.code === 'price_changed' || createOrder.error.code === 'quote_stale')) && (
            <p role="alert" className="mt-4 rounded-sm bg-danger/10 p-3 text-xs text-danger">
              {errorMessage(createOrder.error)}
            </p>
          )}

          <Button
            type="submit"
            full
            size="lg"
            className="mt-6"
            disabled={createOrder.isPending || needsConfirmation || !cart?.items.length}
          >
            {createOrder.isPending ? 'Processando…' : 'Confirmar compra'}
          </Button>
          <p className="mt-3 text-[10px] leading-relaxed text-content-subtle">
            O pedido só é considerado confirmado após a resposta da simulação. Cliques repetidos
            reutilizam a mesma chave de idempotência.
          </p>
        </aside>
      </form>
    </main>
  )
}

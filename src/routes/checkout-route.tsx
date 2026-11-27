import { createRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { Loader2, MoreVertical, Wallet } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { MobileTopBar } from '@/components/layout/mobile-top-bar'
import { Button } from '@/components/ui/button'
import { FieldError, Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Network } from '@/contracts/common'
import type { CollectorDetails, CreateOrderRequest, WalletType } from '@/contracts/order'
import { WALLET_TYPE_LABELS } from '@/contracts/order'
import { ApiError, errorMessage } from '@/lib/api-error'
import { formatEth } from '@/lib/money'
import { getSessionToken } from '@/lib/session'
import { cn } from '@/lib/utils'
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
const TYPE_LETTER: Record<WalletType, string> = {
  walletconnect: 'W',
  metamask: 'M',
  coinbase: 'C',
}

function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart } = useCart()
  const { data: wallets } = useWallets()
  const { data: profile } = useProfile()
  const createOrder = useCreateOrder()
  const refresh = useRefreshQuote()

  const [walletId, setWalletId] = useState('')
  const [switchingWallet, setSwitchingWallet] = useState(false)
  const [network, setNetwork] = useState<Network | ''>('')
  const [walletType, setWalletType] = useState<WalletType | ''>('')
  const [walletAddress, setWalletAddress] = useState('')
  const [useOtherWallet, setUseOtherWallet] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [profileName, setProfileName] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [secondaryWallet, setSecondaryWallet] = useState('')
  const [note, setNote] = useState('')
  const [decline, setDecline] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const idempotencyKey = useRef(crypto.randomUUID())

  const activeWallet = wallets?.find((wallet) => wallet.id === walletId)

  useEffect(() => {
    if (!profile) return
    setDisplayName((value) => value || profile.displayName)
    setUsername((value) => value || profile.username)
    setProfileName((value) => value || profile.displayName)
    setEmail((value) => value || profile.email)
    setEnsName((value) => value || (profile.ensName ?? '').replace(/\.eth$/, ''))
  }, [profile])

  useEffect(() => {
    if (walletId || !wallets?.length) return
    const primary = wallets.find((wallet) => wallet.isPrimary) ?? wallets[0]
    selectWallet(primary.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, walletId])

  function selectWallet(id: string) {
    const wallet = wallets?.find((item) => item.id === id)
    setWalletId(id)
    setSwitchingWallet(false)
    if (!wallet) return
    setNetwork(wallet.network)
    setWalletType(wallet.type)
    setWalletAddress(wallet.address)
    setReferralCode((value) => value || wallet.referralCode)
    setEnsName((value) => value || (wallet.ensName ?? ''))
  }

  function connectWallet() {
    setConnecting(true)
    window.setTimeout(() => {
      setConnecting(false)
      setConnected(true)
      toast.success('Carteira conectada.')
    }, 700)
  }

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {}
    /**
     * No mobile o formulário do colecionador não existe (frame mobile usa os
     * dados do perfil); só exigimos o que está visível para o usuário.
     */
    const collectorVisible = window.matchMedia('(min-width: 768px)').matches
    if (collectorVisible) {
      if (!displayName.trim()) errors.displayName = 'Obrigatório'
      if (!username.trim()) errors.username = 'Obrigatório'
      if (!profileName.trim()) errors.profileName = 'Obrigatório'
      if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'E-mail inválido'
      if (!ensName.trim()) errors.ensName = 'Obrigatório'
    }
    if (!network) errors.network = 'Selecione uma rede'
    if (!walletType) errors.walletType = 'Selecione uma carteira'
    if (!/^0x[a-fA-F0-9]{6,}$/.test(walletAddress)) errors.walletAddress = 'Endereço 0x inválido'
    if (!referralCode.trim()) errors.referralCode = 'Obrigatório'
    return errors
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const errors = validate()
    setClientErrors(errors)
    if (Object.keys(errors).length || !cart || !activeWallet || cart.items.length === 0) return

    const collector: CollectorDetails = {
      displayName,
      username,
      profileName,
      email,
      ensName: ensName ? `${ensName}.eth` : '',
      walletAddress,
      walletType: (walletType || 'metamask') as WalletType,
      referralCode,
      note: decline ? 'Simular recusa de pagamento (recusar)' : note,
    }
    const body: CreateOrderRequest = {
      quoteId: cart.quoteId,
      walletId,
      network: (network || 'ethereum') as Network,
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
          if (error instanceof ApiError && error.fieldErrors) {
            setClientErrors(error.fieldErrors)
          }
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

  const fieldError = {
    ...clientErrors,
    ...(createOrder.error instanceof ApiError ? createOrder.error.fieldErrors : undefined),
  }

  /** Evita confirmar antes de perfil/carteiras pré-precherem o formulário. */
  const preparing = !profile || !wallets

  const walletCards = (
    <div className="space-y-3" role="radiogroup" aria-label="Carteira cadastrada">
      {(wallets ?? []).map((wallet) => (
        <button
          key={wallet.id}
          type="button"
          role="radio"
          aria-checked={walletId === wallet.id}
          onClick={() => selectWallet(wallet.id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-md border bg-surface p-4 text-left',
            walletId === wallet.id ? 'border-accent' : 'border-line hover:border-accent-muted',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
              walletId === wallet.id ? 'border-accent' : 'border-content-subtle',
            )}
          >
            {walletId === wallet.id && <span className="h-2 w-2 rounded-full bg-accent" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold">{wallet.label}</span>
            <span className="mt-1 block truncate text-[11px] text-content-muted">
              {wallet.ensName ?? wallet.address}
            </span>
            <span className="mt-1 block text-[11px] text-content-muted">
              Rede {wallet.network === 'polygon' ? 'Polygon' : wallet.network === 'ethereum' ? 'principal Ethereum' : 'Solana'}
            </span>
          </span>
          <MoreVertical aria-hidden="true" className="h-4 w-4 text-content-subtle" />
        </button>
      ))}
    </div>
  )

  const typeCards = (
    <div className="space-y-3" role="radiogroup" aria-label="Carteira e rede">
      {WALLET_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          role="radio"
          aria-checked={walletType === type}
          onClick={() => setWalletType(type)}
          className={cn(
            'flex w-full items-center gap-3 rounded-md border bg-surface p-3.5 text-left',
            walletType === type ? 'border-accent' : 'border-line hover:border-accent-muted',
          )}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coffee text-xs font-bold text-accent">
            {TYPE_LETTER[type]}
          </span>
          <span className="flex-1 text-xs font-bold">{WALLET_TYPE_LABELS[type]}</span>
          <span
            aria-hidden="true"
            className={cn(
              'flex h-4 w-4 items-center justify-center rounded-full border',
              walletType === type ? 'border-accent' : 'border-content-subtle',
            )}
          >
            {walletType === type && <span className="h-2 w-2 rounded-full bg-accent" />}
          </span>
        </button>
      ))}
    </div>
  )

  const summary = (
    <>
      <div className="hidden grid-cols-[1fr_auto] border-b border-line pb-2 text-xs font-bold lg:grid">
        <span>NFTs</span>
        <span>Subtotal</span>
      </div>
      <ul className="mt-3 space-y-3">
        {(cart?.items ?? []).map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-md bg-surface p-2.5">
            <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-sm object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">
                {item.name} <span className="font-normal text-content-muted">(x {item.quantity})</span>
              </p>
              <p className="mt-0.5 text-[10px] text-content-subtle">ID do token: {item.tokenId}</p>
            </div>
            <p className="text-xs font-bold text-accent">{formatEth(item.lineTotalEth)} ETH</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-[11px] text-content-muted">
        Tem um código promocional?{' '}
        <Link to="/carrinho" className="text-accent hover:underline">Aplique aqui</Link>
      </p>
      <dl className="mt-4 space-y-2.5 text-xs">
        <div className="flex justify-between">
          <dt className="text-content-muted">Subtotal</dt>
          <dd>{formatEth(cart?.totals.subtotalEth ?? '0')} ETH</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-content-muted">Desconto do lançamento</dt>
          <dd>(-) {formatEth(cart?.totals.discountEth ?? '0')}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-content-muted">Taxa de rede</dt>
          <dd className="text-right">
            {formatEth(cart?.totals.networkFeeEth ?? '0')} ETH
            <span className="block text-[10px] text-accent">Taxa estimada</span>
          </dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-sm font-bold">
          <dt>Total</dt>
          <dd className="text-accent">{formatEth(cart?.totals.totalEth ?? '0')} ETH</dd>
        </div>
      </dl>
    </>
  )

  return (
    <>
      <MobileTopBar title="Pagamento com carteira" />

      <main className="mx-auto max-w-[1200px] px-4 py-6 pb-32 sm:px-6 md:pb-10 lg:px-[30px]">
        <nav aria-label="Trilha de navegação" className="hidden text-xs text-content-muted lg:block">
          <Link to="/" className="hover:text-accent">Início</Link> /{' '}
          <Link to="/" search={{ tab: 'all', page: 1 }} className="hover:text-accent">Mercado</Link> /{' '}
          <span className="text-content">Pagamento</span>
        </nav>

        {needsConfirmation && (
          <div role="alert" className="mt-4 rounded-md border border-danger/40 bg-danger/10 p-4 text-sm">
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

        <form onSubmit={submit} noValidate className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Perfil do colecionador — apenas desktop/tablet, como no frame */}
          <section aria-labelledby="collector-title" className="hidden md:block">
            <h2 id="collector-title" className="text-sm font-bold tracking-wide">Perfil do colecionador</h2>
            <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="display-name" required>Nome de exibição</Label>
                <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} invalid={Boolean(fieldError.displayName)} />
                <FieldError>{fieldError.displayName}</FieldError>
              </div>
              <div>
                <Label htmlFor="username" required>Nome de usuário</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} invalid={Boolean(fieldError.username)} />
                <FieldError>{fieldError.username}</FieldError>
              </div>
              <div>
                <Label htmlFor="network" required>Rede</Label>
                <Select id="network" value={network} onChange={(e) => setNetwork(e.target.value as Network)} invalid={Boolean(fieldError.network)}>
                  <option value="">Selecione uma rede</option>
                  {NETWORKS.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
                <FieldError>{fieldError.network}</FieldError>
              </div>
              <div>
                <Label htmlFor="profile-name" required>Nome do perfil</Label>
                <Input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} invalid={Boolean(fieldError.profileName)} />
                <FieldError>{fieldError.profileName}</FieldError>
              </div>
              <div>
                <Label htmlFor="wallet-address" required>Endereço da carteira</Label>
                <Input
                  id="wallet-address"
                  value={walletAddress}
                  onChange={(e) => {
                    // Digitar desvincula da carteira selecionada (modo manual).
                    setWalletAddress(e.target.value)
                    setUseOtherWallet(true)
                  }}
                  placeholder="Endereço 0x da carteira"
                  invalid={Boolean(fieldError.walletAddress)}
                />
                <FieldError>{fieldError.walletAddress}</FieldError>
                <p className="mt-1.5 text-[10px] text-content-subtle">
                  Pré-preenchido pela carteira escolhida em “Carteira e rede”; formato
                  Ethereum: <code>0x</code> + 40 hexadecimais. Digitar um valor próprio
                  ativa “Usar outra carteira?”.
                </p>
              </div>
              <div>
                <Label htmlFor="secondary">ENS ou carteira secundária (opcional)</Label>
                <Input id="secondary" value={secondaryWallet} onChange={(e) => setSecondaryWallet(e.target.value)} placeholder="ENS ou carteira secundária (opcional)" />
              </div>
              <div>
                <Label htmlFor="wallet-type" required>Tipo de carteira</Label>
                <Select id="wallet-type" value={walletType} onChange={(e) => setWalletType(e.target.value as WalletType)} invalid={Boolean(fieldError.walletType)}>
                  <option value="">Selecione uma carteira</option>
                  {WALLET_TYPES.map((item) => <option key={item} value={item}>{WALLET_TYPE_LABELS[item]}</option>)}
                </Select>
                <FieldError>{fieldError.walletType}</FieldError>
              </div>
              <div>
                <Label htmlFor="referral" required>Código de indicação</Label>
                <Input id="referral" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} invalid={Boolean(fieldError.referralCode)} />
                <FieldError>{fieldError.referralCode}</FieldError>
              </div>
              <div>
                <Label htmlFor="checkout-email" required>E-mail</Label>
                <Input id="checkout-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={Boolean(fieldError.email)} />
                <FieldError>{fieldError.email}</FieldError>
              </div>
              <div>
                <Label htmlFor="ens" required>Nome ENS</Label>
                <div className="flex gap-2">
                  <Input id="ens" value={ensName} onChange={(e) => setEnsName(e.target.value)} invalid={Boolean(fieldError.ensName)} />
                  <Select aria-label="Sufixo ENS" value=".eth" onChange={() => {}} className="w-20">
                    <option value=".eth">.eth</option>
                  </Select>
                </div>
                <FieldError>{fieldError.ensName}</FieldError>
              </div>
            </div>

            <label className="mt-6 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={useOtherWallet}
                onChange={(e) => setUseOtherWallet(e.target.checked)}
                className="h-4 w-4 rounded-full border-line accent-accent"
              />
              Usar outra carteira?
            </label>

            <div className="mt-6">
              <Label htmlFor="note">Observação do colecionador (opcional)</Label>
              <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

          </section>

          {/* Resumo + carteiras */}
          <aside>
            <h2 className="text-sm font-bold tracking-wide">Seus NFTs</h2>
            <div className="mt-4">{summary}</div>

            <h3 className="mt-8 text-center text-sm font-bold tracking-wide">Carteira e rede</h3>
            <div className="mt-4">{typeCards}</div>

            <div className="mt-6 md:hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-wide">Carteira conectada</h3>
                <button
                  type="button"
                  onClick={() => setSwitchingWallet((value) => !value)}
                  className="text-xs font-bold text-accent hover:underline"
                >
                  Trocar carteira
                </button>
              </div>
              <div className={cn('mt-4', !switchingWallet && walletId && 'pointer-events-none')}>
                {walletCards}
              </div>
              {!switchingWallet && walletId && (
                <p className="mt-2 text-[10px] text-content-subtle">
                  Toque em “Trocar carteira” para selecionar outra.
                </p>
              )}
            </div>

            {createOrder.error && !needsConfirmation && (
              <p role="alert" className="mt-4 rounded-sm bg-danger/10 p-3 text-xs text-danger">
                {errorMessage(createOrder.error)}
              </p>
            )}

            <Button
              type="submit"
              full
              size="lg"
              className="mt-6 hidden rounded-md md:flex"
              disabled={preparing || createOrder.isPending || needsConfirmation || !cart?.items.length}
            >
              {createOrder.isPending ? 'Processando…' : 'Confirmar compra'}
            </Button>
            <p className="mt-3 hidden text-[10px] leading-relaxed text-content-subtle md:block">
              O pedido só é confirmado após a resposta da simulação. Cliques repetidos reutilizam a
              mesma chave de idempotência.
            </p>

            {/* Cenários exigidos pelo enunciado para o pagamento (conexão,
                recusa e desconexão). Estado não desenhado no frame: fica
                recolhido ao final da coluna, no mesmo padrão visual. */}
            <details className="mt-6 rounded-sm border border-line bg-coffee/30 p-3">
              <summary className="cursor-pointer text-[11px] font-bold text-content-muted">
                Cenários de demonstração (avaliadores)
              </summary>
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
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
                    <button type="button" onClick={() => setConnected(false)} className="text-xs text-content-muted hover:text-danger">
                      Desconectar
                    </button>
                  )}
                  <span className="text-[11px] text-content-subtle">
                    {connected ? 'Sessão da carteira ativa nesta aba.' : 'Conexão simulada, sem assinatura real.'}
                  </span>
                </div>
                <label className="flex items-center gap-2 text-[11px] text-content-muted">
                  <input
                    type="checkbox"
                    checked={decline}
                    onChange={(e) => setDecline(e.target.checked)}
                    className="accent-accent"
                  />
                  Simular recusa do pagamento
                </label>
                <p className="text-[10px] leading-relaxed text-content-subtle">
                  Mais cenários (latência, offline, timeout, sessão expirada) em
                  <code> window.__KURIO__</code> — ver README.
                </p>
              </div>
            </details>
          </aside>
        </form>
      </main>

      {/* Confirmação fixa no mobile, como no frame */}
      <div className="fixed inset-x-0 bottom-16 z-30 px-4 pb-4 md:hidden">
        <Button
          type="submit"
          full
          size="lg"
          className="rounded-full"
          disabled={preparing || createOrder.isPending || needsConfirmation || !cart?.items.length}
          onClick={submit}
        >
          {createOrder.isPending ? 'Processando…' : 'Confirmar compra'}
        </Button>
      </div>
    </>
  )
}

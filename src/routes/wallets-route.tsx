import { createRoute, redirect } from '@tanstack/react-router'
import { Pencil, Plus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { FieldError, Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError, errorMessage } from '@/lib/api-error'
import { getSessionToken } from '@/lib/session'
import { useCreateWallet, useUpdateWallet, useWallets } from '@/hooks/use-account'
import type { Network } from '@/contracts/common'
import type { Wallet } from '@/contracts/profile'
import { WALLET_TYPE_LABELS, type WalletType } from '@/contracts/order'

import { rootRoute } from './root-route'

export const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/carteiras',
  beforeLoad: ({ location }) => {
    if (!getSessionToken()) {
      throw redirect({ to: '/entrar', search: { redirect: location.href } })
    }
  },
  component: WalletsPage,
})

const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']
const TYPES = Object.keys(WALLET_TYPE_LABELS) as WalletType[]

function WalletsPage() {
  const { data: wallets, isPending } = useWallets()
  const create = useCreateWallet()
  const update = useUpdateWallet()
  const [editing, setEditing] = useState<Wallet | null>(null)
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState<Network>('ethereum')
  const [type, setType] = useState<WalletType>('metamask')
  const [ensName, setEnsName] = useState('')
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    if (!open) return
    setLabel(editing?.label ?? '')
    setAddress(editing?.address ?? '')
    setNetwork(editing?.network ?? 'ethereum')
    setType(editing?.type ?? 'metamask')
    setEnsName(editing?.ensName ?? '')
    setReferralCode(editing?.referralCode ?? '')
  }, [open, editing])

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }

  function openEdit(wallet: Wallet) {
    setEditing(wallet)
    setOpen(true)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const payload = { label, address, network, type, ensName, referralCode }
    const mutation = editing
      ? update.mutate.bind(update, { id: editing.id, body: payload })
      : create.mutate.bind(create, payload)
    mutation({
      onSuccess: () => {
        setOpen(false)
        toast.success(editing ? 'Carteira atualizada.' : 'Carteira cadastrada.')
      },
      onError: (error: unknown) => toast.error(errorMessage(error)),
    })
  }

  const error = (editing ? update.error : create.error) instanceof ApiError
    ? (editing ? update.error : create.error) as ApiError
    : null

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas carteiras</h1>
          <p className="mt-2 text-sm text-content-muted">
            Cadastre a principal e as secundárias para usar no pagamento.
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Nova carteira</Button>
      </div>

      {isPending ? (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {(wallets ?? []).map((wallet) => (
            <li key={wallet.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coffee text-accent">
                    <span className="text-lg font-bold">{wallet.label.slice(0, 1).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-bold">
                      {wallet.label}
                      {wallet.isPrimary && (
                        <span className="rounded-sm bg-accent px-2 py-0.5 text-[10px] font-bold text-ink uppercase">
                          Principal
                        </span>
                      )}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-content-subtle">{wallet.address}</p>
                    <p className="mt-1 text-[11px] text-content-muted">
                      {wallet.network} · {WALLET_TYPE_LABELS[wallet.type]}
                      {wallet.ensName ? ` · ${wallet.ensName}` : ''}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(wallet)}>
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
          {(wallets ?? []).length === 0 && (
            <li className="rounded-md border border-line bg-surface p-10 text-center text-sm text-content-muted">
              Nenhuma carteira cadastrada.
            </li>
          )}
        </ul>
      )}

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Editar carteira' : 'Nova carteira'}
        description="Endereços são validados antes de salvar."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="wallet-label" required>Apelido</Label>
            <Input id="wallet-label" value={label} onChange={(e) => setLabel(e.target.value)} invalid={Boolean(error?.fieldErrors?.label)} />
            <FieldError>{error?.fieldErrors?.label}</FieldError>
          </div>
          <div>
            <Label htmlFor="wallet-address-form" required>Endereço</Label>
            <Input id="wallet-address-form" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x…" invalid={Boolean(error?.fieldErrors?.address)} />
            <FieldError>{error?.fieldErrors?.address}</FieldError>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wallet-network">Rede</Label>
              <Select id="wallet-network" value={network} onChange={(e) => setNetwork(e.target.value as Network)}>
                {NETWORKS.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="wallet-type-form">Tipo</Label>
              <Select id="wallet-type-form" value={type} onChange={(e) => setType(e.target.value as WalletType)}>
                {TYPES.map((item) => <option key={item} value={item}>{WALLET_TYPE_LABELS[item]}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="wallet-ens">ENS</Label>
            <Input id="wallet-ens" value={ensName} onChange={(e) => setEnsName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="wallet-referral">Código de indicação</Label>
            <Input id="wallet-referral" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
          </div>
          {error && !error.fieldErrors && (
            <p role="alert" className="text-xs text-danger">{error.message}</p>
          )}
          <Button type="submit" full disabled={create.isPending || update.isPending}>
            Salvar
          </Button>
        </form>
      </Dialog>
    </main>
  )
}

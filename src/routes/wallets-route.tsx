import { createRoute, redirect } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { AccountMobileFooter, AccountSidebar } from '@/components/account/sidebar'
import { Button } from '@/components/ui/button'
import { FieldError, Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { Network } from '@/contracts/common'
import type { Wallet } from '@/contracts/profile'
import { WALLET_TYPE_LABELS, type WalletType } from '@/contracts/order'
import { ApiError, errorMessage } from '@/lib/api-error'
import { getSessionToken } from '@/lib/session'
import { useCreateWallet, useUpdateWallet, useWallets } from '@/hooks/use-account'
import { useProfile, useUpdateProfile } from '@/hooks/use-account'

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

interface WalletFormState {
  label: string
  address: string
  network: Network | ''
  type: WalletType | ''
  ensName: string
  referralCode: string
  displayName: string
  profileName: string
  email: string
  ensSuffixName: string
}

const EMPTY_FORM: WalletFormState = {
  label: '',
  address: '',
  network: '',
  type: '',
  ensName: '',
  referralCode: '',
  displayName: '',
  profileName: '',
  email: '',
  ensSuffixName: '',
}

function WalletsPage() {
  const { data: wallets, isPending } = useWallets()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const create = useCreateWallet()
  const update = useUpdateWallet()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [sameAsPrimary, setSameAsPrimary] = useState(false)
  const [form, setForm] = useState<WalletFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const primary = wallets?.find((wallet) => wallet.isPrimary) ?? wallets?.[0]
  const secondaries = (wallets ?? []).filter((wallet) => wallet.id !== primary?.id)
  const editing = wallets?.find((wallet) => wallet.id === editingId) ?? null
  const formOpen = creating || Boolean(editing)

  useEffect(() => {
    if (!primary || formOpen) return
    setForm({
      label: primary.label,
      address: primary.address,
      network: primary.network,
      type: primary.type,
      ensName: (primary.ensName ?? '').replace(/\.eth$/, ''),
      referralCode: primary.referralCode,
      displayName: profile?.displayName ?? '',
      profileName: profile?.displayName ?? '',
      email: profile?.email ?? '',
      ensSuffixName: (profile?.ensName ?? '').replace(/\.eth$/, ''),
    })
  }, [primary, profile, formOpen])

  function set<K extends keyof WalletFormState>(key: K, value: WalletFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function openCreate() {
    setEditingId(null)
    setCreating(true)
    setErrors({})
    setForm({
      ...EMPTY_FORM,
      address: sameAsPrimary ? (primary?.address ?? '') : '',
      displayName: profile?.displayName ?? '',
      profileName: profile?.displayName ?? '',
      email: profile?.email ?? '',
    })
  }

  function openEdit(wallet: Wallet) {
    setCreating(false)
    setEditingId(wallet.id)
    setErrors({})
    setForm({
      label: wallet.label,
      address: wallet.address,
      network: wallet.network,
      type: wallet.type,
      ensName: (wallet.ensName ?? '').replace(/\.eth$/, ''),
      referralCode: wallet.referralCode,
      displayName: profile?.displayName ?? '',
      profileName: profile?.displayName ?? '',
      email: profile?.email ?? '',
      ensSuffixName: (profile?.ensName ?? '').replace(/\.eth$/, ''),
    })
  }

  /**
   * Validação local espelha o contrato CreateWalletRequest. Os campos de
   * perfil (nome/e-mail/ENS) são opcionais aqui: quando preenchidos, são
   * sincronizados no perfil, mas não bloqueiam o cadastro da carteira.
   */
  function validate(): Record<string, string> {
    const next: Record<string, string> = {}
    if (!form.label.trim()) next.label = 'Obrigatório'
    if (!/^0x[a-fA-F0-9]{6,}$/.test(form.address)) next.address = 'Endereço 0x inválido'
    if (!form.network) next.network = 'Selecione uma rede'
    if (!form.type) next.type = 'Selecione uma carteira'
    if (!form.referralCode.trim()) next.referralCode = 'Obrigatório'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'E-mail inválido'
    return next
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const walletBody = {
      label: form.label,
      address: form.address,
      network: form.network as Network,
      type: form.type as WalletType,
      ensName: form.ensName ? `${form.ensName}.eth` : '',
      referralCode: form.referralCode,
    }
    const profileBody = {
      displayName: form.displayName,
      username: profile?.username ?? '',
      email: form.email,
      ensName: form.ensSuffixName ? `${form.ensSuffixName}.eth` : '',
      walletNickname: form.label,
      avatarUrl: profile?.avatarUrl ?? null,
    }

    const saveProfile = () => {
      // Só sincroniza o perfil quando os campos de perfil foram informados.
      if (!form.displayName.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
        return Promise.resolve()
      }
      return updateProfile.mutateAsync(profileBody).catch((error) => {
        toast.error(errorMessage(error))
        throw error
      })
    }

    if (editing) {
      update.mutate(
        { id: editing.id, body: walletBody },
        {
          onSuccess: async () => {
            await saveProfile().catch(() => undefined)
            toast.success('Carteira atualizada.')
            setCreating(false)
            setEditingId(null)
          },
          onError: (error) => toast.error(errorMessage(error)),
        },
      )
    } else {
      create.mutate(walletBody, {
        onSuccess: async () => {
          await saveProfile().catch(() => undefined)
          toast.success('Carteira cadastrada.')
          setCreating(false)
          setEditingId(null)
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) setErrors(error.fieldErrors)
          else toast.error(errorMessage(error))
        },
      })
    }
  }

  const fields = (
    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      <div>
        <Label htmlFor="wallet-display" required>Nome de exibição</Label>
        <Input id="wallet-display" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} invalid={Boolean(errors.displayName)} />
        <FieldError>{errors.displayName}</FieldError>
      </div>
      <div>
        <Label htmlFor="wallet-label" required>Apelido da carteira</Label>
        <Input id="wallet-label" value={form.label} onChange={(e) => set('label', e.target.value)} invalid={Boolean(errors.label)} />
        <FieldError>{errors.label}</FieldError>
      </div>
      <div>
        <Label htmlFor="wallet-network" required>Rede</Label>
        <Select id="wallet-network" value={form.network} onChange={(e) => set('network', e.target.value as Network)} invalid={Boolean(errors.network)}>
          <option value="">Selecione uma rede</option>
          {NETWORKS.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <FieldError>{errors.network}</FieldError>
      </div>
      <div>
        <Label htmlFor="wallet-profile" required>Nome do perfil</Label>
        <Input id="wallet-profile" value={form.profileName} onChange={(e) => set('profileName', e.target.value)} invalid={Boolean(errors.profileName)} />
        <FieldError>{errors.profileName}</FieldError>
      </div>
      <div>
        <Label htmlFor="wallet-address" required>Endereço da carteira</Label>
        <Input id="wallet-address" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="0x + 40 caracteres hexadecimais" invalid={Boolean(errors.address)} />
        <FieldError>{errors.address}</FieldError>
        <p className="mt-1.5 text-[10px] text-content-subtle">
          Formato Ethereum: <code>0x</code> seguido de 40 caracteres hexadecimais
          (ex.: 0xA91F4C2B8D3E7F0A5C6B9D2E4F8A1C3B5D7E9F02).
        </p>
        <button
          type="button"
          onClick={() => {
            const bytes = crypto.getRandomValues(new Uint8Array(20))
            set('address', `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`)
          }}
          className="mt-1 text-[10px] font-bold text-accent hover:underline"
        >
          Gerar endereço de teste
        </button>
      </div>
      <div>
        <Label htmlFor="wallet-ens-secondary">ENS ou carteira secundária (opcional)</Label>
        <Input id="wallet-ens-secondary" value={form.ensName} onChange={(e) => set('ensName', e.target.value)} placeholder="ENS ou carteira secundária (opcional)" />
      </div>
      <div>
        <Label htmlFor="wallet-type" required>Tipo de carteira</Label>
        <Select id="wallet-type" value={form.type} onChange={(e) => set('type', e.target.value as WalletType)} invalid={Boolean(errors.type)}>
          <option value="">Selecione uma carteira</option>
          {TYPES.map((item) => <option key={item} value={item}>{WALLET_TYPE_LABELS[item]}</option>)}
        </Select>
        <FieldError>{errors.type}</FieldError>
      </div>
      <div>
        <Label htmlFor="wallet-referral" required>Código de indicação</Label>
        <Input id="wallet-referral" value={form.referralCode} onChange={(e) => set('referralCode', e.target.value)} invalid={Boolean(errors.referralCode)} />
        <FieldError>{errors.referralCode}</FieldError>
      </div>
      <div>
        <Label htmlFor="wallet-email" required>E-mail</Label>
        <Input id="wallet-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} invalid={Boolean(errors.email)} />
        <FieldError>{errors.email}</FieldError>
      </div>
      <div>
        <Label htmlFor="wallet-ens" required>Nome ENS</Label>
        <div className="flex gap-2">
          <Select aria-label="Sufixo ENS" value=".eth" onChange={() => {}} className="w-20">
            <option value=".eth">.eth</option>
          </Select>
          <Input id="wallet-ens" value={form.ensSuffixName} onChange={(e) => set('ensSuffixName', e.target.value)} invalid={Boolean(errors.ensSuffixName)} />
        </div>
        <FieldError>{errors.ensSuffixName}</FieldError>
      </div>
    </div>
  )

  if (isPending) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-[30px]">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <Skeleton className="hidden h-96 w-full lg:block" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-[30px]">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <AccountSidebar active="carteiras" />

        <section aria-labelledby="wallets-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 id="wallets-title" className="text-sm font-bold tracking-wide">Carteira principal</h1>
              <p className="mt-2 text-[11px] text-content-muted">
                Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
              </p>
            </div>
            <button type="button" onClick={openCreate} className="text-xs font-bold text-accent hover:underline">
              Adicionar
            </button>
          </div>

          {formOpen ? (
            <p className="mt-6 rounded-md border border-line bg-surface p-4 text-[11px] text-content-muted">
              O formulário abaixo está editando a carteira selecionada. Cancele para voltar aos
              dados da carteira principal.
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6">
              {fields}
              <Button type="submit" className="mt-8" disabled={create.isPending || update.isPending}>
                {create.isPending || update.isPending ? 'Salvando…' : 'Salvar carteira'}
              </Button>
            </form>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold tracking-wide">Carteira secundária</h2>
              <p className="mt-2 text-[11px] text-content-muted">
                {secondaries.length
                  ? `${secondaries.length} carteira(s) secundária(s) cadastrada(s).`
                  : 'Você ainda não adicionou uma carteira secundária.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={sameAsPrimary}
                  onChange={(e) => setSameAsPrimary(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Igual à carteira principal
              </label>
              <button type="button" onClick={openCreate} className="text-xs font-bold text-accent hover:underline">
                Adicionar
              </button>
            </div>
          </div>

          {secondaries.length > 0 && (
            <ul className="mt-5 space-y-3">
              {secondaries.map((wallet) => (
                <li key={wallet.id} className="card-hover flex flex-wrap items-center gap-4 rounded-md border border-line bg-surface p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{wallet.label}</p>
                    <p className="mt-1 truncate font-mono text-[10px] text-content-subtle">{wallet.address}</p>
                    <p className="mt-1 text-[10px] text-content-muted">
                      {wallet.network} · {WALLET_TYPE_LABELS[wallet.type]}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(wallet)}>
                    Editar
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {formOpen && (
            <div className="mt-6 rounded-md border border-accent-muted bg-surface p-5">
              <h3 className="text-xs font-bold tracking-wide">
                {editing ? `Editar ${editing.label}` : 'Nova carteira secundária'}
              </h3>
              <form onSubmit={submit} noValidate className="mt-5">
                {fields}
                <div className="mt-6 flex gap-3">
                  <Button type="submit" disabled={create.isPending || update.isPending}>
                    Salvar carteira
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setCreating(false)
                      setEditingId(null)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}

          <AccountMobileFooter />
        </section>
      </div>
    </main>
  )
}

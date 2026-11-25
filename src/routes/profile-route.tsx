import { createRoute, redirect } from '@tanstack/react-router'
import { Eye, EyeOff, ImageIcon } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { AccountMobileFooter, AccountSidebar } from '@/components/account/sidebar'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { FieldError, Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError, errorMessage } from '@/lib/api-error'
import { getSessionToken } from '@/lib/session'
import { useChangePassword, useProfile, useUpdateProfile } from '@/hooks/use-account'
import { useLogout } from '@/hooks/use-auth'

import { rootRoute } from './root-route'

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/perfil',
  beforeLoad: ({ location }) => {
    if (!getSessionToken()) {
      throw redirect({ to: '/entrar', search: { redirect: location.href } })
    }
  },
  component: ProfilePage,
})

function PasswordInput({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
          invalid={Boolean(error)}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          aria-label={show ? `Ocultar ${label}` : `Mostrar ${label}`}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-content-subtle hover:text-content"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <FieldError>{error}</FieldError>
    </div>
  )
}

function ProfilePage() {
  const { data: profile, isPending } = useProfile()
  const update = useUpdateProfile()
  const changePassword = useChangePassword()
  const logout = useLogout()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [walletNickname, setWalletNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarDraft, setAvatarDraft] = useState('')
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | undefined>()

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.displayName)
    setUsername(profile.username)
    setEmail(profile.email)
    setEnsName((profile.ensName ?? '').replace(/\.eth$/, ''))
    setWalletNickname(profile.walletNickname)
    setAvatarUrl(profile.avatarUrl ?? '')
  }, [profile])

  const profileErrors =
    update.error instanceof ApiError ? update.error.fieldErrors : undefined
  const passwordErrors =
    changePassword.error instanceof ApiError ? changePassword.error.fieldErrors : undefined

  function submit(event: FormEvent) {
    event.preventDefault()
    if (newPassword || currentPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError('A confirmação não confere com a nova senha.')
        return
      }
      setPasswordError(undefined)
      changePassword.mutate(
        { currentPassword, newPassword },
        {
          onSuccess: () => {
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            toast.success('Senha alterada.')
          },
          onError: (error) => toast.error(errorMessage(error)),
        },
      )
    }
    update.mutate(
      {
        displayName,
        username,
        email,
        ensName: ensName ? `${ensName}.eth` : '',
        walletNickname,
        avatarUrl: avatarUrl || null,
      },
      {
        onSuccess: () => toast.success('Perfil atualizado.'),
        onError: (error) => toast.error(errorMessage(error)),
      },
    )
  }

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
        <AccountSidebar active="perfil" />

        <section aria-labelledby="profile-title">
          <h1 id="profile-title" className="text-sm font-bold tracking-wide">
            Perfil do colecionador
          </h1>

          <form onSubmit={submit} noValidate className="mt-6">
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="profile-name" required>Nome de exibição</Label>
                <Input id="profile-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} invalid={Boolean(profileErrors?.displayName)} />
                <FieldError>{profileErrors?.displayName}</FieldError>
              </div>
              <div>
                <Label htmlFor="profile-username" required>Nome de usuário</Label>
                <Input id="profile-username" value={username} onChange={(e) => setUsername(e.target.value)} invalid={Boolean(profileErrors?.username)} />
                <FieldError>{profileErrors?.username}</FieldError>
              </div>
              <div>
                <Label htmlFor="profile-email" required>E-mail</Label>
                <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={Boolean(profileErrors?.email)} />
                <FieldError>{profileErrors?.email}</FieldError>
              </div>
              <div>
                <Label htmlFor="profile-ens" required>Nome ENS</Label>
                <div className="flex gap-2">
                  <Select aria-label="Sufixo ENS" value=".eth" onChange={() => {}} className="w-20">
                    <option value=".eth">.eth</option>
                  </Select>
                  <Input id="profile-ens" value={ensName} onChange={(e) => setEnsName(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="profile-wallet" required>Apelido da carteira</Label>
                <Input id="profile-wallet" value={walletNickname} onChange={(e) => setWalletNickname(e.target.value)} invalid={Boolean(profileErrors?.walletNickname)} />
                <FieldError>{profileErrors?.walletNickname}</FieldError>
              </div>
              <div>
                <Label>Avatar</Label>
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-coffee text-accent">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar atual" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setAvatarDraft(avatarUrl)
                      setAvatarOpen(true)
                    }}
                  >
                    Alterar
                  </Button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs text-content-muted hover:text-danger"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>

            <h2 className="mt-10 text-sm font-bold tracking-wide">Alterar senha</h2>
            <div className="mt-5 max-w-md space-y-5">
              <PasswordInput id="current-password" label="Senha atual" value={currentPassword} onChange={setCurrentPassword} error={passwordErrors?.currentPassword} />
              <PasswordInput id="new-password" label="Nova senha" value={newPassword} onChange={setNewPassword} error={passwordErrors?.newPassword} />
              <PasswordInput id="confirm-password" label="Confirmar nova senha" value={confirmPassword} onChange={setConfirmPassword} error={passwordError} />
            </div>

            {update.error && !profileErrors && (
              <p role="alert" className="mt-4 text-xs text-danger">{errorMessage(update.error)}</p>
            )}

            <Button type="submit" className="mt-8" disabled={update.isPending || changePassword.isPending}>
              {update.isPending || changePassword.isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </form>

          <div className="mt-10 border-t border-line pt-6 lg:hidden">
            <Button
              variant="ghost"
              disabled={logout.isPending}
              onClick={() => logout.mutate(undefined, { onSuccess: () => window.location.assign('/') })}
            >
              Sair da conta
            </Button>
          </div>
          <AccountMobileFooter />
        </section>
      </div>

      <Dialog
        open={avatarOpen}
        onOpenChange={setAvatarOpen}
        title="Alterar avatar"
        description="Informe a URL pública da imagem. Upload de arquivos não faz parte desta demonstração."
      >
        <Label htmlFor="avatar-url">URL da imagem</Label>
        <Input id="avatar-url" value={avatarDraft} onChange={(e) => setAvatarDraft(e.target.value)} placeholder="https://…" />
        {avatarDraft && (
          <img src={avatarDraft} alt="Prévia do avatar" className="mt-4 h-16 w-16 rounded-full border border-line object-cover" />
        )}
        <Button
          full
          className="mt-5"
          onClick={() => {
            setAvatarUrl(avatarDraft)
            setAvatarOpen(false)
            toast.info('Lembre de salvar o perfil para aplicar o avatar.')
          }}
        >
          Usar esta imagem
        </Button>
      </Dialog>
    </main>
  )
}

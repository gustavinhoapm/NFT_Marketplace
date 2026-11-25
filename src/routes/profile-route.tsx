import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldError, Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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

function ProfilePage() {
  const navigate = useNavigate()
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
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.displayName)
    setUsername(profile.username)
    setEmail(profile.email)
    setEnsName(profile.ensName ?? '')
    setWalletNickname(profile.walletNickname)
    setAvatarUrl(profile.avatarUrl ?? '')
  }, [profile])

  function submitProfile(event: FormEvent) {
    event.preventDefault()
    update.mutate(
      { displayName, username, email, ensName, walletNickname, avatarUrl: avatarUrl || null },
      {
        onSuccess: () => toast.success('Perfil atualizado.'),
        onError: (error) => toast.error(errorMessage(error)),
      },
    )
  }

  function submitPassword(event: FormEvent) {
    event.preventDefault()
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('')
          setNewPassword('')
          toast.success('Senha alterada.')
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    )
  }

  if (isPending) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-8 h-80 w-full" />
      </main>
    )
  }

  const profileErrors =
    update.error instanceof ApiError ? update.error.fieldErrors : undefined
  const passwordErrors =
    changePassword.error instanceof ApiError ? changePassword.error.fieldErrors : undefined

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Meu perfil</h1>
      <p className="mt-2 text-sm text-content-muted">
        Seus dados são salvos pela API simulada e permanecem após recarregar a página.
      </p>

      <Card className="mt-8">
        <CardHeader><CardTitle>Dados pessoais</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submitProfile} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="profile-avatar">URL do avatar</Label>
              <Input
                id="profile-avatar"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://…"
              />
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="Prévia do avatar"
                  className="mt-3 h-16 w-16 rounded-full border border-line object-cover"
                />
              )}
            </div>
            <div>
              <Label htmlFor="profile-name" required>Nome completo</Label>
              <Input id="profile-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} invalid={Boolean(profileErrors?.displayName)} />
              <FieldError>{profileErrors?.displayName}</FieldError>
            </div>
            <div>
              <Label htmlFor="profile-username" required>Usuário</Label>
              <Input id="profile-username" value={username} onChange={(e) => setUsername(e.target.value)} invalid={Boolean(profileErrors?.username)} />
              <FieldError>{profileErrors?.username}</FieldError>
            </div>
            <div>
              <Label htmlFor="profile-email" required>E-mail</Label>
              <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={Boolean(profileErrors?.email)} />
              <FieldError>{profileErrors?.email}</FieldError>
            </div>
            <div>
              <Label htmlFor="profile-ens">ENS</Label>
              <Input id="profile-ens" value={ensName} onChange={(e) => setEnsName(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="profile-wallet">Apelido da carteira</Label>
              <Input id="profile-wallet" value={walletNickname} onChange={(e) => setWalletNickname(e.target.value)} />
            </div>
            {update.error && !profileErrors && (
              <p role="alert" className="text-xs text-danger sm:col-span-2">{errorMessage(update.error)}</p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Alterar senha</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submitPassword} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="current-password" required>Senha atual</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} invalid={Boolean(passwordErrors?.currentPassword)} />
              <FieldError>{passwordErrors?.currentPassword}</FieldError>
            </div>
            <div>
              <Label htmlFor="new-password" required>Nova senha</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} invalid={Boolean(passwordErrors?.newPassword)} />
              <FieldError>{passwordErrors?.newPassword}</FieldError>
            </div>
            {changePassword.error && !passwordErrors && (
              <p role="alert" className="text-xs text-danger sm:col-span-2">{errorMessage(changePassword.error)}</p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" variant="secondary" disabled={changePassword.isPending}>
                Alterar senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 border-t border-line pt-6">
        <Button
          variant="ghost"
          disabled={logout.isPending}
          onClick={() =>
            logout.mutate(undefined, {
              onSuccess: () => {
                toast.info('Sessão encerrada.')
                void navigate({ to: '/' })
              },
            })
          }
        >
          Sair da conta
        </Button>
      </div>
    </main>
  )
}

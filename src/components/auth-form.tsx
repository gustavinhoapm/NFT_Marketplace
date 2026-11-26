import { Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { useLogin, useRegister } from '@/hooks/use-auth'
import { ApiError, errorMessage } from '@/lib/api-error'

import { Button } from './ui/button'
import { FieldError } from './ui/label'
import { FacebookBrandIcon, GoogleBrandIcon } from './ui/social-icons'

export type AuthMode = 'login' | 'register'

/**
 * Provedores sociais do frame. OAuth real está fora do escopo; a camada de
 * mocks simula o provedor autenticando uma conta de demonstração (decisão
 * documentada em ARCHITECTURE.md).
 */
const SOCIAL_PROVIDERS = [
  { provider: 'Google', email: 'gustavo@kurio.test', password: 'kurio1234' },
  { provider: 'Facebook', email: 'nova@kurio.test', password: 'ape4567' },
] as const

/**
 * Formulário de autenticação no padrão dos frames: inputs com placeholder
 * (labels sr-only para acessibilidade), olho na senha, "Esqueceu a senha?" e
 * login social. Recuperação de senha e OAuth real estão fora do escopo, então
 * essas ações informam em vez de aparentar sucesso.
 */
export function AuthForm({
  mode,
  onSuccess,
}: {
  mode: AuthMode
  onSuccess?: () => void
}) {
  const login = useLogin()
  const register = useRegister()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState<string | undefined>()
  const [notice, setNotice] = useState<string | null>(null)
  const [socialPending, setSocialPending] = useState<string | null>(null)
  const error =
    (login.error instanceof ApiError ? login.error : null) ??
    (register.error instanceof ApiError ? register.error : null)
  const isPending = mode === 'login' ? login.isPending : register.isPending

  function submit(event: FormEvent) {
    event.preventDefault()
    setNotice(null)
    if (mode === 'register' && confirmPassword !== password) {
      setConfirmError('A confirmação não confere com a senha.')
      return
    }
    setConfirmError(undefined)
    const options = { onSuccess: () => onSuccess?.() }
    if (mode === 'login') login.mutate({ email, password }, options)
    else register.mutate({ username, email, password }, options)
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {mode === 'register' && (
        <div>
          <label htmlFor="auth-username" className="sr-only">Nome de usuário</label>
          <input
            id="auth-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Nome de usuário"
            autoComplete="username"
            aria-invalid={Boolean(error?.fieldErrors?.username) || undefined}
            className="h-12 w-full rounded-sm border border-line bg-ink px-4 text-sm placeholder:text-content-subtle focus:border-accent focus:outline-none"
          />
          <FieldError>{error?.fieldErrors?.username}</FieldError>
        </div>
      )}

      <div>
        <label htmlFor="auth-email" className="sr-only">E-mail</label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={mode === 'login' ? 'contato@email.com' : 'Digite seu e-mail'}
          autoComplete="email"
          aria-invalid={Boolean(error?.fieldErrors?.email) || undefined}
          className="h-12 w-full rounded-sm border border-line bg-ink px-4 text-sm placeholder:text-content-subtle focus:border-accent focus:outline-none"
        />
        <FieldError>{error?.fieldErrors?.email}</FieldError>
      </div>

      <div>
        <label htmlFor="auth-password" className="sr-only">Senha</label>
        <div className="relative">
          <input
            id="auth-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === 'login' ? '************' : 'Senha'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            aria-invalid={Boolean(error?.fieldErrors?.password) || undefined}
            className="h-12 w-full rounded-sm border border-line bg-ink px-4 pr-12 text-sm placeholder:text-content-subtle focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-content-subtle hover:text-content"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <FieldError>{error?.fieldErrors?.password}</FieldError>
      </div>

      {mode === 'register' && (
        <div>
          <label htmlFor="auth-confirm" className="sr-only">Confirmar senha</label>
          <input
            id="auth-confirm"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirmar senha"
            autoComplete="new-password"
            aria-invalid={Boolean(confirmError) || undefined}
            className="h-12 w-full rounded-sm border border-line bg-ink px-4 text-sm placeholder:text-content-subtle focus:border-accent focus:outline-none"
          />
          <FieldError>{confirmError}</FieldError>
        </div>
      )}

      {mode === 'login' && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setNotice('A recuperação de senha não faz parte desta demonstração.')}
            className="text-xs text-accent hover:underline"
          >
            Esqueceu a senha?
          </button>
        </div>
      )}

      {error && !error.fieldErrors && (
        <p role="alert" className="rounded-sm bg-danger/10 p-3 text-sm text-danger">{error.message}</p>
      )}
      {notice && (
        <p role="status" className="rounded-sm bg-coffee p-3 text-xs text-content-muted">{notice}</p>
      )}

      <Button type="submit" full size="lg" className="rounded-md" disabled={isPending}>
        {isPending ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
      </Button>

      <div className="flex items-center gap-3 pt-2" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] text-content-muted">Ou continue com</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-3">
        {SOCIAL_PROVIDERS.map(({ provider, email, password }) => (
          <button
            key={provider}
            type="button"
            disabled={socialPending === provider || isPending}
            onClick={() => {
              setSocialPending(provider)
              setNotice(null)
              // OAuth real está fora do escopo: o provedor é simulado pela
              // camada de mocks e entra com uma conta de demonstração.
              login.mutate(
                { email, password },
                {
                  onSuccess: () => {
                    setSocialPending(null)
                    toast.success(`Sessão simulada via ${provider}.`)
                    onSuccess?.()
                  },
                  onError: (failure) => {
                    setSocialPending(null)
                    toast.error(errorMessage(failure))
                  },
                },
              )
            }}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-sm border border-line text-xs hover:border-accent-muted disabled:opacity-60"
          >
            {/* caixa fixa garante mesmo tamanho óptico e alinhamento vertical
                entre o "G" (viewBox 24, glifo ~18px) e o "f" (viewBox recortado) */}
            <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center">
              {provider === 'Google' ? (
                <GoogleBrandIcon className="h-[22px] w-[22px]" />
              ) : (
                <FacebookBrandIcon className="h-4 w-4" />
              )}
            </span>
            {socialPending === provider ? `Conectando com ${provider}…` : `Continuar com ${provider}`}
          </button>
        ))}
      </div>
    </form>
  )
}

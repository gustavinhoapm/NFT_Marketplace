import { useState, type FormEvent } from 'react'

import { useLogin, useRegister } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api-error'
import { DEMO_CREDENTIALS } from '@/mocks/fixtures/users'

import { Button } from './ui/button'
import { FieldError, Label } from './ui/label'
import { Input } from './ui/input'

export type AuthMode = 'login' | 'register'

export function AuthForm({
  mode,
  onSuccess,
}: {
  mode: AuthMode
  onSuccess?: () => void
}) {
  const login = useLogin()
  const register = useRegister()
  const mutation = mode === 'login' ? login : register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const error = mutation.error instanceof ApiError ? mutation.error : null

  function submit(event: FormEvent) {
    event.preventDefault()
    const options = { onSuccess: () => onSuccess?.() }
    if (mode === 'login') login.mutate({ email, password }, options)
    else register.mutate({ username, email, password }, options)
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {mode === 'register' && (
        <div>
          <Label htmlFor="auth-username" required>Nome de usuário</Label>
          <Input
            id="auth-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            invalid={Boolean(error?.fieldErrors?.username)}
          />
          <FieldError>{error?.fieldErrors?.username}</FieldError>
        </div>
      )}

      <div>
        <Label htmlFor="auth-email" required>E-mail</Label>
        <Input
          id="auth-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          invalid={Boolean(error?.fieldErrors?.email)}
        />
        <FieldError>{error?.fieldErrors?.email}</FieldError>
      </div>

      <div>
        <Label htmlFor="auth-password" required>Senha</Label>
        <Input
          id="auth-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          invalid={Boolean(error?.fieldErrors?.password)}
        />
        <FieldError>{error?.fieldErrors?.password}</FieldError>
      </div>

      {error && !error.fieldErrors && (
        <p role="alert" className="rounded-sm bg-danger/10 p-3 text-sm text-danger">
          {error.message}
        </p>
      )}

      <Button type="submit" full disabled={mutation.isPending}>
        {mutation.isPending
          ? 'Aguarde…'
          : mode === 'login'
            ? 'Entrar'
            : 'Criar conta'}
      </Button>

      {mode === 'login' && (
        <div className="rounded-sm border border-line bg-coffee/40 p-3 text-xs text-content-muted">
          <p className="mb-2 font-bold text-content">Contas de demonstração</p>
          {DEMO_CREDENTIALS.map((credential) => (
            <button
              key={credential.email}
              type="button"
              onClick={() => {
                setEmail(credential.email)
                setPassword(credential.password)
              }}
              className="block text-left underline-offset-2 hover:text-accent hover:underline"
            >
              {credential.email} / {credential.password}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}

import { createRoute, Link, useNavigate } from '@tanstack/react-router'

import { AuthForm } from '@/components/auth-form'

import { rootRoute } from './root-route'

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cadastro',
  validateSearch: (raw: Record<string, unknown>) => ({
    redirect: typeof raw.redirect === 'string' ? raw.redirect : undefined,
  }),
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { redirect } = registerRoute.useSearch()

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <p className="text-xs font-bold tracking-[0.28em] text-accent uppercase">Novo colecionador</p>
      <h1 className="mt-3 text-3xl font-bold">Crie sua conta</h1>
      <p className="mt-2 mb-8 text-sm text-content-muted">
        Seu carrinho de visitante será preservado.
      </p>

      <AuthForm
        mode="register"
        onSuccess={() => {
          if (redirect?.startsWith('/')) window.location.assign(redirect)
          else void navigate({ to: '/' })
        }}
      />

      <p className="mt-6 text-center text-sm text-content-muted">
        Já tem conta?{' '}
        <Link to="/entrar" search={{ redirect }} className="font-bold text-accent hover:underline">
          Entre
        </Link>
      </p>
    </main>
  )
}

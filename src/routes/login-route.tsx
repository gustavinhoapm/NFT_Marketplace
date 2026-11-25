import { createRoute, Link, useNavigate } from '@tanstack/react-router'

import { AuthForm } from '@/components/auth-form'

import { rootRoute } from './root-route'

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/entrar',
  validateSearch: (raw: Record<string, unknown>) => ({
    redirect: typeof raw.redirect === 'string' ? raw.redirect : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect } = loginRoute.useSearch()

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <p className="text-xs font-bold tracking-[0.28em] text-accent uppercase">Bem-vindo de volta</p>
      <h1 className="mt-3 text-3xl font-bold">Entrar na KURIÓ</h1>
      <p className="mt-2 mb-8 text-sm text-content-muted">
        Acesse favoritos, carrinho e pedidos.
      </p>

      <AuthForm
        mode="login"
        onSuccess={() => {
          if (redirect?.startsWith('/')) window.location.assign(redirect)
          else void navigate({ to: '/' })
        }}
      />

      <p className="mt-6 text-center text-sm text-content-muted">
        Não tem conta?{' '}
        <Link to="/cadastro" search={{ redirect }} className="font-bold text-accent hover:underline">
          Cadastre-se
        </Link>
      </p>
    </main>
  )
}

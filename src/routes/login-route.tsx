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

  function done() {
    if (redirect?.startsWith('/')) window.location.assign(redirect)
    else void navigate({ to: '/' })
  }

  return (
    <main className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-6 py-12">
      <p className="text-center text-2xl font-bold tracking-[0.3em]">KURIO</p>
      <h1 className="mt-16 text-center text-lg font-bold tracking-wide">Entrar</h1>
      {redirect?.startsWith('/pagamento') && (
        <p className="mt-3 text-center text-[11px] text-content-muted">
          Seu carrinho de visitante será preservado e mesclado à sua conta.
        </p>
      )}

      <div className="mt-8">
        <AuthForm mode="login" onSuccess={done} />
      </div>

      <p className="mt-8 text-center text-xs text-content-muted">
        Novo na Kurio?{' '}
        <Link to="/cadastro" search={{ redirect }} className="font-bold text-content hover:text-accent">
          Crie uma conta
        </Link>
      </p>
    </main>
  )
}

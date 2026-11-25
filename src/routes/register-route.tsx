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

  function done() {
    if (redirect?.startsWith('/')) window.location.assign(redirect)
    else void navigate({ to: '/' })
  }

  return (
    <main className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-6 py-12">
      <p className="text-center text-2xl font-bold tracking-[0.3em]">KURIO</p>
      <h1 className="mt-16 text-center text-lg font-bold tracking-wide">Criar conta</h1>

      <div className="mt-8">
        <AuthForm mode="register" onSuccess={done} />
      </div>

      <p className="mt-8 text-center text-xs text-content-muted">
        Já tem conta?{' '}
        <Link to="/entrar" search={{ redirect }} className="font-bold text-content hover:text-accent">
          Entre
        </Link>
      </p>
    </main>
  )
}

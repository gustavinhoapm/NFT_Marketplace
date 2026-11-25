import { createRootRoute, Link } from '@tanstack/react-router'

import { AppShell } from '@/components/layout/app-shell'

export const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: () => (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-3 text-sm text-content-muted">
        O endereço que você tentou acessar não existe nesta demonstração.
      </p>
      <Link to="/" className="mt-6 rounded-sm bg-accent px-6 py-3 text-sm font-bold text-ink">
        Voltar ao início
      </Link>
    </main>
  ),
})

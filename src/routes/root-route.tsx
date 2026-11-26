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
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="rounded-sm bg-accent px-6 py-3 text-sm font-bold text-ink">
          Voltar ao início
        </Link>
        {/* Saída de emergência para aba com grafo de módulos/service worker
            envelhecido após muitos hot-reloads: recarrega o app por completo. */}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-sm border border-accent px-6 py-3 text-sm font-bold text-accent hover:bg-accent hover:text-ink"
        >
          Recarregar aplicativo
        </button>
      </div>
    </main>
  ),
})

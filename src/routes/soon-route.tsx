import { createRoute, Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

import { rootRoute } from './root-route'

const AREA_LABELS: Record<string, string> = {
  atividade: 'Atividade',
  ofertas: 'Ofertas',
  downloads: 'Arquivos baixados',
  suporte: 'Suporte',
  geral: 'Esta área',
}

export const soonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/em-breve',
  validateSearch: (raw: Record<string, unknown>) => ({
    area: typeof raw.area === 'string' ? raw.area : 'geral',
  }),
  component: SoonPage,
})

function SoonPage() {
  const { area } = soonRoute.useSearch()
  const label = AREA_LABELS[area] ?? 'Esta área'

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-bold tracking-[0.28em] text-accent uppercase">Fora de escopo</p>
      <h1 className="mt-4 text-3xl font-bold">{label} ainda não está disponível</h1>
      <p className="mt-3 text-sm leading-relaxed text-content-muted">
        Esta seção faz parte do escopo visual, mas não possui funcionalidade nesta
        demonstração. Nenhuma ação foi executada.
      </p>
      <Link to="/" className="mt-8">
        <Button>Voltar ao catálogo</Button>
      </Link>
    </main>
  )
}

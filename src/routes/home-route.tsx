import { createRoute } from '@tanstack/react-router'

import { rootRoute } from './root-route'

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: FoundationPage,
})

/**
 * Página temporária: valida os tokens extraídos do Figma antes de construir a
 * home real. É substituída na etapa da interface.
 */
function FoundationPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12">
        <p className="text-xs tracking-[0.28em] text-accent uppercase">
          Kurió · fundação visual
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Tokens extraídos do Figma
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-content-muted">
          Cores medidas diretamente nos PNGs e conferidas contra o Dev Mode.
          Esta página é temporária: serve para validar a base visual antes das
          telas reais.
        </p>
      </header>

      <section aria-labelledby="cores" className="mb-14">
        <h2
          id="cores"
          className="mb-5 border-b border-line pb-2 text-xs tracking-[0.22em] text-content-muted uppercase"
        >
          Cores
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PALETTE.map((color) => (
            <li
              key={color.token}
              className="overflow-hidden rounded-lg border border-line bg-surface"
            >
              <div
                className={`h-20 w-full ${color.className}`}
                aria-hidden="true"
              />
              <div className="p-3">
                <p className="text-xs text-content-muted">{color.token}</p>
                <p className="mt-1 font-bold">{color.hex}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="componentes" className="mb-14">
        <h2
          id="componentes"
          className="mb-5 border-b border-line pb-2 text-xs tracking-[0.22em] text-content-muted uppercase"
        >
          Componentes base
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="mb-4 text-sm text-content-muted">Botões</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-md bg-accent px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-accent-hover"
              >
                Explorar
              </button>
              <button
                type="button"
                className="rounded-md border border-accent px-6 py-3 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-ink"
              >
                Entrar
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-md bg-accent-muted px-6 py-3 text-sm font-bold text-ink/60"
              >
                Indisponível
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="mb-4 text-sm text-content-muted">Campos</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="preview-email"
                  className="mb-2 block text-sm font-bold"
                >
                  E-mail
                  <span aria-hidden="true" className="ml-1 text-danger">
                    *
                  </span>
                </label>
                <input
                  id="preview-email"
                  type="email"
                  placeholder="contato@email.com"
                  className="w-full rounded-md border border-line bg-ink px-4 py-3 text-sm placeholder:text-content-subtle"
                />
              </div>
              <p className="text-xs text-content-subtle">
                Texto auxiliar em content-subtle
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="tipografia">
        <h2
          id="tipografia"
          className="mb-5 border-b border-line pb-2 text-xs tracking-[0.22em] text-content-muted uppercase"
        >
          Tipografia
        </h2>
        <div className="space-y-4 rounded-lg border border-line bg-surface p-6">
          <p className="text-4xl font-bold tracking-tight">
            SEJA DONO DO FUTURO
          </p>
          <p className="text-xl font-bold">Detalhes do NFT</p>
          <p className="text-sm">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
          </p>
          <p className="text-sm text-content-muted">
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </p>
          <p className="text-sm font-bold text-accent">1.19 ETH</p>
        </div>
      </section>
    </main>
  )
}

const PALETTE = [
  { token: 'color/ink', hex: '#140D0A', className: 'bg-ink' },
  { token: 'color/surface', hex: '#241612', className: 'bg-surface' },
  { token: 'color/coffee', hex: '#38220F', className: 'bg-coffee' },
  { token: 'color/line', hex: '#3F2319', className: 'bg-line' },
  { token: 'color/accent', hex: '#D28A4C', className: 'bg-accent' },
  { token: 'color/accent-hover', hex: '#E89B55', className: 'bg-accent-hover' },
  { token: 'color/content', hex: '#F5F1EB', className: 'bg-content' },
  { token: 'color/content-muted', hex: '#BDB8B3', className: 'bg-content-muted' },
  { token: 'color/content-subtle', hex: '#847F7A', className: 'bg-content-subtle' },
  { token: 'color/cream', hex: '#FDF2DA', className: 'bg-cream' },
  { token: 'color/danger', hex: '#D4574A', className: 'bg-danger' },
  { token: 'color/success', hex: '#7FA650', className: 'bg-success' },
]

import { Link } from '@tanstack/react-router'

const OUT_OF_SCOPE = [
  { label: 'Atividade', area: 'atividade' },
  { label: 'Ofertas', area: 'ofertas' },
  { label: 'Arquivos baixados', area: 'downloads' },
  { label: 'Suporte', area: 'suporte' },
] as const

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface/40">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-[30px]">
        <div>
          <p className="text-lg font-bold tracking-[0.12em]">
            KURI<span className="text-accent">Ó</span>
          </p>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-content-muted">
            Colecione arte digital rara, apoie criadores e faça parte da cultura da internet.
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold tracking-wider text-content-muted uppercase">
            Navegue
          </p>
          <ul className="space-y-2 text-xs">
            <li><Link className="hover:text-accent" to="/">Explorar</Link></li>
            <li><Link className="hover:text-accent" to="/carteiras">Carteiras</Link></li>
            <li><Link className="hover:text-accent" to="/pedidos">Meus pedidos</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold tracking-wider text-content-muted uppercase">
            Em breve
          </p>
          <ul className="space-y-2 text-xs text-content-muted">
            {OUT_OF_SCOPE.map((item) => (
              <li key={item.area}>
                <Link
                  className="hover:text-accent"
                  to="/em-breve"
                  search={{ area: item.area }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-[10px] tracking-wider text-content-subtle uppercase">
        KURIÓ · Demo de marketplace · 2026
      </div>
    </footer>
  )
}

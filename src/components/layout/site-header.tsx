import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { LogIn, Search, ShoppingCart } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Início', to: '/', search: undefined },
  { label: 'Mercado', to: '/', search: { tab: 'all' as const, page: 1 } },
  { label: 'Criadores', to: '/em-breve', search: { area: 'criadores' } },
  { label: 'Aprenda', to: '/em-breve', search: { area: 'aprenda' } },
] as const

/** Header do frame desktop: logo, nav central, busca, carrinho e entrada. */
export function SiteHeader({ onAuth }: { onAuth: () => void }) {
  const navigate = useNavigate()
  const { data: cart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [term, setTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const count = (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)
  const searchStr = useRouterState({ select: (state) => state.location.searchStr })

  // A busca também é estado da URL: refresh/histórico restauram o termo.
  useEffect(() => {
    setTerm(new URLSearchParams(searchStr).get('q') ?? '')
  }, [searchStr])

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    void navigate({ to: '/', search: (previous) => ({ ...previous, q: term, page: 1 }) })
  }

  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-ink/95 backdrop-blur md:block">
      <div className="mx-auto grid h-14 max-w-[1200px] grid-cols-[auto_1fr_auto] items-center gap-8 px-4 sm:px-6 lg:px-[30px]">
        <Link to="/" className="shrink-0 text-sm font-bold tracking-[0.22em]">
          KURIO
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center justify-center gap-7 md:flex">
          {NAV.map((item, index) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search ?? {}}
              className={cn(
                'border-b-2 pb-1 text-[11px] tracking-wide',
                index === 0
                  ? 'border-accent font-bold text-accent'
                  : 'border-transparent text-content-muted hover:text-content',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 justify-self-end">
          <form onSubmit={submitSearch} className="hidden items-center md:flex">
            <label htmlFor="header-search" className="sr-only">Buscar NFTs</label>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-content-muted" />
              <input
                id="header-search"
                type="search"
                value={term}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={searchOpen ? 'Buscar NFTs' : ''}
                className={cn(
                  'h-8 border-b border-transparent bg-transparent pl-6 text-xs transition-all placeholder:text-content-subtle focus:border-accent focus:outline-none',
                  searchOpen || term ? 'w-44' : 'w-6',
                )}
              />
            </div>
          </form>
          <button
            type="button"
            aria-label="Abrir busca"
            onClick={() => setSearchOpen(true)}
            className="text-content-muted hover:text-content md:hidden"
          >
            <Search className="h-4 w-4" />
          </button>

          <Link
            to="/carrinho"
            aria-label={`Carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`}
            className="relative text-content-muted hover:text-content"
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-ink">
                {count}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <Link
              to="/perfil"
              className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-2 text-[11px] font-bold text-ink hover:bg-accent-hover"
            >
              <LogIn aria-hidden="true" className="h-3.5 w-3.5" />
              {user?.displayName?.split(' ')[0] ?? 'Perfil'}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAuth}
              className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-2 text-[11px] font-bold text-ink hover:bg-accent-hover"
            >
              <LogIn aria-hidden="true" className="h-3.5 w-3.5" />
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

import { Link, useNavigate } from '@tanstack/react-router'
import { Menu, Search, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'
import { cn } from '@/lib/utils'

export function SiteHeader({ onAuth }: { onAuth: () => void }) {
  const navigate = useNavigate()
  const { data: cart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [term, setTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  function submitSearch(event: React.FormEvent) {
    event.preventDefault()
    void navigate({
      to: '/',
      search: (previous) => ({ ...previous, q: term, page: 1 }),
    })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-5 px-4 sm:px-6 lg:px-[30px]">
        <Link to="/" className="shrink-0 text-xl font-bold tracking-[0.12em] text-content">
          KURI<span className="text-accent">Ó</span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-xs font-bold tracking-wider text-content-muted uppercase hover:text-accent">
            Explorar
          </Link>
          <Link
            to="/"
            search={{ collections: 'colecionaveis', page: 1 }}
            className="text-xs font-bold tracking-wider text-content-muted uppercase hover:text-accent"
          >
            Coleções
          </Link>
          <Link to="/sobre" className="text-xs font-bold tracking-wider text-content-muted uppercase hover:text-accent">
            Sobre
          </Link>
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <Search aria-hidden="true" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar NFTs"
              aria-label="Buscar NFTs"
              className="h-9 w-full rounded-sm border border-line bg-surface pr-3 pl-9 text-xs placeholder:text-content-subtle focus:border-accent focus:outline-none"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {isAuthenticated ? (
            <Link
              to="/perfil"
              className="hidden rounded-sm border border-accent px-4 py-2 text-xs font-bold text-accent hover:bg-accent hover:text-ink sm:inline-flex"
            >
              {user?.displayName?.split(' ')[0] ?? 'Perfil'}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAuth}
              className="hidden rounded-sm border border-accent px-4 py-2 text-xs font-bold text-accent hover:bg-accent hover:text-ink sm:inline-flex"
            >
              Entrar
            </button>
          )}

          <Link
            to="/carrinho"
            aria-label={`Carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`}
            className="relative rounded-sm p-2 text-content hover:text-accent"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-ink">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-sm p-2 text-content md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'border-t border-line bg-surface px-4 py-3 md:hidden',
          menuOpen ? 'block' : 'hidden',
        )}
      >
        <form onSubmit={submitSearch} className="mb-3">
          <div className="relative">
            <Search aria-hidden="true" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar NFTs"
              aria-label="Buscar NFTs"
              className="h-10 w-full rounded-sm border border-line bg-ink pl-9 text-sm focus:border-accent focus:outline-none"
            />
          </div>
        </form>
        <nav aria-label="Navegação mobile" className="flex flex-col gap-3 text-sm">
          <Link to="/" onClick={() => setMenuOpen(false)}>Explorar</Link>
          <Link to="/perfil" onClick={() => setMenuOpen(false)}>Perfil</Link>
          <Link to="/carteiras" onClick={() => setMenuOpen(false)}>Carteiras</Link>
          <Link to="/pedidos" onClick={() => setMenuOpen(false)}>Meus pedidos</Link>
          {!isAuthenticated && (
            <Link
              to="/entrar"
              search={{ redirect: undefined }}
              onClick={() => setMenuOpen(false)}
            >
              Entrar / Criar conta
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

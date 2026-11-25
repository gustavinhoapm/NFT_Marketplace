import { Link } from '@tanstack/react-router'
import { Heart, Home, ShoppingBag, User } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'

export function MobileNav() {
  const { data: cart } = useCart()
  const { isAuthenticated } = useAuth()
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        <Link to="/" className="flex flex-col items-center gap-1 text-[10px] text-content-muted hover:text-accent">
          <Home className="h-5 w-5" />
          Início
        </Link>
        <Link
          to="/"
          search={{ collections: 'arte-digital', page: 1 }}
          className="flex flex-col items-center gap-1 text-[10px] text-content-muted hover:text-accent"
        >
          <Heart className="h-5 w-5" />
          Explorar
        </Link>

        <Link
          to="/carrinho"
          aria-label={`Carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`}
          className="relative -mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-ink bg-accent text-ink shadow-lg"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-content px-1 text-[10px] font-bold text-ink">
              {count}
            </span>
          )}
        </Link>

        <Link
          to={isAuthenticated ? '/perfil' : '/entrar'}
          className="flex flex-col items-center gap-1 text-[10px] text-content-muted hover:text-accent"
        >
          <User className="h-5 w-5" />
          Perfil
        </Link>
      </div>
    </nav>
  )
}

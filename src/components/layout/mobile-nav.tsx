import { Link } from '@tanstack/react-router'
import { Heart, Home, ScanLine, ShoppingCart, UserRound } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'
import { cn } from '@/lib/utils'

/** Bottom nav do frame mobile, com o FAB central de carteiras. */
export function MobileNav() {
  const { data: cart } = useCart()
  const { isAuthenticated } = useAuth()
  const count = (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)

  const itemClass = 'flex h-8 w-8 items-center justify-center text-content-muted hover:text-accent'

  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-8">
        <Link to="/" aria-label="Início" className={itemClass}>
          <Home className="h-5 w-5" />
        </Link>
        <Link to="/" search={{ fav: '1', page: 1 }} aria-label="Meus favoritos" className={itemClass}>
          <Heart className="h-5 w-5" />
        </Link>
        <Link
          to="/carteiras"
          aria-label="Carteiras"
          className={cn(
            '-mt-10 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-ink shadow-lg',
          )}
        >
          <ScanLine className="h-5 w-5" />
        </Link>
        <Link
          to="/carrinho"
          aria-label={`Carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`}
          className={cn(itemClass, 'relative')}
        >
          <ShoppingCart className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-ink">
              {count}
            </span>
          )}
        </Link>
        <Link
          to={isAuthenticated ? '/perfil' : '/entrar'}
          search={isAuthenticated ? {} : { redirect: undefined }}
          aria-label="Perfil"
          className={itemClass}
        >
          <UserRound className="h-5 w-5" />
        </Link>
      </div>
    </nav>
  )
}

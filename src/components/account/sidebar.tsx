import { Link, useNavigate } from '@tanstack/react-router'
import {
  CircleUser,
  Download,
  Heart,
  LogOut,
  MapPin,
  PenSquare,
  ShoppingBag,
  TriangleAlert,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useLogout } from '@/hooks/use-auth'

const ITEMS = [
  { label: 'Dados do perfil', to: '/perfil', search: {}, Icon: CircleUser, area: null },
  { label: 'Carteiras', to: '/carteiras', search: {}, Icon: MapPin, area: null },
  { label: 'Atividade', to: '/em-breve', search: { area: 'atividade' }, Icon: ShoppingBag, area: 'atividade' },
  { label: 'Lista de interesse', to: '/', search: { fav: '1', page: 1 }, Icon: Heart, area: null },
  { label: 'Ofertas', to: '/em-breve', search: { area: 'ofertas' }, Icon: PenSquare, area: 'ofertas' },
  { label: 'Arquivos baixados', to: '/em-breve', search: { area: 'downloads' }, Icon: Download, area: 'downloads' },
  { label: 'Suporte', to: '/em-breve', search: { area: 'suporte' }, Icon: TriangleAlert, area: 'suporte' },
] as const

/** Sidebar "Meu perfil" dos frames de perfil e carteiras. */
export function AccountSidebar({ active }: { active: 'perfil' | 'carteiras' }) {
  const navigate = useNavigate()
  const logout = useLogout()

  return (
    <aside className="hidden rounded-md bg-surface lg:block">
      <h2 className="px-5 pt-6 pb-4 text-sm font-bold tracking-wide">Meu perfil</h2>
      <nav aria-label="Seções da conta">
        <ul>
          {ITEMS.map((item) => {
            const isActive =
              (active === 'perfil' && item.to === '/perfil') ||
              (active === 'carteiras' && item.to === '/carteiras')
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  search={item.search}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 border-l-2 px-5 py-3 text-xs',
                    isActive
                      ? 'border-accent bg-coffee/40 font-bold text-accent'
                      : 'border-transparent text-accent/80 hover:bg-coffee/30 hover:text-accent',
                  )}
                >
                  <item.Icon aria-hidden="true" className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <button
        type="button"
        onClick={() =>
          logout.mutate(undefined, { onSuccess: () => window.location.assign('/') })
        }
        className="flex w-full items-center gap-3 border-t border-line px-5 py-3 text-xs font-bold text-accent hover:bg-coffee/30"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        Sair
      </button>
    </aside>
  )
}

/** Versão mobile: botão de sair ao final do conteúdo. */
export function AccountMobileFooter() {
  const logout = useLogout()
  return (
    <button
      type="button"
      onClick={() => logout.mutate(undefined, { onSuccess: () => window.location.assign('/') })}
      className="mt-8 flex items-center gap-2 text-xs font-bold text-accent hover:underline lg:hidden"
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      Sair da conta
    </button>
  )
}

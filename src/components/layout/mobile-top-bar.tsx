import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Top bar dos frames mobile: botão de voltar circular, título centralizado e
 * slot de ação à direita (favorito, por exemplo).
 */
export function MobileTopBar({ title, right }: { title: string; right?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-ink/95 px-4 backdrop-blur md:hidden">
      <button
        type="button"
        aria-label="Voltar"
        onClick={() => void navigate({ to: '/' })}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-content-muted hover:text-content"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <h1 className="flex-1 text-center text-sm font-bold tracking-wide">{title}</h1>
      <div className="flex h-9 w-9 items-center justify-center">{right}</div>
    </div>
  )
}

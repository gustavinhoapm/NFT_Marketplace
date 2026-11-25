import { useState } from 'react'

import { cn } from '@/lib/utils'

import { AuthForm, type AuthMode } from './auth-form'
import { Dialog } from './ui/dialog'

/**
 * Modal de autenticação do frame desktop: abas "Entrar | Criar conta" sobre a
 * página atual. No mobile as rotas /entrar e /cadastro usam página cheia.
 */
export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title=""
      className="max-w-md"
    >
      <div role="tablist" aria-label="Autenticação" className="flex items-center justify-center gap-2 text-sm">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          onClick={() => setMode('login')}
          className={cn('font-bold', mode === 'login' ? 'text-accent' : 'text-content-muted hover:text-content')}
        >
          Entrar
        </button>
        <span aria-hidden="true" className="text-line">|</span>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          onClick={() => setMode('register')}
          className={cn('font-bold', mode === 'register' ? 'text-accent' : 'text-content-muted hover:text-content')}
        >
          Criar conta
        </button>
      </div>
      <p className="mt-4 mb-6 text-center text-xs text-content-muted">
        Entre para gerenciar sua carteira, coleção e perfil de criador.
      </p>
      <AuthForm mode={mode} onSuccess={() => onOpenChange(false)} />
    </Dialog>
  )
}

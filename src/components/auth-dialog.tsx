import { useState } from 'react'

import { AuthForm, type AuthMode } from './auth-form'
import { Dialog } from './ui/dialog'

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
      title={mode === 'login' ? 'Entrar na KURIÓ' : 'Criar sua conta'}
      description={
        mode === 'login'
          ? 'Acesse sua coleção, favoritos e carrinho.'
          : 'Junte-se à comunidade de colecionadores.'
      }
    >
      <AuthForm mode={mode} onSuccess={() => onOpenChange(false)} />

      <p className="mt-5 text-center text-xs text-content-muted">
        {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
        <button
          type="button"
          className="font-bold text-accent hover:underline"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Cadastre-se' : 'Entre'}
        </button>
      </p>
    </Dialog>
  )
}

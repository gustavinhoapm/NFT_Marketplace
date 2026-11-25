import { createContext, useContext, useState, type ReactNode } from 'react'

import { AuthDialog } from './auth-dialog'

interface AuthUi {
  openAuth: () => void
}

const AuthUiContext = createContext<AuthUi>({ openAuth: () => {} })

export function useAuthUi(): AuthUi {
  return useContext(AuthUiContext)
}

/** Fica fora do Router para que qualquer tela possa abrir o modal de login. */
export function AuthUiProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <AuthUiContext.Provider value={{ openAuth: () => setOpen(true) }}>
      {children}
      <AuthDialog open={open} onOpenChange={setOpen} />
    </AuthUiContext.Provider>
  )
}

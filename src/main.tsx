import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/globals.css'

import { AuthUiProvider } from './components/auth-ui'
import { queryClient } from './lib/query-client'
import { startMockServer } from './mocks/browser'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found in index.html')
}

async function bootstrap(): Promise<void> {
  /**
   * O MSW precisa patchear `globalThis.WebSocket` ANTES de o
   * `socket.io-client` ser avaliado: o engine.io-client captura o construtor
   * (`const WebSocketCtor = globalThis.WebSocket`) no escopo do módulo.
   * Por isso o router (e toda a cadeia que importa o socket) entra por import
   * dinâmico, depois de `startMockServer()`.
   */
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'false') {
    await startMockServer()
  }

  const { router } = await import('./router')

  createRoot(rootElement!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthUiProvider>
          <RouterProvider router={router} />
        </AuthUiProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()

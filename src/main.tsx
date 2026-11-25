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

/**
 * Casca de primeiro paint: skeletons com a mesma geometria do conteúdo,
 * renderizados imediatamente enquanto o worker do MSW registra. Melhora FCP/LCP
 * sem inventar dados (nenhum conteúdo real é exibido antes da API).
 */
function renderBootShell(): void {
  rootElement!.innerHTML = `
    <div style="min-height:100vh;background:#140d0a">
      <div style="height:56px;border-bottom:1px solid #3f2319"></div>
      <div style="max-width:1200px;margin:0 auto;padding:24px 16px">
        <div style="height:16px;width:180px;background:#38220f;border-radius:4px;animation:pulse 1.4s ease-in-out infinite"></div>
        <div style="height:36px;width:min(420px,80%);margin-top:16px;background:#38220f;border-radius:4px;animation:pulse 1.4s ease-in-out infinite"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:20px;margin-top:32px">
          ${Array.from({ length: 6 })
            .map(
              () =>
                '<div style="aspect-ratio:1;background:#241612;border-radius:8px;animation:pulse 1.4s ease-in-out infinite"></div>',
            )
            .join('')}
        </div>
      </div>
      <style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}</style>
    </div>`
}

async function bootstrap(): Promise<void> {
  renderBootShell()

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

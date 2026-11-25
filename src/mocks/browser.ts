import { setupWorker } from 'msw/browser'

import { installDevtools } from './devtools'
import { restHandlers } from './handlers/rest'
import { socketHandler } from './handlers/socket'

export const worker = setupWorker(...restHandlers, socketHandler)

/**
 * Habilitado por padrão também no build de produção (demo no Vercel).
 * Desativar com `VITE_ENABLE_MOCKS=false` para apontar uma API real.
 */
export async function startMockServer(): Promise<void> {
  await worker.start({
    quiet: true,
    onUnhandledRequest: (request, print) => {
      const path = new URL(request.url).pathname
      // Módulos e assets servidos pelo Vite não passam pela API simulada.
      if (
        path.startsWith('/assets/') ||
        path.startsWith('/src/') ||
        path.startsWith('/node_modules/') ||
        path.startsWith('/@') ||
        path === '/mockServiceWorker.js'
      ) {
        return
      }
      print.warning()
    },
  })
  installDevtools()
}

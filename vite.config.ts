import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Porta padrão compartilhada entre dev local e o webServer do Playwright.
    port: 5173,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          tanstack: ['@tanstack/react-query', '@tanstack/react-router'],
          /**
           * socket.io-client NÃO pode entrar neste chunk: ele captura
           * `globalThis.WebSocket` na avaliação do módulo, e o chunk de mocks
           * é carregado antes de `worker.start()` patchear o global.
           */
          mocks: ['msw', '@mswjs/socket.io-binding'],
        },
      },
    },
  },
})

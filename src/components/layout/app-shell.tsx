import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'

import { useAuthUi } from '@/components/auth-ui'
import { useRealtime } from '@/hooks/use-realtime'

import { MobileNav } from './mobile-nav'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

export function AppShell() {
  const { openAuth } = useAuthUi()
  useRealtime()

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <SiteHeader onAuth={openAuth} />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileNav />
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: '!bg-surface !border-line !text-content',
            description: '!text-content-muted',
          },
        }}
      />
    </div>
  )
}

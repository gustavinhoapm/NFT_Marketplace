import { createRoute, Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

import { rootRoute } from './root-route'

export const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sobre',
  component: AboutPage,
})

function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold tracking-[0.28em] text-accent uppercase">Sobre a KURIÓ</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">Arte, posse e comunidade.</h1>
      <p className="mt-5 text-sm leading-relaxed text-content-muted">
        A KURIÓ é um marketplace de NFTs onde criadores publicam edições limitadas e
        colecionadores constroem suas coleções. Esta é uma demonstração técnica: o
        catálogo, o carrinho, os pedidos e os eventos em tempo real são fornecidos por
        uma API simulada na camada de rede.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-content-muted">
        Todos os valores em ETH são exibidos como texto decimal e calculados pelo
        servidor. Nenhuma confirmação de compra acontece no navegador.
      </p>
      <Link to="/" className="mt-8 inline-block">
        <Button>Explorar o catálogo</Button>
      </Link>
    </main>
  )
}

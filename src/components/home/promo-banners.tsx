import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

/** Banners promocionais do frame: levam a recortes reais do catálogo. */
const BANNERS = [
  {
    id: 'genesis',
    image: '/assets/nft/ape-sunglasses.jpg',
    title: 'Lançamentos gênesis de edição limitada',
    text: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    search: { collections: 'generativa', tab: 'new' as const, page: 1 },
  },
  {
    id: 'selecao',
    image: '/assets/nft/chimp-blazer.jpg',
    title: 'Arte digital selecionada e muito mais',
    text: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura digital.',
    search: { collections: 'arte-digital', page: 1 },
  },
]

export function PromoBanners() {
  return (
    <section aria-label="Destaques promocionais" className="mx-auto grid max-w-[1200px] gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-[30px]">
      {BANNERS.map((banner) => (
        <article
          key={banner.id}
          className="grid overflow-hidden rounded-md border border-line bg-surface sm:grid-cols-[220px_1fr]"
        >
          <img src={banner.image} alt="" className="h-40 w-full object-cover sm:h-full" />
          <div className="flex flex-col justify-center p-6">
            <h2 className="text-sm leading-relaxed font-bold tracking-wide">{banner.title}</h2>
            <p className="mt-3 text-[11px] leading-relaxed text-content-muted">{banner.text}</p>
            <Link
              to="/"
              search={banner.search}
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-sm bg-accent px-4 py-2 text-[11px] font-bold text-ink hover:bg-accent-hover"
            >
              Explorar <ArrowRight aria-hidden="true" className="h-3 w-3" />
            </Link>
          </div>
        </article>
      ))}
    </section>
  )
}

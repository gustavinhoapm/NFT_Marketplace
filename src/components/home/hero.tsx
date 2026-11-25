import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

import type { NftListItem } from '@/contracts/nft'
import { cn } from '@/lib/utils'

/**
 * Hero do frame desktop/mobile. No mobile vira um card de superfície com a
 * arte à direita e uma miniatura sobreposta; os pontos trocam o destaque
 * (carrossel real, sem autoplay, para respeitar movimento reduzido).
 */
export function Hero({
  highlights,
  onExplore,
}: {
  highlights: NftListItem[]
  onExplore: () => void
}) {
  const [index, setIndex] = useState(0)
  const slides = highlights.slice(0, 3)
  const active = slides[index] ?? slides[0]
  const secondary = slides[(index + 1) % Math.max(slides.length, 1)]

  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto max-w-[1200px] px-4 pt-4 pb-6 sm:px-6 lg:px-[30px] lg:pt-10 lg:pb-10"
    >
      <div className="grid gap-6 rounded-lg bg-surface p-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:bg-transparent lg:p-0">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-content-muted lg:text-[11px]">
            Bem-vindo à Kurio
          </p>
          <h1
            id="hero-title"
            className="mt-3 text-xl leading-[1.4] font-bold tracking-[0.06em] lg:mt-4 lg:text-[40px] lg:leading-[58px]"
          >
            <span className="hidden lg:inline">
              SEJA DONO DO FUTURO
              <br />
              DA ARTE DIGITAL
            </span>
            <span className="lg:hidden">
              SEJA DONO DA
              <br />
              CULTURA DIGITAL
            </span>
          </h1>
          <p className="mt-4 max-w-md text-[11px] leading-relaxed text-content-muted lg:text-xs">
            Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione
            arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-accent px-6 py-3 text-[11px] font-bold tracking-[0.14em] text-ink uppercase hover:bg-accent-hover"
          >
            Explorar
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative">
          <div className="relative ml-auto w-40 overflow-hidden rounded-lg bg-cream sm:w-56 lg:w-full">
            {active ? (
              <img
                src={active.imageUrl}
                alt={`NFT em destaque: ${active.name}`}
                className="aspect-square w-full object-cover lg:aspect-[5/4]"
              />
            ) : (
              <div className="aspect-square w-full animate-pulse bg-coffee lg:aspect-[5/4]" />
            )}
            {secondary && (
              <img
                src={secondary.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute -bottom-3 -left-6 hidden h-20 w-16 rounded-md border border-line object-cover sm:block"
              />
            )}
          </div>
          {slides.length > 1 && (
            <div
              className="mt-4 flex justify-center gap-2 lg:mt-3 lg:justify-start"
              role="tablist"
              aria-label="Destaques"
            >
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === index}
                  aria-label={`Destaque ${slideIndex + 1}: ${slide.name}`}
                  onClick={() => setIndex(slideIndex)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    slideIndex === index ? 'bg-accent' : 'bg-line hover:bg-accent-muted',
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

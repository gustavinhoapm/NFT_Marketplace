import { useEffect, useState } from 'react'

import type { NftFacets } from '@/contracts/nft'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

import { Button } from '../ui/button'

export interface SidebarFilters {
  collections: string[]
  networks: string[]
  min?: string
  max?: string
}

/**
 * Sidebar de filtros do frame desktop: coleções, faixa de preço com slider
 * duplo (aplicação explícita via "Aplicar") e redes. Tudo escreve na URL.
 */
export function CatalogSidebar({
  facets,
  value,
  onChange,
}: {
  facets: NftFacets
  value: SidebarFilters
  onChange: (patch: Partial<SidebarFilters>) => void
}) {
  const rangeMin = Number(facets.priceRange.minEth)
  const rangeMax = Number(facets.priceRange.maxEth)
  const [min, setMin] = useState(value.min ?? String(rangeMin))
  const [max, setMax] = useState(value.max ?? String(rangeMax))

  useEffect(() => {
    setMin(value.min ?? String(rangeMin))
    setMax(value.max ?? String(rangeMax))
  }, [value.min, value.max, rangeMin, rangeMax])

  const step = 0.01
  const dirty = min !== (value.min ?? String(rangeMin)) || max !== (value.max ?? String(rangeMax))

  function toggle(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
  }

  return (
    <aside aria-label="Filtros do catálogo" className="space-y-6">
      <div className="rounded-md border border-line bg-surface p-5">
        <h2 className="text-sm font-bold tracking-wide">Coleções</h2>
        <ul className="mt-4 space-y-2.5">
          {facets.collections.map((facet) => {
            const active = value.collections.includes(facet.id)
            return (
              <li key={facet.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ collections: toggle(value.collections, facet.id) })}
                  className={cn(
                    'flex w-full items-center justify-between text-xs transition-colors',
                    active ? 'font-bold text-accent' : 'text-sand hover:text-accent',
                  )}
                >
                  <span>{facet.label}</span>
                  <span className="text-tan">({facet.count})</span>
                </button>
              </li>
            )
          })}
        </ul>

        <h2 className="mt-7 text-sm font-bold tracking-wide">Faixa de preço</h2>
        <div className="mt-4 space-y-3">
          <div className="relative h-6">
            <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-line" />
            <div
              className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-accent"
              style={{
                left: `${rangeMax > rangeMin ? ((Number(min) - rangeMin) / (rangeMax - rangeMin)) * 100 : 0}%`,
                right: `${rangeMax > rangeMin ? ((rangeMax - Number(max)) / (rangeMax - rangeMin)) * 100 : 0}%`,
              }}
            />
            <input
              type="range"
              aria-label="Preço mínimo em ETH"
              min={rangeMin}
              max={rangeMax}
              step={step}
              value={Number(min)}
              onChange={(event) => setMin(String(Math.min(Number(event.target.value), Number(max))))}
              className="pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
            />
            <input
              type="range"
              aria-label="Preço máximo em ETH"
              min={rangeMin}
              max={rangeMax}
              step={step}
              value={Number(max)}
              onChange={(event) => setMax(String(Math.max(Number(event.target.value), Number(min))))}
              className="pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
            />
          </div>
          <p className="text-[11px] text-content-muted">
            Preço: {formatEth(min)} - {formatEth(max)} ETH
          </p>
          <Button
            size="sm"
            disabled={!dirty}
            onClick={() => onChange({ min, max })}
          >
            Aplicar
          </Button>
        </div>

        <h2 className="mt-7 text-sm font-bold tracking-wide">Rede</h2>
        <ul className="mt-4 space-y-2.5">
          {facets.networks.map((facet) => {
            const active = value.networks.includes(facet.id)
            return (
              <li key={facet.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ networks: toggle(value.networks, facet.id) })}
                  className={cn(
                    'flex w-full items-center justify-between text-xs capitalize transition-colors',
                    active ? 'font-bold text-accent' : 'text-sand hover:text-accent',
                  )}
                >
                  <span>{facet.id}</span>
                  <span className="text-tan">({facet.count})</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

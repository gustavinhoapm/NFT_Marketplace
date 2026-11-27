import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

import { CatalogSidebar, type SidebarFilters } from '@/components/home/catalog-sidebar'
import { Hero } from '@/components/home/hero'
import { Journal } from '@/components/home/journal'
import { PromoBanners } from '@/components/home/promo-banners'
import { NftCard } from '@/components/nft-card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { Network } from '@/contracts/common'
import {
  NFT_SEGMENT_LABELS,
  NFT_SEGMENTS,
  NFT_SORT_LABELS,
  NFT_SORTS,
  type CollectionId,
  type NftListQuery,
  type NftRarity,
  type NftSegment,
  type NftSort,
} from '@/contracts/nft'
import { errorMessage } from '@/lib/api-error'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'
import { useAuthUi } from '@/components/auth-ui'
import { useAuth } from '@/hooks/use-auth'
import { useNfts, useToggleFavorite } from '@/hooks/use-catalog'

import { csv, validateCatalogSearch, type CatalogSearch } from './catalog-search'
import { rootRoute } from './root-route'

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: validateCatalogSearch,
  component: HomePage,
})

function HomePage() {
  const search = homeRoute.useSearch()
  const navigate = useNavigate({ from: '/' })
  const { openAuth } = useAuthUi()
  const { isAuthenticated } = useAuth()
  const toggleFavorite = useToggleFavorite()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [term, setTerm] = useState(search.q ?? '')

  useEffect(() => setTerm(search.q ?? ''), [search.q])
  useEffect(() => {
    if (term === (search.q ?? '')) return
    const timer = window.setTimeout(() => update({ q: term || undefined }), 350)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  function update(patch: Partial<CatalogSearch>) {
    void navigate({
      search: (previous) => {
        const page = patch.page ?? 1
        return {
          ...previous,
          ...patch,
          // page=1 não polui a URL; filtros novos reiniciam a paginação.
          page: page > 1 ? page : undefined,
        }
      },
    })
  }

  const segment: NftSegment = search.tab ?? 'all'
  const query: NftListQuery = {
    search: search.q,
    collections: csv<CollectionId>(search.collections),
    networks: csv<Network>(search.networks),
    rarity: csv<NftRarity>(search.rarity),
    priceMin: search.min,
    priceMax: search.max,
    segment,
    onlyFavorites: search.fav === '1',
    sort: search.sort ?? 'recent',
    page: search.page ?? 1,
    pageSize: 9,
  }

  const { data, isPending, isError, error, isFetching, refetch } = useNfts(query)
  const featured = data?.items.find((item) => item.compareAtPriceEth) ?? data?.items[0]

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    update({ q: term || undefined })
  }

  function setFilters(patch: Partial<SidebarFilters>) {
    update({
      collections: patch.collections?.length ? patch.collections.join(',') : undefined,
      networks: patch.networks?.length ? patch.networks.join(',') : undefined,
      min: patch.min,
      max: patch.max,
    })
  }

  const sidebar = data && (
    <CatalogSidebar
      facets={data.facets}
      value={{
        collections: csv(search.collections),
        networks: csv(search.networks),
        min: search.min,
        max: search.max,
      }}
      onChange={setFilters}
    />
  )

  return (
    <>
      {/* Busca mobile + atalho de filtros, como no frame mobile */}
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 pt-4 sm:px-6 lg:hidden">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search aria-hidden="true" className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-content-subtle" />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Explorar coleções"
            aria-label="Buscar NFTs"
            className="h-12 w-full rounded-md border border-line bg-surface pr-4 pl-11 text-xs placeholder:text-content-subtle focus:border-accent focus:outline-none"
          />
        </form>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-label="Abrir filtros"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent text-ink"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <Hero
        highlights={data?.items ?? []}
        onExplore={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
      />

      <section id="catalogo" className="mx-auto max-w-[1200px] px-4 pb-10 sm:px-6 lg:px-[30px]">
        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          <div className="hidden lg:block">
            {isPending ? <Skeleton className="h-96 w-full" /> : sidebar}

            {featured && (
              <div className="mt-6 overflow-hidden rounded-md border border-line bg-surface">
                <p className="px-4 pt-3 text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
                  NFT em destaque
                </p>
                <p className="px-4 pt-1 pb-2 text-[11px] font-bold tracking-[0.14em] uppercase">
                  Oferta limitada
                </p>
                <Link to="/nft/$nftId" params={{ nftId: featured.id }} className="block">
                  <img
                    src={featured.imageUrl}
                    alt={`NFT em destaque: ${featured.name}`}
                    className="aspect-square w-full object-cover"
                  />
                </Link>
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <div role="tablist" aria-label="Segmentos do catálogo" className="flex gap-5 overflow-x-auto">
                {NFT_SEGMENTS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={segment === id}
                    onClick={() => update({ tab: id === 'all' ? undefined : id })}
                    className={cn(
                      'shrink-0 border-b-2 pb-2 text-xs tracking-wide whitespace-nowrap',
                      segment === id
                        ? 'border-accent font-bold text-accent'
                        : 'border-transparent text-content-muted hover:text-content',
                    )}
                  >
                    {NFT_SEGMENT_LABELS[id]}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-[11px] text-content-muted">
                Ordenar por:
                <Select
                  aria-label="Ordenar catálogo"
                  className="h-8 w-auto border-none bg-transparent pr-8 text-[11px] text-content"
                  value={search.sort ?? 'recent'}
                  onChange={(event) => update({ sort: event.target.value as NftSort })}
                >
                  {NFT_SORTS.map((id) => (
                    <option key={id} value={id} className="bg-surface">
                      {NFT_SORT_LABELS[id]}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            {isError ? (
              <div role="alert" className="mt-8 rounded-md border border-danger/40 bg-danger/10 p-8 text-center">
                <p className="font-bold text-danger">Não foi possível carregar o catálogo.</p>
                <p className="mt-2 text-sm text-content-muted">{errorMessage(error)}</p>
                <Button variant="outline" className="mt-5" onClick={() => void refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : isPending ? (
              <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className={index % 2 === 1 ? 'max-lg:mt-10' : ''}>
                    <Skeleton className="aspect-square w-full rounded-md" />
                    <Skeleton className="mt-3 h-3 w-2/3" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                  </div>
                ))}
              </div>
            ) : data && data.items.length === 0 ? (
              <div className="mt-8 rounded-md border border-line bg-surface p-12 text-center">
                <p className="text-lg font-bold">Nenhum NFT encontrado</p>
                <p className="mt-2 text-sm text-content-muted">
                  {search.fav === '1' && !isAuthenticated
                    ? 'Entre para ver seus favoritos.'
                    : 'Tente ajustar os filtros ou a busca.'}
                </p>
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    if (search.fav === '1' && !isAuthenticated) openAuth()
                    else void navigate({ search: { sort: search.sort } })
                  }}
                >
                  {search.fav === '1' && !isAuthenticated ? 'Entrar' : 'Limpar filtros'}
                </Button>
              </div>
            ) : (
              <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
                <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-3">
                  {data?.items.map((nft, index) => (
                    <div key={nft.id} className={index % 2 === 1 ? 'max-lg:mt-10' : ''}>
                      <NftCard
                        nft={nft}
                        mobileExtras
                        favoritePending={toggleFavorite.isPending}
                        onFavorite={(favorite) => {
                          if (!isAuthenticated) {
                            openAuth()
                            return
                          }
                          toggleFavorite.mutate({ nftId: nft.id, favorite })
                        }}
                      />
                    </div>
                  ))}
                </div>

                {data && data.totalPages > 1 && (
                  <nav aria-label="Paginação" className="mt-10 flex items-center justify-end gap-2">
                    <Pagination
                      page={data.page}
                      totalPages={data.totalPages}
                      onChange={(page) => update({ page })}
                    />
                  </nav>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <PromoBanners />
      <Journal />

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen} title="Filtros">
        {isPending ? <Skeleton className="h-64 w-full" /> : sidebar}
        {featured && (
          <p className="mt-4 text-[11px] text-content-subtle">
            Destaque: {featured.name} · {formatEth(featured.priceEth)} ETH
          </p>
        )}
      </Dialog>
    </>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 8)
  return (
    <>
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-content-muted disabled:opacity-40"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          aria-current={number === page ? 'page' : undefined}
          onClick={() => onChange(number)}
          className={cn(
            'h-8 w-8 rounded-sm border text-xs font-bold',
            number === page
              ? 'border-accent bg-accent text-ink'
              : 'border-line text-content-muted hover:border-accent-muted',
          )}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        aria-label="Próxima página"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-content-muted disabled:opacity-40"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </>
  )
}

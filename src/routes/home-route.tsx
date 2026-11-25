import { createRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

import { NftCard } from '@/components/nft-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { Network } from '@/contracts/common'
import {
  NFT_SORT_LABELS,
  NFT_SORTS,
  RARITY_LABELS,
  type CollectionId,
  type NftListQuery,
  type NftRarity,
  type NftSort,
} from '@/contracts/nft'
import { useAuthUi } from '@/components/auth-ui'
import { errorMessage } from '@/lib/api-error'
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
      search: (previous) => ({ ...previous, ...patch, page: patch.page ?? 1 }),
    })
  }

  const query: NftListQuery = {
    search: search.q,
    collections: csv<CollectionId>(search.collections),
    networks: csv<Network>(search.networks),
    rarity: csv<NftRarity>(search.rarity),
    priceMin: search.min,
    priceMax: search.max,
    sort: search.sort ?? 'recent',
    page: search.page ?? 1,
    pageSize: 9,
  }

  const { data, isPending, isError, error, isFetching, refetch } = useNfts(query)
  const hasFilters = Boolean(
    search.q || search.collections || search.networks || search.rarity || search.min || search.max,
  )

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    update({ q: term || undefined })
  }

  function clearFilters() {
    setTerm('')
    void navigate({ search: { sort: search.sort } })
  }

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-coffee/60 to-ink">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-[30px] lg:py-24">
          <div>
            <p className="text-xs font-bold tracking-[0.28em] text-accent uppercase">
              Marketplace de arte digital
            </p>
            <h1 className="mt-5 text-4xl leading-[1.15] font-bold tracking-tight sm:text-5xl lg:text-[43px] lg:leading-[70px]">
              SEJA DONO DA{' '}
              <span className="text-accent">CULTURA DIGITAL</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-content-muted">
              Descubra NFTs selecionados de criadores emergentes e consagrados.
              Colecione arte rara, apoie artistas e tenha uma parte da cultura da internet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() =>
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Explorar NFTs <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Ver coleções
              </Button>
            </div>
          </div>
          <div className="relative hidden aspect-square max-w-md justify-self-center lg:block">
            <img
              src="/assets/nft/emerald.svg"
              alt="NFT em destaque da coleção Kurio Editions"
              className="h-full w-full rounded-xl border border-line object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-[30px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Explore o catálogo</h2>
            <p className="mt-1 text-xs text-content-muted">
              {data ? `${data.total} ${data.total === 1 ? 'obra' : 'obras'} disponíveis` : 'Carregando…'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-accent" />
            <span className="text-xs text-content-muted">Filtros e ordenação</span>
          </div>
        </div>

        <div className="mb-8 grid gap-4 rounded-md border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
          <form onSubmit={submitSearch} className="lg:col-span-2">
            <Label htmlFor="catalog-search">Busca</Label>
            <Input
              id="catalog-search"
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Nome ou token do NFT"
            />
          </form>

          <div>
            <Label htmlFor="catalog-collection">Coleção</Label>
            <Select
              id="catalog-collection"
              value={search.collections ?? ''}
              onChange={(event) => update({ collections: event.target.value || undefined })}
            >
              <option value="">Todas</option>
              {data?.facets.collections.map((facet) => (
                <option key={facet.id} value={facet.id}>
                  {facet.label} ({facet.count})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="catalog-network">Rede</Label>
            <Select
              id="catalog-network"
              value={search.networks ?? ''}
              onChange={(event) => update({ networks: event.target.value || undefined })}
            >
              <option value="">Todas</option>
              {(data?.facets.networks ?? []).map((facet) => (
                <option key={facet.id} value={facet.id}>
                  {facet.id} ({facet.count})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="catalog-rarity">Raridade</Label>
            <Select
              id="catalog-rarity"
              value={search.rarity ?? ''}
              onChange={(event) => update({ rarity: event.target.value || undefined })}
            >
              <option value="">Todas</option>
              {(Object.keys(RARITY_LABELS) as NftRarity[]).map((id) => (
                <option key={id} value={id}>{RARITY_LABELS[id]}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="catalog-min">Preço mín. (ETH)</Label>
            <Input
              id="catalog-min"
              inputMode="decimal"
              value={search.min ?? ''}
              onChange={(event) => update({ min: event.target.value || undefined })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="catalog-max">Preço máx. (ETH)</Label>
            <Input
              id="catalog-max"
              inputMode="decimal"
              value={search.max ?? ''}
              onChange={(event) => update({ max: event.target.value || undefined })}
              placeholder="12.30"
            />
          </div>

          <div className="lg:col-span-2">
            <Label htmlFor="catalog-sort">Ordenar por</Label>
            <Select
              id="catalog-sort"
              value={search.sort ?? 'recent'}
              onChange={(event) =>
                update({ sort: event.target.value as NftSort })
              }
            >
              {NFT_SORTS.map((id) => (
                <option key={id} value={id}>{NFT_SORT_LABELS[id]}</option>
              ))}
            </Select>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-danger hover:underline"
          >
            <X className="h-3 w-3" /> Limpar filtros
          </button>
        )}

        {isError ? (
          <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-8 text-center">
            <p className="font-bold text-danger">Não foi possível carregar o catálogo.</p>
            <p className="mt-2 text-sm text-content-muted">{errorMessage(error)}</p>
            <Button variant="outline" className="mt-5" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="rounded-md border border-line bg-surface p-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="mt-4 h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/3" />
                <Skeleton className="mt-6 h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="rounded-md border border-line bg-surface p-12 text-center">
            <p className="text-lg font-bold">Nenhum NFT encontrado</p>
            <p className="mt-2 text-sm text-content-muted">
              Tente ajustar os filtros ou a busca.
            </p>
            <Button variant="outline" className="mt-5" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data?.items.map((nft) => (
                <NftCard
                  key={nft.id}
                  nft={nft}
                  favoritePending={toggleFavorite.isPending}
                  onFavorite={(favorite) => {
                    if (!isAuthenticated) {
                      openAuth()
                      return
                    }
                    toggleFavorite.mutate({ nftId: nft.id, favorite })
                  }}
                />
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={data.page <= 1}
                  onClick={() => update({ page: data.page - 1 })}
                >
                  Anterior
                </Button>
                <span className="text-xs text-content-muted">
                  Página {data.page} de {data.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={data.page >= data.totalPages}
                  onClick={() => update({ page: data.page + 1 })}
                >
                  Próxima
                </Button>
              </nav>
            )}
          </div>
        )}
      </section>
    </>
  )
}

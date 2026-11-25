import type { LoginRequest, RegisterRequest } from '@/contracts/auth'
import type {
  AddCartItemRequest,
  ApplyCouponRequest,
  UpdateCartItemRequest,
} from '@/contracts/cart'
import type { Network } from '@/contracts/common'
import type {
  CollectionId,
  NftListQuery,
  NftRarity,
  NftSegment,
  NftSort,
} from '@/contracts/nft'
import { NFT_SEGMENTS, NFT_SORTS } from '@/contracts/nft'
import type { CreateOrderRequest, OrderStatus } from '@/contracts/order'
import type {
  ChangePasswordRequest,
  CreateWalletRequest,
  UpdateProfileRequest,
  UpdateWalletRequest,
} from '@/contracts/profile'
import type { NftUpdatedPayload } from '@/contracts/realtime'
import { http, HttpResponse, delay } from 'msw'

import { db, DomainError, getConfig, setConfig } from '../db'
import {
  bearerToken,
  errorResponse,
  guestId,
  networkGuard,
  readBody,
} from '../network'

let outOfOrderUsed = false

function optionalUser(request: Request) {
  const token = bearerToken(request)
  if (!token) return null
  return db.resolveSession(token)?.user ?? null
}

function requireUser(request: Request) {
  const user = optionalUser(request)
  if (!user) {
    throw new DomainError('unauthorized', 'Entre na sua conta para continuar.')
  }
  return user
}

async function respond(resolver: () => Response | Promise<Response>): Promise<Response> {
  try {
    const failed = await networkGuard()
    if (failed) return failed
    return await resolver()
  } catch (error) {
    return errorResponse(error)
  }
}

function csv(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : []
}

function nftQuery(request: Request): NftListQuery {
  const url = new URL(request.url)
  const rawSort = url.searchParams.get('sort') as NftSort | null
  return {
    search: url.searchParams.get('search') ?? undefined,
    collections: csv(url.searchParams.get('collections')) as CollectionId[],
    networks: csv(url.searchParams.get('networks')) as Network[],
    rarity: csv(url.searchParams.get('rarity')) as NftRarity[],
    priceMin: url.searchParams.get('priceMin') ?? undefined,
    priceMax: url.searchParams.get('priceMax') ?? undefined,
    segment: NFT_SEGMENTS.includes(
      (url.searchParams.get('segment') ?? 'all') as NftSegment,
    )
      ? (url.searchParams.get('segment') as NftSegment)
      : 'all',
    onlyFavorites: url.searchParams.get('fav') === '1',
    sort: rawSort && NFT_SORTS.includes(rawSort) ? rawSort : 'recent',
    page: Number(url.searchParams.get('page') ?? 1),
    pageSize: Number(url.searchParams.get('pageSize') ?? 9),
  }
}

export const restHandlers = [
  // ------------------------------------------------------------- autenticação

  http.post('/api/auth/login', async ({ request }) =>
    respond(async () => {
      const body = await readBody<LoginRequest>(request)
      const auth = await db.login(body.email ?? '', body.password ?? '')
      const mergedCartItems = db.mergeGuestCart(guestId(request), auth.user.id)
      return HttpResponse.json({
        session: auth.session,
        mergedCartItems,
      })
    }),
  ),

  http.post('/api/auth/register', async ({ request }) =>
    respond(async () => {
      const body = await readBody<RegisterRequest>(request)
      const auth = await db.register(
        body.username ?? '',
        body.email ?? '',
        body.password ?? '',
      )
      const mergedCartItems = db.mergeGuestCart(guestId(request), auth.user.id)
      return HttpResponse.json({ session: auth.session, mergedCartItems })
    }),
  ),

  http.get('/api/auth/session', async ({ request }) =>
    respond(() => {
      requireUser(request)
      return HttpResponse.json({ session: db.getSession(bearerToken(request)) })
    }),
  ),

  http.post('/api/auth/logout', async ({ request }) =>
    respond(() => {
      db.destroySession(bearerToken(request))
      return HttpResponse.json({ ok: true })
    }),
  ),

  // ---------------------------------------------------------------- catálogo

  http.get('/api/nfts', async ({ request }) => {
    if (getConfig().outOfOrder && !outOfOrderUsed) {
      outOfOrderUsed = true
      await delay(950)
    }
    return respond(() => {
      const user = optionalUser(request)
      const favorites = user ? db.getFavorites(user.id) : []
      return HttpResponse.json(db.listNfts(nftQuery(request), favorites))
    })
  }),

  http.get('/api/nfts/:id', async ({ params }) =>
    respond(() => {
      const { id } = params as { id: string }
      return HttpResponse.json(db.getNft(id))
    }),
  ),

  // ---------------------------------------------------------------- favoritos

  http.get('/api/favorites', async ({ request }) =>
    respond(() => {
      const user = requireUser(request)
      return HttpResponse.json({ ids: db.getFavorites(user.id) })
    }),
  ),

  http.put('/api/favorites/:nftId', async ({ request, params }) =>
    respond(() => {
      const user = requireUser(request)
      const { nftId } = params as { nftId: string }
      return HttpResponse.json({ ids: db.setFavorite(user.id, nftId, true) })
    }),
  ),

  http.delete('/api/favorites/:nftId', async ({ request, params }) =>
    respond(() => {
      const user = requireUser(request)
      const { nftId } = params as { nftId: string }
      return HttpResponse.json({ ids: db.setFavorite(user.id, nftId, false) })
    }),
  ),

  // ------------------------------------------------------------------ carrinho

  http.get('/api/cart', async ({ request }) =>
    respond(() =>
      HttpResponse.json(db.getCart(optionalUser(request)?.id ?? null, guestId(request))),
    ),
  ),

  http.post('/api/cart/items', async ({ request }) =>
    respond(async () => {
      const body = await readBody<AddCartItemRequest>(request)
      const cart = db.addCartItem(
        optionalUser(request)?.id ?? null,
        guestId(request),
        body,
      )
      return HttpResponse.json(cart)
    }),
  ),

  http.patch('/api/cart/items/:itemId', async ({ request, params }) =>
    respond(async () => {
      const body = await readBody<UpdateCartItemRequest>(request)
      const { itemId } = params as { itemId: string }
      return HttpResponse.json(
        db.updateCartItem(
          optionalUser(request)?.id ?? null,
          guestId(request),
          itemId,
          body.quantity,
        ),
      )
    }),
  ),

  http.delete('/api/cart/items/:itemId', async ({ request, params }) =>
    respond(() => {
      const { itemId } = params as { itemId: string }
      return HttpResponse.json(
        db.removeCartItem(
          optionalUser(request)?.id ?? null,
          guestId(request),
          itemId,
        ),
      )
    }),
  ),

  http.post('/api/cart/coupon', async ({ request }) =>
    respond(async () => {
      const body = await readBody<ApplyCouponRequest>(request)
      return HttpResponse.json(
        db.applyCoupon(
          optionalUser(request)?.id ?? null,
          guestId(request),
          body.code ?? '',
        ),
      )
    }),
  ),

  http.delete('/api/cart/coupon', async ({ request }) =>
    respond(() =>
      HttpResponse.json(
        db.removeCoupon(optionalUser(request)?.id ?? null, guestId(request)),
      ),
    ),
  ),

  http.post('/api/cart/refresh', async ({ request }) =>
    respond(() =>
      HttpResponse.json(
        db.refreshCartQuote(optionalUser(request)?.id ?? null, guestId(request)),
      ),
    ),
  ),

  // ------------------------------------------------------------------- pedidos

  http.post('/api/orders', async ({ request }) => {
    try {
      // O pedido é criado ANTES do guardião de rede: no cenário de timeout o
      // cliente não recebe a resposta, mas a idempotência recupera o pedido.
      const user = requireUser(request)
      const body = await readBody<CreateOrderRequest>(request)
      const headerKey = request.headers.get('Idempotency-Key')
      const key = headerKey || `${user.id}:${JSON.stringify(body)}`
      const result = db.createOrder(user.id, body, key)
      const failed = await networkGuard()
      if (failed) return failed
      return HttpResponse.json(result)
    } catch (error) {
      return errorResponse(error)
    }
  }),

  http.get('/api/orders', async ({ request }) =>
    respond(() => {
      const user = requireUser(request)
      return HttpResponse.json({ items: db.listOrders(user.id) })
    }),
  ),

  http.get('/api/orders/:id', async ({ request, params }) =>
    respond(() => {
      const user = requireUser(request)
      const { id } = params as { id: string }
      return HttpResponse.json(db.getOrder(user.id, id))
    }),
  ),

  // -------------------------------------------------------------- perfil/conta

  http.get('/api/profile', async ({ request }) =>
    respond(() => {
      const user = requireUser(request)
      return HttpResponse.json(db.getProfile(user.id))
    }),
  ),

  http.patch('/api/profile', async ({ request }) =>
    respond(async () => {
      const user = requireUser(request)
      const body = await readBody<UpdateProfileRequest>(request)
      return HttpResponse.json(db.updateProfile(user.id, body))
    }),
  ),

  http.post('/api/profile/password', async ({ request }) =>
    respond(async () => {
      const user = requireUser(request)
      const body = await readBody<ChangePasswordRequest>(request)
      await db.changePassword(
        user.id,
        body.currentPassword ?? '',
        body.newPassword ?? '',
      )
      return HttpResponse.json({ ok: true })
    }),
  ),

  // ---------------------------------------------------------------- carteiras

  http.get('/api/wallets', async ({ request }) =>
    respond(() => {
      const user = requireUser(request)
      return HttpResponse.json({ items: db.getWallets(user.id) })
    }),
  ),

  http.post('/api/wallets', async ({ request }) =>
    respond(async () => {
      const user = requireUser(request)
      const body = await readBody<CreateWalletRequest>(request)
      return HttpResponse.json(db.createWallet(user.id, body))
    }),
  ),

  http.patch('/api/wallets/:id', async ({ request, params }) =>
    respond(async () => {
      const user = requireUser(request)
      const body = await readBody<UpdateWalletRequest>(request)
      const { id } = params as { id: string }
      return HttpResponse.json(db.updateWallet(user.id, id, body))
    }),
  ),

  // ------------------------------------------------------------ cenários (M11)

  http.get('/api/mock/config', async () =>
    respond(() => HttpResponse.json(getConfig())),
  ),

  http.patch('/api/mock/config', async ({ request }) =>
    respond(async () => {
      const patch = await readBody<Partial<ReturnType<typeof getConfig>>>(request)
      outOfOrderUsed = false
      return HttpResponse.json(setConfig(patch))
    }),
  ),

  http.post('/api/mock/reset', async () =>
    respond(() => {
      db.reset()
      outOfOrderUsed = false
      return HttpResponse.json({ ok: true })
    }),
  ),

  http.post('/api/mock/nfts/:nftId/editions/:editionId', async ({ request, params }) =>
    respond(async () => {
      const { nftId, editionId } = params as { nftId: string; editionId: string }
      const body = await readBody<{
        priceEth?: string
        available?: number
        reason?: NftUpdatedPayload['reason']
      }>(request)
      const payload = db.patchEdition(
        nftId,
        editionId,
        { priceEth: body.priceEth, available: body.available },
        body.reason ?? (body.priceEth ? 'price-changed' : 'stock-changed'),
      )
      return HttpResponse.json({ payload })
    }),
  ),

  http.post('/api/mock/orders/:id/:status', async ({ request, params }) =>
    respond(() => {
      const user = requireUser(request)
      const { id, status } = params as { id: string; status: OrderStatus }
      return HttpResponse.json(db.forceOrderStatus(user.id, id, status))
    }),
  ),
]

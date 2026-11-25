import type { AuthResponse, LoginRequest, RegisterRequest, Session } from '@/contracts/auth'
import type {
  Cart,
  AddCartItemRequest,
  UpdateCartItemRequest,
} from '@/contracts/cart'
import type { Nft, NftListQuery, NftListResponse } from '@/contracts/nft'
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
} from '@/contracts/order'
import type {
  ChangePasswordRequest,
  CreateWalletRequest,
  Profile,
  UpdateProfileRequest,
  UpdateWalletRequest,
  Wallet,
} from '@/contracts/profile'

import { http } from './client'

function params(values: Record<string, string | number | string[] | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === '') continue
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','))
    } else {
      search.set(key, String(value))
    }
  }
  const result = search.toString()
  return result ? `?${result}` : ''
}

export const api = {
  auth: {
    async login(body: LoginRequest): Promise<AuthResponse> {
      const { data } = await http.post<AuthResponse>('/auth/login', body)
      return data
    },
    async register(body: RegisterRequest): Promise<AuthResponse> {
      const { data } = await http.post<AuthResponse>('/auth/register', body)
      return data
    },
    async me(): Promise<Session> {
      const { data } = await http.get<{ session: Session }>('/auth/session')
      return data.session
    },
    async logout(): Promise<void> {
      await http.post('/auth/logout')
    },
  },

  nfts: {
    async list(query: NftListQuery): Promise<NftListResponse> {
      const { data } = await http.get<NftListResponse>(
        `/nfts${params({
          search: query.search,
          collections: query.collections as string[] | undefined,
          networks: query.networks as string[] | undefined,
          rarity: query.rarity as string[] | undefined,
          priceMin: query.priceMin,
          priceMax: query.priceMax,
          sort: query.sort,
          page: query.page,
          pageSize: query.pageSize,
        })}`,
      )
      return data
    },
    async get(id: string): Promise<Nft> {
      const { data } = await http.get<Nft>(`/nfts/${id}`)
      return data
    },
  },

  favorites: {
    async list(): Promise<string[]> {
      const { data } = await http.get<{ ids: string[] }>('/favorites')
      return data.ids
    },
    async set(nftId: string, favorite: boolean): Promise<string[]> {
      const { data } = await http.request<{ ids: string[] }>({
        method: favorite ? 'PUT' : 'DELETE',
        url: `/favorites/${nftId}`,
      })
      return data.ids
    },
  },

  cart: {
    async get(): Promise<Cart> {
      const { data } = await http.get<Cart>('/cart')
      return data
    },
    async add(body: AddCartItemRequest): Promise<Cart> {
      const { data } = await http.post<Cart>('/cart/items', body)
      return data
    },
    async update(itemId: string, body: UpdateCartItemRequest): Promise<Cart> {
      const { data } = await http.patch<Cart>(`/cart/items/${itemId}`, body)
      return data
    },
    async remove(itemId: string): Promise<Cart> {
      const { data } = await http.delete<Cart>(`/cart/items/${itemId}`)
      return data
    },
    async applyCoupon(code: string): Promise<Cart> {
      const { data } = await http.post<Cart>('/cart/coupon', { code })
      return data
    },
    async removeCoupon(): Promise<Cart> {
      const { data } = await http.delete<Cart>('/cart/coupon')
      return data
    },
    async refresh(): Promise<Cart> {
      const { data } = await http.post<Cart>('/cart/refresh')
      return data
    },
  },

  orders: {
    async create(body: CreateOrderRequest, idempotencyKey: string): Promise<CreateOrderResponse> {
      const { data } = await http.post<CreateOrderResponse>('/orders', body, {
        headers: { 'Idempotency-Key': idempotencyKey },
      })
      return data
    },
    async get(id: string): Promise<Order> {
      const { data } = await http.get<Order>(`/orders/${id}`)
      return data
    },
    async list(): Promise<Order[]> {
      const { data } = await http.get<{ items: Order[] }>('/orders')
      return data.items
    },
  },

  profile: {
    async get(): Promise<Profile> {
      const { data } = await http.get<Profile>('/profile')
      return data
    },
    async update(body: UpdateProfileRequest): Promise<Profile> {
      const { data } = await http.patch<Profile>('/profile', body)
      return data
    },
    async changePassword(body: ChangePasswordRequest): Promise<void> {
      await http.post('/profile/password', body)
    },
  },

  wallets: {
    async list(): Promise<Wallet[]> {
      const { data } = await http.get<{ items: Wallet[] }>('/wallets')
      return data.items
    },
    async create(body: CreateWalletRequest): Promise<Wallet> {
      const { data } = await http.post<Wallet>('/wallets', body)
      return data
    },
    async update(id: string, body: UpdateWalletRequest): Promise<Wallet> {
      const { data } = await http.patch<Wallet>(`/wallets/${id}`, body)
      return data
    },
  },

  mock: {
    async config(): Promise<unknown> {
      const { data } = await http.get('/mock/config')
      return data
    },
    async patchConfig(patch: Record<string, unknown>): Promise<void> {
      await http.patch('/mock/config', patch)
    },
    async reset(): Promise<void> {
      await http.post('/mock/reset')
    },
  },
}

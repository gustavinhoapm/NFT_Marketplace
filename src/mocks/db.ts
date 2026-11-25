import Decimal from 'decimal.js'

import type { Session, User } from '@/contracts/auth'
import type { Cart, CartItem, CartTotals, Coupon } from '@/contracts/cart'
import type { ApiErrorCode, EthAmount, Network } from '@/contracts/common'
import {
  COLLECTIONS,
  COLLECTION_LABELS,
  type CollectionId,
  type Nft,
  type NftEdition,
  type NftListItem,
  type NftListQuery,
  type NftListResponse,
  type NftRarity,
  type NftSort,
} from '@/contracts/nft'
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  OrderStatus,
} from '@/contracts/order'
import type {
  CreateWalletRequest,
  Profile,
  UpdateProfileRequest,
  UpdateWalletRequest,
  Wallet,
} from '@/contracts/profile'
import {
  REALTIME_EVENTS,
  type NftUpdatedEvent,
  type NftUpdatedPayload,
  type OrderUpdatedEvent,
  type OrderUpdatedPayload,
  type RealtimeEventName,
} from '@/contracts/realtime'
import { compareEth, multiplyEth, toDecimal } from '@/lib/money'

import { createNftFixtures } from './fixtures/nfts'
import {
  SEED_PROFILES,
  SEED_PROFILE_OWNERSHIP,
  SEED_USERS,
  SEED_WALLET_OWNERSHIP,
  SEED_WALLETS,
  type UserRecord,
} from './fixtures/users'

/** Estado de configuração dos cenários. Lido a cada requisição. */
export interface MockConfig {
  /** Latência base, em ms, aplicada a todas as rotas. */
  latencyMs: number
  /** Latência extra aleatória, para exercitar respostas fora de ordem. */
  variableLatencyMs: number
  /** > 0 simula timeout: a resposta demora mais que o cliente e falha. */
  timeoutMs: number
  /** Simula queda de conexão (HttpResponse.error). */
  offline: boolean
  /** Probabilidade de 500 transitório (0..1). */
  failRate: number
  /** Duração da sessão em ms. */
  sessionTtlMs: number
  /** Força 401 para exercitar expiração sem esperar. */
  forceSessionExpired: boolean
  /** Pagamento recusado na transição do pedido. */
  declinePayments: boolean
  /** Catálogo vazio, para o estado vazio. */
  emptyCatalog: boolean
  /** Atraso extra na primeira listagem de catálogo (ordem de respostas). */
  outOfOrder: boolean
}

export const DEFAULT_CONFIG: MockConfig = {
  latencyMs: 160,
  variableLatencyMs: 0,
  timeoutMs: 0,
  offline: false,
  failRate: 0,
  sessionTtlMs: 30 * 60 * 1000,
  forceSessionExpired: false,
  declinePayments: false,
  emptyCatalog: false,
  outOfOrder: false,
}

const DB_KEY = 'kurio:mock-db:v1'
const CONFIG_KEY = 'kurio:mock-config:v1'
const NETWORK_FEE_ETH = '0.0042'

export class DomainError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly fieldErrors?: Record<string, string>

  constructor(
    code: ApiErrorCode,
    message: string,
    fieldErrors?: Record<string, string>,
    status?: number,
  ) {
    super(message)
    this.name = 'DomainError'
    this.code = code
    this.fieldErrors = fieldErrors
    this.status = status ?? statusForCode(code)
  }
}

function statusForCode(code: ApiErrorCode): number {
  switch (code) {
    case 'invalid_credentials':
    case 'session_expired':
    case 'unauthorized':
      return 401
    case 'forbidden':
      return 403
    case 'not_found':
      return 404
    case 'conflict':
    case 'insufficient_stock':
    case 'price_changed':
    case 'quote_stale':
    case 'idempotency_conflict':
      return 409
    case 'expired_coupon':
      return 410
    case 'payment_declined':
      return 402
    case 'validation_error':
      return 422
    case 'network_error':
    case 'timeout':
      return 504
    default:
      return 400
  }
}

interface CouponRecord extends Coupon {
  expiresAt: string | null
}

interface SessionRecord {
  token: string
  userId: string
  expiresAt: string
}

interface IdempotencyRecord {
  orderId: string
  fingerprint: string
}

export interface DbState {
  schema: number
  nfts: Nft[]
  users: UserRecord[]
  profiles: Profile[]
  wallets: Wallet[]
  sessions: Record<string, SessionRecord>
  favorites: Record<string, string[]>
  carts: Record<string, Cart>
  orders: Record<string, Order>
  coupons: CouponRecord[]
  idempotency: Record<string, IdempotencyRecord>
  eventVersions: Record<string, number>
}

export type RealtimeEvent = NftUpdatedEvent | OrderUpdatedEvent
type Listener = (event: RealtimeEvent) => void

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
}

function now(): string {
  return new Date().toISOString()
}

function roundEth(value: EthAmount): EthAmount {
  return toDecimal(value).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toFixed()
}

function emptyCart(): Cart {
  return {
    items: [],
    coupon: null,
    totals: { subtotalEth: '0', discountEth: '0', networkFeeEth: '0', totalEth: '0' },
    quoteId: uid('quote'),
    quotedAt: now(),
    stale: false,
  }
}

function seed(): DbState {
  return {
    schema: 1,
    nfts: createNftFixtures(),
    users: structuredClone(SEED_USERS),
    profiles: structuredClone(SEED_PROFILES),
    wallets: structuredClone(SEED_WALLETS),
    sessions: {},
    favorites: {
      usr_gustavo: ['nft_001', 'nft_004'],
      usr_nova: ['nft_003'],
    },
    carts: {},
    orders: {},
    coupons: [
      { code: 'KURIO10', percentOff: 10, expiresAt: null },
      { code: 'WELCOME5', percentOff: 5, expiresAt: null },
      { code: 'EXPIRED20', percentOff: 20, expiresAt: '2025-01-01T00:00:00.000Z' },
    ],
    idempotency: {},
    eventVersions: {},
  }
}

function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quotas cheias não podem derrubar o mock */
  }
}

/** Le a configuração direto do localStorage, para mudanças sem reload. */
export function getConfig(): MockConfig {
  return { ...DEFAULT_CONFIG, ...readStorage<Partial<MockConfig>>(CONFIG_KEY) }
}

export function setConfig(patch: Partial<MockConfig>): MockConfig {
  const next = { ...getConfig(), ...patch }
  writeStorage(CONFIG_KEY, next)
  return next
}

function publicUser(record: UserRecord): User {
  return {
    id: record.id,
    username: record.username,
    displayName: record.displayName,
    email: record.email,
    avatarUrl: record.avatarUrl,
    ensName: record.ensName,
  }
}

function toListItem(nft: Nft, isFavorite: boolean): NftListItem {
  const available = nft.editions.filter((edition) => edition.available > 0)
  const cheapest = available.reduce<NftEdition | null>(
    (best, edition) =>
      best === null || compareEth(edition.priceEth, best.priceEth) < 0
        ? edition
        : best,
    null,
  )
  return {
    id: nft.id,
    tokenId: nft.tokenId,
    name: nft.name,
    collectionId: nft.collectionId,
    network: nft.network,
    imageUrl: nft.imageUrl,
    rarity: nft.rarity,
    rating: nft.rating,
    priceEth: cheapest?.priceEth ?? nft.editions[0]?.priceEth ?? '0',
    compareAtPriceEth: nft.compareAtPriceEth,
    availableEditions: available.length,
    isFavorite,
    createdAt: nft.createdAt,
  }
}

function sortItems(items: NftListItem[], sort: NftSort): NftListItem[] {
  const sorted = [...items]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => compareEth(a.priceEth, b.priceEth))
    case 'price-desc':
      return sorted.sort((a, b) => compareEth(b.priceEth, a.priceEth))
    case 'popular':
      return sorted.sort(
        (a, b) => b.rating.count - a.rating.count || b.rating.average - a.rating.average,
      )
    case 'recent':
    default:
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

class MockDatabase {
  private state: DbState
  private listeners = new Set<Listener>()
  private orderTimers = new Map<string, ReturnType<typeof setTimeout>>()

  constructor() {
    const stored = readStorage<DbState>(DB_KEY)
    this.state = stored?.schema === 1 ? stored : seed()
    if (!stored || stored.schema !== 1) this.persist()
  }

  reset(): void {
    for (const timer of this.orderTimers.values()) clearTimeout(timer)
    this.orderTimers.clear()
    this.state = seed()
    // Reset restaura o cenário conhecido POR COMPLETO, incluindo a
    // configuração de rede/falhas (isolamento entre testes e demonstrações).
    setConfig({ ...DEFAULT_CONFIG })
    this.persist()
  }

  private persist(): void {
    writeStorage(DB_KEY, this.state)
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private nextVersion(resourceKey: string): number {
    const next = (this.state.eventVersions[resourceKey] ?? 0) + 1
    this.state.eventVersions[resourceKey] = next
    this.persist()
    return next
  }

  private emitNft(payload: NftUpdatedPayload): void {
    const event: NftUpdatedEvent = {
      id: uid('evt'),
      event: REALTIME_EVENTS.nftUpdated,
      version: this.nextVersion(`nft:${payload.nftId}:${payload.editionId}`),
      emittedAt: now(),
      resourceKey: `nft:${payload.nftId}:${payload.editionId}`,
      payload,
    }
    this.dispatch(event)
  }

  private emitOrder(order: Order): void {
    const payload: OrderUpdatedPayload = {
      orderId: order.id,
      status: order.status,
      transactionHash: order.transactionHash,
      explorerUrl: order.explorerUrl,
      failureReason: order.failureReason,
      network: order.network,
    }
    const event: OrderUpdatedEvent = {
      id: uid('evt'),
      event: REALTIME_EVENTS.orderUpdated,
      version: this.nextVersion(`order:${order.id}`),
      emittedAt: now(),
      resourceKey: `order:${order.id}`,
      payload,
    }
    this.dispatch(event)
  }

  private dispatch(event: RealtimeEvent): void {
    for (const listener of this.listeners) listener(event)
  }

  // ---------------------------------------------------------------- catálogo

  listNfts(query: NftListQuery, favorites: string[]): NftListResponse {
    const all = getConfig().emptyCatalog ? [] : this.state.nfts
    const favoriteSet = new Set(favorites)
    const term = query.search?.trim().toLocaleLowerCase('pt-BR') ?? ''
    const collections = new Set<CollectionId>(query.collections ?? [])
    const networks = new Set<Network>(query.networks ?? [])
    const rarities = new Set<NftRarity>(query.rarity ?? [])

    let items = all.map((nft) => toListItem(nft, favoriteSet.has(nft.id)))

    if (term) {
      items = items.filter((item) =>
        `${item.name} ${item.tokenId}`.toLocaleLowerCase('pt-BR').includes(term),
      )
    }
    if (collections.size) {
      items = items.filter((item) => collections.has(item.collectionId))
    }
    if (networks.size) {
      items = items.filter((item) => networks.has(item.network))
    }
    if (rarities.size) {
      items = items.filter((item) => rarities.has(item.rarity))
    }
    if (query.onlyFavorites) {
      items = items.filter((item) => favoriteSet.has(item.id))
    }
    if (query.segment === 'new' || query.segment === 'hot') {
      const newest = all.reduce(
        (max, nft) => Math.max(max, Date.parse(nft.createdAt)),
        0,
      )
      const cutoff = newest - 60 * 24 * 60 * 60 * 1000
      items = items.filter((item) =>
        query.segment === 'new'
          ? Date.parse(item.createdAt) >= cutoff
          : item.rating.count >= 20,
      )
    }
    if (query.priceMin) {
      items = items.filter(
        (item) => compareEth(item.priceEth, query.priceMin as EthAmount) >= 0,
      )
    }
    if (query.priceMax) {
      items = items.filter(
        (item) => compareEth(item.priceEth, query.priceMax as EthAmount) <= 0,
      )
    }

    items = sortItems(items, query.sort)
    const total = items.length
    const pageSize = Math.max(1, Math.min(query.pageSize || 9, 60))
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.max(1, Math.min(query.page || 1, totalPages))
    const paged = items.slice((page - 1) * pageSize, page * pageSize)

    const allItems = all.map((nft) => toListItem(nft, false))
    const prices = allItems.map((item) => toDecimal(item.priceEth))
    const minEth = prices.length
      ? Decimal.min(...prices).toFixed()
      : '0'
    const maxEth = prices.length
      ? Decimal.max(...prices).toFixed()
      : '0'

    return {
      items: paged,
      page,
      pageSize,
      total,
      totalPages,
      facets: {
        collections: COLLECTIONS.map((id) => ({
          id,
          label: COLLECTION_LABELS[id],
          count: allItems.filter((item) => item.collectionId === id).length,
        })),
        networks: (['ethereum', 'polygon', 'solana'] as Network[]).map((id) => ({
          id,
          count: allItems.filter((item) => item.network === id).length,
        })),
        priceRange: { minEth, maxEth },
      },
      appliedPriceRange: (() => {
        // O guard é sobre a lista FILTRADA: spread vazio quebraria o Decimal.
        const filteredPrices = items.map((item) => toDecimal(item.priceEth))
        return {
          minEth: filteredPrices.length ? Decimal.min(...filteredPrices).toFixed() : '0',
          maxEth: filteredPrices.length ? Decimal.max(...filteredPrices).toFixed() : '0',
        }
      })(),
    }
  }

  getNft(id: string): Nft {
    const nft = this.state.nfts.find((item) => item.id === id)
    if (!nft) throw new DomainError('not_found', 'NFT não encontrado.')
    return nft
  }

  /**
   * Muda preço/estoque no servidor e propaga via REST + evento. Usado pelo
   * painel de cenários — nunca chamado diretamente pela UI de produto.
   */
  patchEdition(
    nftId: string,
    editionId: string,
    patch: { priceEth?: EthAmount; available?: number },
    reason: NftUpdatedPayload['reason'],
  ): NftUpdatedPayload {
    const nft = this.getNft(nftId)
    const edition = nft.editions.find((item) => item.id === editionId)
    if (!edition) throw new DomainError('not_found', 'Edição não encontrada.')
    if (patch.priceEth !== undefined) edition.priceEth = patch.priceEth
    if (patch.available !== undefined) {
      if (!Number.isInteger(patch.available) || patch.available < 0) {
        throw new DomainError('validation_error', 'Estoque inválido.')
      }
      edition.available = patch.available
    }

    for (const [key, cart] of Object.entries(this.state.carts)) {
      const affected = cart.items.some(
        (item) => item.nftId === nftId && item.editionId === editionId,
      )
      if (affected) {
        cart.stale = true
        this.state.carts[key] = cart
      }
    }

    const payload: NftUpdatedPayload = {
      nftId,
      editionId,
      editionLabel: edition.label,
      priceEth: edition.priceEth,
      available: edition.available,
      reason,
    }
    this.persist()
    this.emitNft(payload)
    return payload
  }

  // ------------------------------------------------------------- autenticação

  async hashPassword(password: string): Promise<string> {
    const bytes = new TextEncoder().encode(`kurio::${password}`)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  async login(email: string, password: string): Promise<{ session: Session; user: UserRecord }> {
    const normalized = email.trim().toLocaleLowerCase('pt-BR')
    const user = this.state.users.find(
      (item) => item.email.toLocaleLowerCase('pt-BR') === normalized,
    )
    const hash = await this.hashPassword(password)
    if (!user || user.passwordHash !== hash) {
      throw new DomainError('invalid_credentials', 'E-mail ou senha incorretos.')
    }
    return this.createSession(user)
  }

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<{ session: Session; user: UserRecord }> {
    const normalizedEmail = email.trim().toLocaleLowerCase('pt-BR')
    const normalizedUsername = username.trim().toLocaleLowerCase('pt-BR')
    const fieldErrors: Record<string, string> = {}
    if (normalizedUsername.length < 3) {
      fieldErrors.username = 'Use pelo menos 3 caracteres.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      fieldErrors.email = 'Informe um e-mail válido.'
    }
    if (password.length < 8) {
      fieldErrors.password = 'Use pelo menos 8 caracteres.'
    }
    if (Object.keys(fieldErrors).length) {
      throw new DomainError('validation_error', 'Revise os campos.', fieldErrors)
    }
    if (
      this.state.users.some(
        (item) => item.email.toLocaleLowerCase('pt-BR') === normalizedEmail,
      )
    ) {
      throw new DomainError('conflict', 'Este e-mail já está cadastrado.', {
        email: 'E-mail já cadastrado.',
      })
    }
    if (
      this.state.users.some(
        (item) => item.username.toLocaleLowerCase('pt-BR') === normalizedUsername,
      )
    ) {
      throw new DomainError('conflict', 'Este nome de usuário já está em uso.', {
        username: 'Nome de usuário já em uso.',
      })
    }

    const user: UserRecord = {
      id: uid('usr'),
      username: normalizedUsername,
      displayName: username.trim(),
      email: normalizedEmail,
      passwordHash: await this.hashPassword(password),
      avatarUrl: null,
      ensName: null,
      walletNickname: 'Principal',
    }
    this.state.users.push(user)
    this.state.profiles.push({
      id: uid('prof'),
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      ensName: null,
      walletNickname: 'Principal',
      avatarUrl: null,
      updatedAt: now(),
    })
    this.state.favorites[user.id] = []
    this.persist()
    return this.createSession(user)
  }

  private createSession(user: UserRecord): { session: Session; user: UserRecord } {
    const token = uid('sess')
    const expiresAt = new Date(Date.now() + getConfig().sessionTtlMs).toISOString()
    this.state.sessions[token] = { token, userId: user.id, expiresAt }
    this.persist()
    return {
      session: { token, user: publicUser(user), expiresAt },
      user,
    }
  }

  resolveSession(token: string | null): { session: Session; user: UserRecord } | null {
    if (!token) return null
    const record = this.state.sessions[token]
    const cfg = getConfig()
    if (!record || cfg.forceSessionExpired || Date.parse(record.expiresAt) <= Date.now()) {
      if (record) {
        delete this.state.sessions[token]
        this.persist()
      }
      if (cfg.forceSessionExpired || record) {
        throw new DomainError('session_expired', 'Sua sessão expirou. Entre novamente.')
      }
      return null
    }
    const user = this.state.users.find((item) => item.id === record.userId)
    if (!user) return null
    return {
      session: { token, user: publicUser(user), expiresAt: record.expiresAt },
      user,
    }
  }

  getSession(token: string | null): Session | null {
    return this.resolveSession(token)?.session ?? null
  }

  destroySession(token: string | null): void {
    if (!token) return
    delete this.state.sessions[token]
    this.persist()
  }

  /** Usado pelo socket para filtrar eventos privados sem lançar 401. */
  tokenUserId(token: string | null): string | null {
    if (!token) return null
    const record = this.state.sessions[token]
    if (!record) return null
    if (
      getConfig().forceSessionExpired ||
      Date.parse(record.expiresAt) <= Date.now()
    ) {
      return null
    }
    return record.userId
  }

  orderOwnerId(orderId: string): string | null {
    const order = this.state.orders[orderId]
    if (!order) return null
    const wallet = this.state.wallets.find(
      (item) => item.address === order.walletAddress,
    )
    return wallet ? (SEED_WALLET_OWNERSHIP[wallet.id] ?? null) : null
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = this.state.users.find((item) => item.id === userId)
    if (!user) throw new DomainError('not_found', 'Usuário não encontrado.')
    const hash = await this.hashPassword(currentPassword)
    if (hash !== user.passwordHash) {
      throw new DomainError('validation_error', 'Senha atual incorreta.', {
        currentPassword: 'Senha atual incorreta.',
      })
    }
    if (newPassword.length < 8) {
      throw new DomainError('validation_error', 'Revise os campos.', {
        newPassword: 'Use pelo menos 8 caracteres.',
      })
    }
    user.passwordHash = await this.hashPassword(newPassword)
    this.persist()
  }

  // ------------------------------------------------------------------ perfil

  getProfile(userId: string): Profile {
    const profileId = SEED_PROFILE_OWNERSHIP[userId]
    const profile = this.state.profiles.find(
      (item) => item.id === profileId || item.email === this.state.users.find((u) => u.id === userId)?.email,
    )
    if (!profile) throw new DomainError('not_found', 'Perfil não encontrado.')
    return profile
  }

  updateProfile(userId: string, patch: UpdateProfileRequest): Profile {
    const profile = this.getProfile(userId)
    const fieldErrors: Record<string, string> = {}
    if (patch.displayName.trim().length < 2) {
      fieldErrors.displayName = 'Informe seu nome.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email.trim())) {
      fieldErrors.email = 'Informe um e-mail válido.'
    }
    if (!/^[a-z0-9_-]{3,}$/i.test(patch.username.trim())) {
      fieldErrors.username = 'Use letras, números, _ ou - (mín. 3).'
    }
    if (Object.keys(fieldErrors).length) {
      throw new DomainError('validation_error', 'Revise os campos.', fieldErrors)
    }
    const taken = this.state.profiles.some(
      (item) =>
        item.id !== profile.id &&
        item.username.toLocaleLowerCase('pt-BR') ===
          patch.username.trim().toLocaleLowerCase('pt-BR'),
    )
    if (taken) {
      throw new DomainError('conflict', 'Nome de usuário já em uso.', {
        username: 'Nome de usuário já em uso.',
      })
    }
    Object.assign(profile, {
      displayName: patch.displayName.trim(),
      username: patch.username.trim(),
      email: patch.email.trim().toLocaleLowerCase('pt-BR'),
      ensName: patch.ensName.trim() || null,
      walletNickname: patch.walletNickname.trim(),
      avatarUrl: patch.avatarUrl,
      updatedAt: now(),
    })
    const user = this.state.users.find((item) => item.id === userId)
    if (user) {
      user.displayName = profile.displayName
      user.username = profile.username
      user.email = profile.email
      user.ensName = profile.ensName
      user.walletNickname = profile.walletNickname
      user.avatarUrl = profile.avatarUrl
    }
    this.persist()
    return profile
  }

  // ---------------------------------------------------------------- carteiras

  getWallets(userId: string): Wallet[] {
    return this.state.wallets.filter(
      (wallet) => SEED_WALLET_OWNERSHIP[wallet.id] === userId,
    )
  }

  private assertWalletOwner(userId: string, walletId: string): Wallet {
    const wallet = this.state.wallets.find((item) => item.id === walletId)
    if (!wallet || SEED_WALLET_OWNERSHIP[walletId] !== userId) {
      throw new DomainError('not_found', 'Carteira não encontrada.')
    }
    return wallet
  }

  private validateWallet(input: {
    label: string
    address: string
    referralCode: string
  }): Record<string, string> {
    const errors: Record<string, string> = {}
    if (input.label.trim().length < 2) errors.label = 'Dê um apelido à carteira.'
    if (!/^0x[a-fA-F0-9]{40}$/.test(input.address.trim())) {
      errors.address = 'Endereço inválido (0x + 40 hex).'
    }
    return errors
  }

  createWallet(userId: string, input: CreateWalletRequest): Wallet {
    const errors = this.validateWallet(input)
    if (Object.keys(errors).length) {
      throw new DomainError('validation_error', 'Revise os campos.', errors)
    }
    const address = input.address.trim()
    if (
      this.getWallets(userId).some(
        (wallet) => wallet.address.toLocaleLowerCase() === address.toLocaleLowerCase(),
      )
    ) {
      throw new DomainError('conflict', 'Esta carteira já está cadastrada.', {
        address: 'Carteira já cadastrada.',
      })
    }
    const wallet: Wallet = {
      id: uid('wal'),
      label: input.label.trim(),
      address,
      network: input.network,
      type: input.type,
      ensName: input.ensName?.trim() || null,
      referralCode: input.referralCode.trim(),
      isPrimary: this.getWallets(userId).length === 0,
      createdAt: now(),
    }
    this.state.wallets.push(wallet)
    SEED_WALLET_OWNERSHIP[wallet.id] = userId
    this.persist()
    return wallet
  }

  updateWallet(userId: string, walletId: string, patch: UpdateWalletRequest): Wallet {
    const wallet = this.assertWalletOwner(userId, walletId)
    const merged = { ...wallet, ...patch }
    const errors = this.validateWallet(merged)
    if (Object.keys(errors).length) {
      throw new DomainError('validation_error', 'Revise os campos.', errors)
    }
    Object.assign(wallet, {
      label: merged.label.trim(),
      address: merged.address.trim(),
      network: merged.network,
      type: merged.type,
      ensName: merged.ensName?.trim() || null,
      referralCode: merged.referralCode.trim(),
    })
    this.persist()
    return wallet
  }

  // ---------------------------------------------------------------- favoritos

  getFavorites(userId: string): string[] {
    return this.state.favorites[userId] ?? []
  }

  setFavorite(userId: string, nftId: string, favorite: boolean): string[] {
    this.getNft(nftId)
    const current = new Set(this.getFavorites(userId))
    if (favorite) current.add(nftId)
    else current.delete(nftId)
    const next = [...current]
    this.state.favorites[userId] = next
    this.persist()
    return next
  }

  // ------------------------------------------------------------------ carrinho

  private cartKey(userId: string | null, guestId: string): string {
    return userId ? `u:${userId}` : `g:${guestId}`
  }

  getCart(userId: string | null, guestId: string): Cart {
    const key = this.cartKey(userId, guestId)
    const cart = this.state.carts[key] ?? emptyCart()
    this.state.carts[key] = cart
    this.refreshQuote(cart)
    this.persist()
    return structuredClone(cart)
  }

  private refreshQuote(cart: Cart): Cart {
    let subtotal = new Decimal(0)
    let stale = cart.stale

    /**
     * Itens NÃO somem do carrinho quando preço/estoque mudam: a cotação é
     * marcada como desatualizada (`stale`) e a interface informa a alteração.
     * Só remove o que deixou de existir no catálogo. Os totais continuam os
     * da cotação vigente — é isso que permite ao checkout recusar confirmação
     * com valores antigos (price_changed/quote_stale).
     */
    cart.items = cart.items.filter((item) => {
      const nft = this.state.nfts.find((entry) => entry.id === item.nftId)
      const edition = nft?.editions.find((entry) => entry.id === item.editionId)
      if (!nft || !edition) {
        stale = true
        return false
      }
      if (compareEth(item.unitPriceEth, edition.priceEth) !== 0) {
        stale = true
      }
      if (item.available !== edition.available) {
        stale = true
      }
      subtotal = subtotal.plus(item.lineTotalEth)
      return true
    })

    const discount = cart.coupon
      ? subtotal.times(cart.coupon.percentOff).div(100)
      : new Decimal(0)
    const fee = cart.items.length ? new Decimal(NETWORK_FEE_ETH) : new Decimal(0)
    const total = subtotal.minus(discount).plus(fee)

    cart.totals = {
      subtotalEth: roundEth(subtotal.toFixed()),
      discountEth: roundEth(discount.toFixed()),
      networkFeeEth: roundEth(fee.toFixed()),
      totalEth: roundEth(total.toFixed()),
    }
    cart.stale = stale
    return cart
  }

  private quote(cart: Cart): Cart {
    cart.quoteId = uid('quote')
    cart.quotedAt = now()
    cart.stale = false
    return this.refreshQuote(cart)
  }

  addCartItem(
    userId: string | null,
    guestId: string,
    input: { nftId: string; editionId: string; quantity: number },
  ): Cart {
    const { nftId, editionId, quantity } = input
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new DomainError('validation_error', 'Quantidade inválida.', {
        quantity: 'Informe um número inteiro maior que zero.',
      })
    }
    const nft = this.getNft(nftId)
    const edition = nft.editions.find((item) => item.id === editionId)
    if (!edition) throw new DomainError('not_found', 'Edição não encontrada.')
    if (edition.available < quantity) {
      throw new DomainError('insufficient_stock', 'Estoque insuficiente para esta edição.')
    }

    const key = this.cartKey(userId, guestId)
    const cart = this.state.carts[key] ?? emptyCart()
    const existing = cart.items.find(
      (item) => item.nftId === nftId && item.editionId === editionId,
    )
    if (existing) {
      const next = existing.quantity + quantity
      if (next > edition.available) {
        throw new DomainError('insufficient_stock', 'Estoque insuficiente para esta edição.')
      }
      existing.quantity = next
      existing.lineTotalEth = multiplyEth(existing.unitPriceEth, next)
      existing.updatedAt = now()
    } else {
      const item: CartItem = {
        id: uid('ci'),
        nftId,
        tokenId: nft.tokenId,
        editionId,
        name: nft.name,
        imageUrl: nft.imageUrl,
        editionLabel: edition.label,
        quantity,
        unitPriceEth: edition.priceEth,
        lineTotalEth: multiplyEth(edition.priceEth, quantity),
        available: edition.available,
        updatedAt: now(),
      }
      cart.items.push(item)
    }
    this.state.carts[key] = this.quote(cart)
    this.persist()
    return structuredClone(this.state.carts[key])
  }

  private findCartItem(userId: string | null, guestId: string, itemId: string) {
    const key = this.cartKey(userId, guestId)
    const cart = this.state.carts[key] ?? emptyCart()
    const item = cart.items.find((entry) => entry.id === itemId)
    if (!item) throw new DomainError('not_found', 'Item não encontrado no carrinho.')
    return { key, cart, item }
  }

  updateCartItem(
    userId: string | null,
    guestId: string,
    itemId: string,
    quantity: number,
  ): Cart {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new DomainError('validation_error', 'Quantidade inválida.', {
        quantity: 'Informe um número inteiro maior que zero.',
      })
    }
    const { key, cart, item } = this.findCartItem(userId, guestId, itemId)
    const nft = this.getNft(item.nftId)
    const edition = nft.editions.find((entry) => entry.id === item.editionId)
    if (!edition || edition.available < quantity) {
      throw new DomainError('insufficient_stock', 'Estoque insuficiente para esta edição.')
    }
    item.quantity = quantity
    item.unitPriceEth = edition.priceEth
    item.available = edition.available
    item.lineTotalEth = multiplyEth(edition.priceEth, quantity)
    item.updatedAt = now()
    this.state.carts[key] = this.quote(cart)
    this.persist()
    return structuredClone(this.state.carts[key])
  }

  removeCartItem(userId: string | null, guestId: string, itemId: string): Cart {
    const { key, cart, item } = this.findCartItem(userId, guestId, itemId)
    cart.items = cart.items.filter((entry) => entry.id !== item.id)
    this.state.carts[key] = this.quote(cart)
    this.persist()
    return structuredClone(this.state.carts[key])
  }

  applyCoupon(userId: string | null, guestId: string, code: string): Cart {
    const key = this.cartKey(userId, guestId)
    const cart = this.state.carts[key] ?? emptyCart()
    const normalized = code.trim().toUpperCase()
    const coupon = this.state.coupons.find((item) => item.code === normalized)
    if (!coupon) {
      throw new DomainError('invalid_coupon', 'Cupom inválido.', {
        code: 'Este cupom não existe.',
      })
    }
    if (coupon.expiresAt && Date.parse(coupon.expiresAt) <= Date.now()) {
      throw new DomainError('expired_coupon', 'Este cupom expirou.', {
        code: 'Cupom expirado.',
      })
    }
    cart.coupon = { code: coupon.code, percentOff: coupon.percentOff }
    this.state.carts[key] = this.quote(cart)
    this.persist()
    return structuredClone(this.state.carts[key])
  }

  removeCoupon(userId: string | null, guestId: string): Cart {
    const key = this.cartKey(userId, guestId)
    const cart = this.state.carts[key] ?? emptyCart()
    cart.coupon = null
    this.state.carts[key] = this.quote(cart)
    this.persist()
    return structuredClone(this.state.carts[key])
  }

  refreshCartQuote(userId: string | null, guestId: string): Cart {
    const key = this.cartKey(userId, guestId)
    const cart = this.state.carts[key] ?? emptyCart()
    for (const item of cart.items) {
      const nft = this.state.nfts.find((entry) => entry.id === item.nftId)
      const edition = nft?.editions.find((entry) => entry.id === item.editionId)
      if (nft && edition && edition.available > 0) {
        item.unitPriceEth = edition.priceEth
        item.available = edition.available
        item.lineTotalEth = multiplyEth(edition.priceEth, item.quantity)
        item.updatedAt = now()
      }
    }
    this.state.carts[key] = this.quote(cart)
    this.persist()
    return structuredClone(this.state.carts[key])
  }

  /**
   * Fusão visitor → conta no login. O carrinho do visitante é preservado e
   * limitado pelo estoque atual (K5).
   */
  mergeGuestCart(guestId: string, userId: string): number {
    const guestKey = `g:${guestId}`
    const userKey = `u:${userId}`
    const guest = this.state.carts[guestKey]
    if (!guest?.items.length) return 0
    const target = this.state.carts[userKey] ?? emptyCart()
    let merged = 0

    for (const item of guest.items) {
      const nft = this.state.nfts.find((entry) => entry.id === item.nftId)
      const edition = nft?.editions.find((entry) => entry.id === item.editionId)
      if (!nft || !edition || edition.available <= 0) continue
      const existing = target.items.find(
        (entry) => entry.nftId === item.nftId && entry.editionId === item.editionId,
      )
      const quantity = Math.min(
        item.quantity + (existing?.quantity ?? 0),
        edition.available,
      )
      if (existing) {
        existing.quantity = quantity
        existing.lineTotalEth = multiplyEth(existing.unitPriceEth, quantity)
      } else {
        target.items.push({ ...item, quantity, available: edition.available })
      }
      merged += 1
    }
    if (guest.coupon && !target.coupon) target.coupon = guest.coupon
    this.state.carts[userKey] = this.quote(target)
    delete this.state.carts[guestKey]
    this.persist()
    return merged
  }

  // ------------------------------------------------------------------- pedidos

  private snapshotTotals(
    items: Array<{ lineTotalEth: EthAmount }>,
    coupon: Coupon | null,
  ): CartTotals {
    const subtotal = items.reduce(
      (acc, item) => acc.plus(item.lineTotalEth),
      new Decimal(0),
    )
    const discount = coupon
      ? subtotal.times(coupon.percentOff).div(100)
      : new Decimal(0)
    const fee = items.length ? new Decimal(NETWORK_FEE_ETH) : new Decimal(0)
    return {
      subtotalEth: roundEth(subtotal.toFixed()),
      discountEth: roundEth(discount.toFixed()),
      totalEth: roundEth(subtotal.minus(discount).plus(fee).toFixed()),
      networkFeeEth: roundEth(fee.toFixed()),
    }
  }

  createOrder(
    userId: string,
    request: CreateOrderRequest,
    idempotencyKey: string,
  ): CreateOrderResponse {
    const existing = this.state.idempotency[idempotencyKey]
    const fingerprint = JSON.stringify({
      userId,
      walletId: request.walletId,
      network: request.network,
      couponCode: request.couponCode,
      collector: request.collector,
      items: request.items,
    })
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        throw new DomainError(
          'idempotency_conflict',
          'Esta chave já foi usada para outro pedido.',
        )
      }
      const replay = this.state.orders[existing.orderId]
      if (!replay) throw new DomainError('not_found', 'Pedido não encontrado.')
      return { order: structuredClone(replay), idempotentReplay: true }
    }

    const wallet = this.state.wallets.find((item) => item.id === request.walletId)
    if (!wallet || SEED_WALLET_OWNERSHIP[wallet.id] !== userId) {
      throw new DomainError('forbidden', 'Carteira não pertence a esta conta.', {
        walletId: 'Selecione uma carteira sua.',
      })
    }
    if (request.items.length === 0) {
      throw new DomainError('validation_error', 'O pedido está vazio.')
    }

    const snapshots = request.items.map((input) => {
      if (!Number.isInteger(input.quantity) || input.quantity < 1) {
        throw new DomainError('validation_error', 'Quantidade inválida.')
      }
      const nft = this.getNft(input.nftId)
      const edition = nft.editions.find((item) => item.id === input.editionId)
      if (!edition) throw new DomainError('not_found', 'Edição não encontrada.')
      if (edition.available < input.quantity) {
        throw new DomainError('insufficient_stock', `${nft.name} esgotou.`)
      }
      return {
        nftId: nft.id,
        editionId: edition.id,
        tokenId: nft.tokenId,
        name: nft.name,
        imageUrl: nft.imageUrl,
        editionLabel: edition.label,
        quantity: input.quantity,
        unitPriceEth: edition.priceEth,
        lineTotalEth: multiplyEth(edition.priceEth, input.quantity),
      }
    })

    const cart = this.state.carts[`u:${userId}`]
    if (cart && cart.quoteId !== request.quoteId) {
      throw new DomainError('quote_stale', 'A cotação expirou. Atualize o carrinho.')
    }
    const currentTotals = this.snapshotTotals(snapshots, cart?.coupon ?? null)
    if (cart && compareEth(currentTotals.totalEth, cart.totals.totalEth) !== 0) {
      throw new DomainError('price_changed', 'Preço ou taxas mudaram. Confirme novamente.')
    }

    const id = uid('ord')
    const timestamp = now()
    const order: Order = {
      id,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
      transactionHash: null,
      explorerUrl: null,
      walletLabel: wallet.label,
      walletAddress: wallet.address,
      network: request.network,
      couponCode: request.couponCode,
      items: snapshots,
      totals: currentTotals,
      failureReason: null,
      version: 1,
    }
    this.state.orders[id] = order
    this.state.idempotency[idempotencyKey] = { orderId: id, fingerprint }
    this.persist()

    const timer = setTimeout(() => {
      this.orderTimers.delete(id)
      const pending = this.state.orders[id]
      if (!pending || pending.status !== 'pending') return
      const decline =
        getConfig().declinePayments ||
        request.collector.note?.toLocaleLowerCase('pt-BR').includes('recusar') === true
      if (decline) {
        this.transitionOrder(
          id,
          'declined',
          null,
          null,
          'Pagamento recusado pela operadora.',
        )
      } else {
        const hash = `0x${id.replace('ord_', '').padEnd(64, 'a9f3c1d7')}`.slice(0, 66)
        const explorer = request.network === 'polygon'
          ? `https://polygonscan.com/tx/${hash}`
          : request.network === 'solana'
            ? `https://explorer.solana.com/tx/${hash}`
            : `https://etherscan.io/tx/${hash}`
        this.transitionOrder(id, 'confirmed', hash, explorer, null)
        if (cart) {
          const purchased = new Map(
            request.items.map((item) => [`${item.nftId}:${item.editionId}`, item.quantity]),
          )
          cart.items = cart.items.filter((item) => {
            const key = `${item.nftId}:${item.editionId}`
            const quantity = purchased.get(key)
            if (!quantity) return true
            purchased.delete(key)
            item.quantity -= quantity
            return item.quantity > 0
          })
          this.state.carts[`u:${userId}`] = this.quote(cart)
        }
        for (const item of request.items) {
          const edition = this.state.nfts
            .find((nft) => nft.id === item.nftId)
            ?.editions.find((entry) => entry.id === item.editionId)
          if (edition) edition.available = Math.max(0, edition.available - item.quantity)
        }
        this.persist()
      }
    }, 2400)
    this.orderTimers.set(id, timer)

    return { order: structuredClone(order), idempotentReplay: false }
  }

  private transitionOrder(
    id: string,
    status: OrderStatus,
    transactionHash: string | null,
    explorerUrl: string | null,
    failureReason: string | null,
  ): Order {
    const order = this.state.orders[id]
    if (!order) throw new DomainError('not_found', 'Pedido não encontrado.')
    order.status = status
    order.transactionHash = transactionHash
    order.explorerUrl = explorerUrl
    order.failureReason = failureReason
    order.updatedAt = now()
    order.version += 1
    this.persist()
    this.emitOrder(order)
    return order
  }

  getOrder(userId: string, orderId: string): Order {
    const order = this.state.orders[orderId]
    if (!order) throw new DomainError('not_found', 'Pedido não encontrado.')
    const ownedWallet = order.walletAddress
    const allowed = this.getWallets(userId).some(
      (wallet) => wallet.address === ownedWallet,
    )
    if (!allowed) throw new DomainError('forbidden', 'Pedido não pertence a esta conta.')
    return structuredClone(order)
  }

  listOrders(userId: string): Order[] {
    const addresses = new Set(this.getWallets(userId).map((wallet) => wallet.address))
    return Object.values(this.state.orders)
      .filter((order) => addresses.has(order.walletAddress))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((order) => structuredClone(order))
  }

  /** Dispara uma transição manual para testes de reconexão (M29). */
  forceOrderStatus(userId: string, orderId: string, status: OrderStatus): Order {
    this.getOrder(userId, orderId)
    if (status === 'confirmed') {
      const hash = `0x${orderId.replace('ord_', '').padEnd(64, 'b7e2c4a1')}`.slice(0, 66)
      return structuredClone(
        this.transitionOrder(orderId, status, hash, `https://etherscan.io/tx/${hash}`, null),
      )
    }
    return structuredClone(
      this.transitionOrder(
        orderId,
        status,
        null,
        null,
        status === 'declined' ? 'Pagamento recusado.' : null,
      ),
    )
  }

  /** IDs de evento já vistos, para o cliente descartar duplicatas. */
  eventIds(): string[] {
    return Object.keys(this.state.eventVersions)
  }
}

export const db = new MockDatabase()

export function eventNameIsValid(name: string): name is RealtimeEventName {
  return name === REALTIME_EVENTS.nftUpdated || name === REALTIME_EVENTS.orderUpdated
}

export const MOCK_ROUTES = {
  session: '/api/auth/session',
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  nfts: '/api/nfts',
  favorites: '/api/favorites',
  cart: '/api/cart',
  orders: '/api/orders',
  profile: '/api/profile',
  wallets: '/api/wallets',
  mock: '/api/mock',
} as const

const TOKEN_KEY = 'kurio:session-token'
const GUEST_KEY = 'kurio:guest-id'

export function getSessionToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setSessionToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearSessionToken(): void {
  window.localStorage.removeItem(TOKEN_KEY)
}

/** Identificador estável do visitante, usado para preservar o carrinho. */
export function getGuestId(): string {
  const existing = window.localStorage.getItem(GUEST_KEY)
  if (existing) return existing
  const created = `guest_${crypto.randomUUID().slice(0, 8)}`
  window.localStorage.setItem(GUEST_KEY, created)
  return created
}

/** Chave de isolamento de cache: troca de usuário nunca reaproveita dados. */
export function cacheScope(): string {
  return getSessionToken() ?? getGuestId()
}

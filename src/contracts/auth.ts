/** Sessão, conta e autenticação. */

export interface User {
  id: string
  username: string
  displayName: string
  email: string
  avatarUrl: string | null
  ensName: string | null
}

export interface Session {
  token: string
  user: User
  /** ISO-8601. O mock expira a sessão para exercitar o fluxo de retomada. */
  expiresAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

/** Retorno do login/cadastro: sessão + carrinho já mesclado. */
export interface AuthResponse {
  session: Session
  /** Itens do visitante que foram preservados após autenticar. */
  mergedCartItems: number
}

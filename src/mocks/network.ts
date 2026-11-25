import { HttpResponse, delay } from 'msw'

import { DomainError, getConfig } from './db'

/**
 * Toda requisição passa por aqui. Os cenários (latência, timeout, offline e
 * 5xx) vivem só na camada de rede — nunca nos componentes.
 */
export async function networkGuard(): Promise<Response | null> {
  const config = getConfig()

  if (config.offline) return HttpResponse.error()

  if (config.timeoutMs > 0) {
    await delay(config.timeoutMs)
    return HttpResponse.error()
  }

  if (config.failRate > 0 && Math.random() < config.failRate) {
    return HttpResponse.json(
      { code: 'server_error', message: 'Falha transitória do servidor.' },
      { status: 500 },
    )
  }

  const jitter = config.variableLatencyMs
    ? Math.random() * config.variableLatencyMs
    : 0
  if (config.latencyMs + jitter > 0) {
    await delay(config.latencyMs + jitter)
  }
  return null
}

export function errorResponse(error: unknown): Response {
  if (error instanceof DomainError) {
    return HttpResponse.json(
      {
        code: error.code,
        message: error.message,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      },
      { status: error.status },
    )
  }

  console.error('[mock] erro inesperado:', error)
  return HttpResponse.json(
    { code: 'server_error', message: 'Erro inesperado no servidor simulado.' },
    { status: 500 },
  )
}

export async function readBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    throw new DomainError('validation_error', 'Corpo da requisição inválido.')
  }
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization')
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}

export function guestId(request: Request): string {
  return request.headers.get('X-Guest-Id') ?? 'guest-local'
}

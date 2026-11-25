import type { ApiErrorCode } from '@/contracts/common'

/** Forma única de erro em toda a interface (inputs de formulário inclusos). */
export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly fieldErrors?: Record<string, string>
  readonly status: number

  constructor(
    code: ApiErrorCode,
    message: string,
    fieldErrors?: Record<string, string>,
    status = 0,
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.fieldErrors = fieldErrors
    this.status = status
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Ocorreu um erro inesperado.'
}

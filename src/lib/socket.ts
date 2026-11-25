import { io, type Socket } from 'socket.io-client'

import type {
  ClientToServerEventMap,
  RealtimeEventMap,
} from '@/contracts/realtime'

import { getSessionToken } from './session'

type ServerToClient = {
  [K in keyof RealtimeEventMap]: (event: RealtimeEventMap[K]) => void
}
type ClientToServer = {
  [K in keyof ClientToServerEventMap]: (payload: ClientToServerEventMap[K]) => void
}

export type KurioSocket = Socket<ServerToClient, ClientToServer>

let socket: KurioSocket | null = null
let socketToken: string | null = null

/**
 * Uma única conexão por aba. Troca de usuário reconecta com o token novo,
 * encerrando a subscription da sessão anterior (A9).
 */
export function getSocket(): KurioSocket {
  const token = getSessionToken()
  if (socket && socketToken === token) return socket
  socket?.disconnect()
  socketToken = token
  socket = io({
    path: '/socket.io',
    transports: ['websocket'],
    query: token ? { token } : {},
    reconnection: true,
    reconnectionDelay: 800,
    reconnectionDelayMax: 4000,
  })
  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
  socketToken = null
}

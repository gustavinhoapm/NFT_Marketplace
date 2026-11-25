import { toSocketIo } from '@mswjs/socket.io-binding'
import type { WebSocketHandlerConnection } from 'msw'
import { ws } from 'msw'

import { db } from '../db'
import { trackEvent } from '../devtools'

/**
 * O binding intercepta apenas WebSocket. Por isso o cliente usa
 * `transports: ['websocket']`.
 *
 * O MSW 2.15 reescreve `/socket.io/` para `/` em `WebSocketHandler.parse()`
 * antes de casar o handler, e `getCleanUrl()` descarta a query. Por isso o
 * link casa apenas o path normalizado (`/`).
 */
export const socketLink = ws.link(/\/$/)

type RawClient = WebSocketHandlerConnection['client']

/**
 * Emissor Socket.IO no sentido servidor → cliente.
 *
 * No MSW, `server.send()` escreve no servidor REAL (exige `server.connect()`),
 * enquanto `client.send()` entrega ao cliente conectado. O wrapper do binding
 * codifica/decodifica os pacotes Socket.IO sobre essas duas direções, então o
 * lado "servidor simulado" é o wrapper construído sobre a conexão do cliente.
 */
type IoEmitter = ReturnType<typeof toSocketIo>['client']

interface ConnectedClient {
  emit: IoEmitter
  token: string | null
}

const connected = new Map<RawClient, ConnectedClient>()

/**
 * Visão do servidor simulado: quantos clientes Socket.IO estão conectados.
 * Usado pelos testes sensíveis a tempo sem importar o socket.io-client aqui
 * (importá-lo cedo demais capturaria o WebSocket nativo antes do patch do MSW).
 */
export function socketConnections(): number {
  return connected.size
}

export const socketHandler = socketLink.addEventListener('connection', (connection) => {
  const { client } = connection
  const io = toSocketIo(connection)
  const token = client.url.searchParams.get('token')

  connected.set(client, { emit: io.client, token })

  if (import.meta.env.DEV) {
    console.debug('[kurio:socket] connection', client.url.href)
  }

  /**
   * O binding não responde ao heartbeat bruto do Engine.IO (`2`). Sem esta
   * resposta o socket cai após ~25s. Esta é uma camada de rede, não da UI.
   */
  client.addEventListener('message', (event) => {
    if (import.meta.env.DEV && typeof event.data === 'string') {
      console.debug('[kurio:socket] <-', event.data.slice(0, 120))
    }
    if (event.data === '2') client.send('3')
  })

  client.addEventListener('close', () => {
    connected.delete(client)
  })
})

/**
 * Única ponte entre mutações do servidor simulado e o socket. `nft.updated` é
 * público; `order.updated` só vai para o dono do pedido (E4).
 */
db.subscribe((event) => {
  trackEvent(event)
  const owner =
    event.event === 'order.updated'
      ? db.orderOwnerId(event.payload.orderId)
      : null

  for (const { emit, token } of connected.values()) {
    if (owner && db.tokenUserId(token) !== owner) continue
    emit.emit(event.event, event)
  }
})

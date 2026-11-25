# Arquitetura

## Camadas

- **Transporte** (`src/api`): único cliente Axios (`/api`), interceptors de
  auth (Bearer + `X-Guest-Id`), normalização de erros (`ApiError` com `code`,
  `fieldErrors`, `status`) e redirect global em `401` preservando o contexto.
- **Contratos** (`src/contracts`): tipos compartilhados entre mock, cache e UI.
  Valores em ETH são `string` decimal; quantidades são inteiras.
- **Estado remoto** (`src/hooks`): TanStack Query. Chaves de consulta incluem
  os parâmetros da listagem e o escopo do usuário (`cacheScope()`), garantindo
  isolamento entre contas.
- **Roteamento** (`src/routes`): TanStack Router code-based; `validateSearch`
  tipa e saneia busca/filtros/ordenação/paginação, que compõem a URL e
  sobrevivem a refresh e histórico. Rotas privadas usam `beforeLoad` com
  redirect contextual.
- **Mocking** (`src/mocks`): MSW na camada de rede com banco persistido em
  `localStorage` (schema versionado), latência/timeout/offline/failRate
  configuráveis, idempotência de pedidos e eventos Socket.IO via
  `@mswjs/socket.io-binding`.

## Contratos REST (resumo)

| Recurso    | Operações                                                        |
| ---------- | ---------------------------------------------------------------- |
| `/auth`    | `POST /login`, `POST /register`, `GET /session`, `POST /logout`   |
| `/nfts`    | `GET` (busca/filtros/segmento/ordenação/paginação), `GET /:id`    |
| `/favorites` | `GET`, `PUT /:nftId`, `DELETE /:nftId`                          |
| `/cart`    | `GET`, `POST /items`, `PATCH /items/:id`, `DELETE /items/:id`, `POST /coupon`, `DELETE /coupon`, `POST /refresh` |
| `/orders`  | `POST` (idempotente via `Idempotency-Key`), `GET`, `GET /:id`     |
| `/profile` | `GET`, `PATCH`, `POST /password`                                  |
| `/wallets` | `GET`, `POST`, `PATCH /:id`                                       |
| `/mock`    | `GET/PATCH /config`, `POST /reset`, `POST /nfts/:id/editions/:eid`, `POST /orders/:id/:status` |

Erros: `401` sessão inválida/expirada, `403` posse, `404` recurso, `409`
conflito (idempotência com corpo diferente, estoque, preço), `410` cupom
expirado, `422` validação com `fieldErrors`, `504` timeout/falha transitória.

## Eventos Socket.IO

| Evento         | Payload                                              | Escopo   |
| -------------- | ---------------------------------------------------- | -------- |
| `nft.updated`  | `{ id, event, version, resourceKey, payload: { nftId, editionId, priceEth, available, reason } }` | público |
| `order.updated`| `{ id, event, version, resourceKey, payload: { orderId, status, failureReason? } }` | dono do pedido |

Transporte: WebSocket puro (`transports: ['websocket']`), pois o binding só
intercepta WebSocket. Limitações documentadas: o binding não responde ao
heartbeat bruto do Engine.IO (o mock responde `2`→`3`), não há rooms/namespaces
e o handshake é emitido pelo wrapper (`io.client.emit`), já que
`server.send()` do MSW escreve no servidor real.

**Reconciliação:** ao (re)conectar, o cliente invalida `nfts`, `nft`, `cart` e
`order` via REST; eventos carregam `id` estável e `version` por recurso, e o
cliente descarta duplicatas e versões antigas antes de tocar o cache.

## Política de sessão

- Token opaco em `localStorage` (`kurio:session-token`); visitante anônimo tem
  `guestId` estável para preservar o carrinho.
- `GET /auth/session` recupera a sessão após refresh; `401` em qualquer chamada
  limpa o token e redireciona para `/entrar?redirect=<contexto>`.
- Logout e troca de usuário zeram (`setQueriesData`) e removem as queries
  privadas, desconectam o socket e recarregam a página: nenhuma subscription ou
  dado da sessão anterior sobrevive.

## Estado do carrinho

- Servidor é a fonte da verdade: cotação (`quoteId`, `quotedAt`, `stale`),
  totais e estoque. O cliente apenas exibe.
- Mudança de preço/estoque **não remove** o item: marca `stale`, a UI informa e
  o checkout recusa confirmar com cotação desatualizada até `POST /cart/refresh`.
- Carrinho de visitante é mesclado ao autenticar (`mergeGuestCart`).

## Estratégia de cache (TanStack Query)

- Catálogo: `placeholderData: keepPreviousData` (sem salto de layout),
  invalidação por eventos e mutations.
- Sessão: chave única `['session']`, `staleTime: Infinity`, invalidada no
  login/registro; zerada no logout.
- Recursos privados: chave com escopo do token; favoritos com atualização
  otimista e rollback em falha.
- Retries: nenhuma para auth (401 não repete), padrão controlado em
  `src/lib/query-client.ts` para falhas transitórias.

## Decisões de UX e desvios do Figma

- Páginas editoriais, suporte, atividade, ofertas e downloads não existem como
  entrega: links levam a `/em-breve?area=...`, que declara o fora de escopo sem
  aparentar sucesso. O "Diário da Cunhagem" e a newsletter do footer são
  visuais; a newsletter informa que não envia dados.
- Login social e recuperação de senha aparecem nos frames e informam que não
  fazem parte da demonstração.
- No desktop o login é modal (frame); `/entrar` e `/cadastro` existem como
  páginas (frames mobile) e para acesso direto/redirects.
- Ícones de marca e ilustrações dos NFTs são substituições documentadas em
  `docs/ASSETS.md`.
- O seletor de edição no detalhe usa chips (frame) em vez de dropdown; a
  quantidade tem limite pelo estoque da edição.

## Limitações conhecidas

- Persistência local limita o tamanho do estado (avatar por URL, não upload).
- O binding Socket.IO não suporta rooms/broadcast; o escopo de `order.updated`
  é aplicado pelo mock ao emitir.
- Sem blockchain/carteira reais: conexão de carteira e explorador são
  simulados e rotulados como tal.

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
intercepta WebSocket. Usamos `@mswjs/socket.io-binding@0.2.0` (API
`toSocketIo(connection)`); o README do branch `main` do pacote documenta a API
nova (`ws.link(url, { protocol: new SocketIo() })`), que exige MSW mais recente
— o pin é deliberado e o comportamento atual é coberto por testes E2E.
Limitações oficiais do binding: somente namespace padrão e eventos de texto
(sem namespaces customizados, acknowledgements ou anexos binários). Limitações
adicionais descobertas na integração e contornadas no mock: o binding não
responde ao heartbeat bruto do Engine.IO (respondemos `2`→`3`); o MSW 2.15
reescreve `/socket.io/` para `/` antes de casar o handler (o link casa o path
normalizado); e `server.send()` do MSW escreve no servidor real, então a
direção servidor→cliente é emitida pelo wrapper do lado do cliente
(`io.client.emit`).

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
- Login social: os botões "Continuar com Google/Facebook" do frame não fazem
  OAuth real (fora do escopo); a camada de mocks **simula o provedor**
  autenticando uma conta de demonstração (Google → gustavo@, Facebook → nova@),
  com feedback explícito de que a sessão é simulada. Recuperação de senha
  continua informativa (não faz parte da entrega).
- No desktop o login é modal (frame); `/entrar` e `/cadastro` existem como
  páginas (frames mobile) e para acesso direto/redirects.
- O botão "Ver no Etherscan" do recibo abre um **explorador simulado** dentro do
  app (dialog com hash, rede, bloco derivado do hash e status), em vez de link
  externo: o enunciado pede referências de transação e links de exploração
  simulados, e um hash fictício em explorador real seria incoerente.
- Cards e botões usam transições de hover (elevação/borda em acento via
  `.card-hover`), neutralizadas por `prefers-reduced-motion`.
- Ícones de marca e ilustrações dos NFTs são substituições documentadas em
  `docs/ASSETS.md`.
- O seletor de edição no detalhe usa chips (frame) em vez de dropdown; a
  quantidade tem limite pelo estoque da edição.

## Acessibilidade e performance: ajustes e justificativas

- **Legibilidade mobile:** os frames usam textos de 9–11px. Em viewports
  ≤ 640px esses tamanhos são elevados para 12px via CSS (desktop mantém as
  medidas do Figma), para satisfazer a auditoria de font-size do Lighthouse.
- **Contraste:** o tom `content-subtle` foi clareado (`#847f7a` → `#a49d96`)
  para atingir ≥ 4.5:1 sobre `ink`/`surface`.
- **Back/forward cache:** o service worker do MSW impede bf-cache. É inerente
  ao mocking na camada de rede em produção de demonstração.
- **Performance abaixo da meta (justificativa exigida pelo enunciado):**
  medianas de 85–87 (mobile) e 81–82 (desktop), contra meta ≥ 90; demais
  categorias 99–100 (ver `docs/lighthouse/RESULTADOS.md`). Causas identificadas:
  1. o mocking na camada de rede obriga o boot a aguardar o registro do service
     worker antes do primeiro request (condição de corrida do MSW) — sem isso o
     primeiro fetch escaparia do mock;
  2. o build de demonstração carrega os mocks (~236 KB gzip) e o cliente
     Socket.IO no caminho crítico, por exigência do enunciado ("camada de mocks
     disponível no build de demonstração");
  3. a latência simulada padrão (160 ms) soma ao TTFB percebido do primeiro
     catálogo, que alimenta o LCP (imagem do hero).
  Mitigações já aplicadas: casca de skeletons no primeiro paint (FCP não depende
   da API), preload da imagem de LCP, code-splitting (react/tanstack/mocks),
   imagens JPEG 640px (~45 KB), CLS ≤ 0.05. Melhorias restantes possíveis
   (WebP/AVIF, adiar mocks para após o primeiro paint com cache HTTP) foram
   descartadas por alterarem o comportamento de demonstração exigido.

## Limitações conhecidas

- Persistência local limita o tamanho do estado (avatar por URL, não upload).
- O binding Socket.IO não suporta rooms/broadcast; o escopo de `order.updated`
  é aplicado pelo mock ao emitir.
- Sem blockchain/carteira reais: conexão de carteira e explorador são
  simulados e rotulados como tal.

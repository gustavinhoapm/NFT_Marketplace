# KURIÓ — NFT Marketplace

Marketplace de NFTs implementado como demonstração técnica do desafio frontend:
React + TypeScript, TanStack Router/Query, Axios, REST simulado, tempo real com
Socket.IO (via MSW), Tailwind CSS + shadcn/ui, testes Playwright e auditoria
Lighthouse. Toda a API é simulada na camada de rede (MSW), inclusive no build
publicado.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 (porta padrão do Vite)
```

Requisitos: Node >= 20.9. O worker do MSW (`public/mockServiceWorker.js`) já
está versionado; não é necessário rodar `msw init`.

Para rodar os testes E2E pela primeira vez, instale o navegador do Playwright:

```bash
npx playwright install chromium
```

## Variáveis de ambiente

| Variável             | Padrão   | Efeito                                        |
| -------------------- | -------- | --------------------------------------------- |
| `VITE_ENABLE_MOCKS`  | `true`   | `false` desliga o MSW (para apontar API real) |

Não há outras variáveis: não existe backend real nem segredos no repositório.

## Credenciais fictícias

| E-mail               | Senha       | Observação                       |
| -------------------- | ----------- | -------------------------------- |
| `gustavo@kurio.test` | `kurio1234` | possui carteiras e pedidos seed  |
| `nova@kurio.test`    | `ape4567`   | segunda conta (isolamento de dados) |

Senhas nunca são armazenadas em claro: o mock guarda SHA-256 de
`kurio::<senha>`.

## Seleção e reset de cenários

No console do navegador (ou via `POST /api/mock/*`):

```js
window.__KURIO__.reset()                       // restaura o cenário conhecido
window.__KURIO__.config()                      // lê a configuração atual
window.__KURIO__.config({ latencyMs: 2500 })   // lentidão
window.__KURIO__.config({ variableLatencyMs: 900 }) // latência variável / fora de ordem
window.__KURIO__.config({ timeoutMs: 12000 })  // timeout após a operação
window.__KURIO__.config({ offline: true })     // falha de conexão
window.__KURIO__.config({ failRate: 1 })       // HTTP 5xx em todas as chamadas
window.__KURIO__.config({ forceSessionExpired: true }) // sessão expirada
window.__KURIO__.config({ emptyCatalog: true })// resultado vazio
window.__KURIO__.patchEdition('nft_001', 'ed-1-1', { priceEth: '3.33' }) // preço/estoque + evento
window.__KURIO__.forceOrderStatus(orderId, 'declined')                  // transição de pedido
window.__KURIO__.events()                      // eventos emitidos pelo servidor
```

O reset também restaura a configuração de rede (isolamento entre testes).

## Comandos

| Comando                     | Descrição                                    |
| --------------------------- | -------------------------------------------- |
| `npm run dev`               | desenvolvimento com mocks                    |
| `npm run build`             | build de produção                            |
| `npm run preview`           | preview do build                             |
| `npm run typecheck`         | verificação de tipos                         |
| `npm run lint`              | ESLint                                       |
| `npm run test:e2e`          | Playwright (desktop + mobile)                |
| `npm run test:e2e:ui`       | Playwright em modo UI                        |
| `npm run lighthouse`        | auditoria mobile (LHCI, 3 medições/página)   |
| `npm run lighthouse:desktop`| auditoria desktop                            |
| `npm run lighthouse:summary`| consolida medianas em `docs/lighthouse/RESULTADOS.md` |
| `npm run compare`           | captura telas e gera `docs/comparacao/index.html` (Figma × app) |

Relatório HTML dos testes: `npx playwright show-report`.

## Reproduzindo os fluxos de falha

1. **Preço muda com o carrinho aberto:** abra o carrinho com um item e execute
   `__KURIO__.patchEdition(...)` em outra aba/console → o carrinho marca a
   cotação como desatualizada e o checkout recusa a confirmação
   (`price_changed`) até "Atualizar e confirmar de novo".
2. **Pagamento recusado:** no checkout, marque "Cenário de demonstração:
   simular recusa do pagamento" → o pedido termina `declined` e os itens
   permanecem no carrinho.
3. **Timeout com recuperação:** `__KURIO__.config({ timeoutMs: 12000 })`,
   confirme a compra (o cliente estoura o timeout de 9s), depois
   `config({ timeoutMs: 0 })` e confirme de novo: a mesma chave de
   idempotência recupera o pedido já criado (nenhum pedido duplicado).
4. **Clique repetido:** dois cliques rápidos em "Confirmar compra" geram um
   único pedido (chave de idempotência por tentativa).
5. **Sessão expirada:** `config({ forceSessionExpired: true })` e navegue para
   uma rota privada → redirect para `/entrar?redirect=...` preservando o
   contexto.
6. **Evento duplicado/antigo:** o cliente descarta por `id` e por `version`
   (ver `src/hooks/use-realtime.ts`).

## Estrutura

```
src/api          cliente Axios + contratos de chamada
src/contracts    tipos compartilhados (transporte, cache, UI)
src/components   UI (shadcn/ui adaptado aos tokens do Figma)
src/hooks        TanStack Query (consultas, mutations, realtime)
src/mocks        MSW: db persistido, rede, handlers REST e socket
src/routes       TanStack Router (code-based) com search params validados
tests/e2e        Playwright (fluxos + regressão visual)
docs/figma       exports de referência dos frames (somente consulta)
```

Detalhes de arquitetura, contratos REST/eventos, política de sessão, estado do
carrinho, estratégia de cache e desvios do Figma: ver `ARCHITECTURE.md`.

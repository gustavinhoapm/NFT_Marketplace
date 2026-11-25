# Resultados de auditoria (Lighthouse)

Medições: 3 execuções por página e perfil (`lighthouserc.json` e
`lighthouserc.desktop.json`), build de produção servido por `vite preview`,
mocks no cenário padrão. Valores abaixo são a **mediana**.

## Perfil mobile

| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 87 | 100 | 100 | 99 | 3488 | 0.009 | 31 |
| `/nft/nft_001` | 85 | 100 | 100 | 100 | 3647 | 0.000 | 27 |

Lighthouse 11.4.0 · Node v20.9.0 · Windows/Chromium local.

## Perfil desktop

| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 82 | 100 | 100 | 100 | 2170 | 0.004 | 0 |
| `/nft/nft_001` | 81 | 100 | 100 | 100 | 2297 | 0.047 | 0 |

Lighthouse 11.4.0 · Node v20.9.0 · Windows/Chromium local.

Relatórios completos (HTML/JSON): gerados em `.lighthouseci/` (ignorado pelo git;
reproduza com `npm run lighthouse` e `npm run lighthouse:desktop`).

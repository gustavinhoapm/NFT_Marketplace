# Design tokens — KURIÓ

Referência rápida para conferência visual (fontes, cores, raios). Os valores
foram amostrados dos frames exportados (`docs/figma/`) e vivem em
`src/styles/globals.css` (@theme do Tailwind 4). Mudar aqui = mudar no app
inteiro.

## Como conferir no navegador (receita de 30 segundos)

1. Abra http://localhost:5173 e o frame correspondente em `docs/figma/`
   (ou use o comparador lado a lado: `docs/comparacao/index.html`);
2. Com o DevTools aberto (F12), rode no console:

```js
getComputedStyle(document.body).fontFamily          // família tipográfica
getComputedStyle(document.body).backgroundColor     // ink de fundo
getComputedStyle(document.querySelector('header')).backgroundColor
```

3. Para cores de um elemento específico, use o conta-gotas do DevTools
   (aba Styles → swatch) e compare com a tabela abaixo.

## Cores

| Token            | Hex       | Uso                                        |
| ---------------- | --------- | ------------------------------------------ |
| `ink`            | `#140D0A` | fundo da página                            |
| `surface`        | `#241612` | cards, sidebar, footer, modal              |
| `coffee`         | `#38220F` | faixas internas, inputs de newsletter      |
| `line`           | `#3F2319` | bordas e divisórias                        |
| `accent`         | `#D28A4C` | botões primários, preços, ativos           |
| `accent-hover`   | `#E89B55` | hover do accent                            |
| `accent-muted`   | `#7E532F` | bordas de hover                            |
| `content`        | `#F5F1EB` | texto principal                            |
| `content-muted`  | `#BDB8B3` | texto secundário                           |
| `content-subtle` | `#A49D96` | texto terciário (clareado p/ contraste AA) |
| `cream`          | `#FDF2DA` | moldura das artes                          |
| `sand`           | `#CFB28C` | subtítulo do Diário da Cunhagem            |
| `danger`         | `#D4574A` | erros / recusado                           |
| `success`        | `#7FA650` | confirmado                                 |

## Tipografia

- Família: `Space Mono → ui-monospace → Cascadia Mono → Consolas → monospace`
  (o frame é monoespaçado; o arquivo original da fonte não acompanha o export —
  desvio documentado em `docs/ASSETS.md`);
- Títulos: tracking largo (`0.06em`–`0.3em`), peso 700;
- Corpo desktop: 11–12px como no frame; **mobile eleva 9–11px para 12px**
  (legibilidade/acessibilidade, desvio documentado em `ARCHITECTURE.md`).

## Raios e espaamentos

- Cards/modal: `rounded-md` (10px); hero/banners: `rounded-lg` (14px);
- Botões: `rounded-sm` (6px), exceto CTAs mobile (`rounded-full`);
- Container: `max-w-[1200px]`, padding lateral `30px` (desktop) / `16px` (mobile);
- Header: altura 56px; bottom nav mobile: 64px + FAB central.

## Imagens

- Artes dos NFTs: JPEG 640px (~45 KB) em `public/assets/nft/` (substitutas
  documentadas em `docs/ASSETS.md`);
- Ícones de marca (Google/Facebook/redes): SVG inline em
  `src/components/ui/social-icons.tsx`.

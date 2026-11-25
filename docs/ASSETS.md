# Assets e substituições

## Ilustrações dos NFTs

O arquivo do Figma não disponibiliza as ilustrações dos NFTs como assets
isolados (elas existem apenas compostas nos frames). Para manter a identidade
visual — retratos de colecionador em render 3D sobre fundo claro — as
ilustrações foram **substituídas por equivalentes gerados** no mesmo estilo e
otimizadas para a web (JPEG 640×640, ~45 KB cada):

| Arquivo                          | Uso nos fixtures                       |
| -------------------------------- | -------------------------------------- |
| `public/assets/nft/ape-sunglasses.jpg` | artes `emerald`                  |
| `public/assets/nft/ape-bucket.jpg`     | artes `sage`, `cosmic`, `violet` |
| `public/assets/nft/chimp-blazer.jpg`   | artes `neon`, `ivory`, `onyx`    |
| `public/assets/nft/monkey-headphones.jpg` | artes `golden-*`              |

Assim como no frame original, as ilustrações se repetem entre os 32 NFTs do
catálogo. Os SVGs antigos foram removidos.

## Ícones de redes sociais

O `lucide-react` 1.x não distribui ícones de marca. Os glifos de Facebook,
Instagram, Twitter, LinkedIn e YouTube do footer são SVGs inline simplificados
em `src/components/ui/social-icons.tsx`.

## Tipografia

O frame usa fonte monoespaçada; sem acesso ao arquivo original da fonte, o
projeto usa a pilha `Space Mono → ui-monospace → Consolas` definida em
`src/styles/globals.css` (token `--font-sans`). Trocar a família exige alterar
apenas esse token.

## Referências visuais

Os exports oficiais dos frames usados para comparação e regressão visual
estão em `docs/figma/desktop` e `docs/figma/mobile` (somente referência; não
são servidos pela aplicação).

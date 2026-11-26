/**
 * Monta docs/comparacao/index.html pareando os frames do Figma
 * (docs/figma/*) com as capturas atuais (docs/comparacao/shots/*).
 * Uso: npm run compare:page  (depois de COMPARE=1 npx playwright test compare-captures)
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const PAIRS = [
  ['inicio', 'Início'],
  ['detalhe', 'Detalhes do NFT'],
  ['carrinho', 'Carrinho de NFTs'],
  ['pagamento', 'Pagamento'],
  ['confirmacao', 'Confirmação de Pedido'],
  ['login', 'Login'],
  ['cadastro', 'Cadastro'],
  ['perfil', 'Perfil do Colecionador'],
  ['carteiras', 'Carteiras'],
]

const mobileFigma = new Set(['inicio', 'detalhe', 'carrinho', 'pagamento', 'login', 'cadastro'])

mkdirSync('docs/comparacao', { recursive: true })

const card = (title, figma, shot) => `
  <section>
    <h2>${title}</h2>
    <div class="row">
      <figure><figcaption>Figma</figcaption><img src="${figma}" alt="Figma ${title}" loading="lazy"></figure>
      <figure><figcaption>App (captura atual)</figcaption><img src="${shot}" alt="App ${title}" loading="lazy"></figure>
    </div>
  </section>`

let body = ''
for (const [key, title] of PAIRS) {
  const figmaD = `../figma/desktop/${key}.png`
  const shotD = `shots/desktop-${key}.png`
  if (existsSync(`docs/figma/desktop/${key}.png`) && existsSync(`docs/comparacao/${shotD}`)) {
    body += card(`Desktop · ${title}`, figmaD, shotD)
  }
  if (mobileFigma.has(key) && existsSync(`docs/comparacao/shots/mobile-${key}.png`)) {
    body += card(`Mobile · ${title}`, `../figma/mobile/${key}.png`, `shots/mobile-${key}.png`)
  }
}

writeFileSync(
  'docs/comparacao/index.html',
  `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>KURIÓ — comparação Figma × App</title>
<style>
  body { margin: 0; background: #140d0a; color: #f5f1eb; font-family: monospace; }
  header { padding: 24px; }
  h1 { font-size: 20px; }
  p { color: #bdb8b3; font-size: 12px; max-width: 70ch; }
  section { padding: 8px 24px 32px; }
  h2 { font-size: 14px; color: #d28a4c; border-bottom: 1px solid #3f2319; padding-bottom: 8px; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  figure { margin: 0; }
  figcaption { font-size: 11px; color: #bdb8b3; margin-bottom: 6px; }
  img { width: 100%; border: 1px solid #3f2319; border-radius: 8px; background: #241612; }
  @media (max-width: 900px) { .row { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<header>
  <h1>Comparação Figma × App</h1>
  <p>Gerada por <code>npm run compare:page</code> a partir de <code>docs/figma/</code> (referência)
  e <code>docs/comparacao/shots/</code> (capturas do app rodando com mocks).
  Regere as capturas com <code>COMPARE=1 npx playwright test tests/e2e/compare-captures.spec.ts</code>.</p>
</header>
${body}
</body>
</html>
`,
)
console.log('docs/comparacao/index.html gerado')

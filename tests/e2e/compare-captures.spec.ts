import { expect, test, type Page } from '@playwright/test'

/**
 * Ferramenta manual de comparação visual (não roda na suíte padrão):
 *   COMPARE=1 npx playwright test tests/e2e/compare-captures.spec.ts
 * Gera docs/comparacao/shots/*.png; depois rode:
 *   npm run compare:page  → monta docs/comparacao/index.html (Figma × app).
 */
test.skip(!process.env.COMPARE, 'rodar com COMPARE=1')

async function seed(page: Page) {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  await page.evaluate(() => window.__KURIO__.reset())
  await page.reload()
  await page.waitForSelector('article')
}

async function login(page: Page) {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await page.waitForURL('/')
}

async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images).map((img) => (img.complete ? Promise.resolve() : img.decode())),
    ),
  )
  await page.waitForTimeout(400)
}

const SHOTS = 'docs/comparacao/shots'

test('capturas para comparação com o Figma', async ({ page }) => {
  for (const [viewport, tag] of [
    [{ width: 1440, height: 900 }, 'desktop'],
    [{ width: 390, height: 844 }, 'mobile'],
  ] as const) {
    await page.setViewportSize(viewport)
    await seed(page)
    await page.screenshot({ path: `${SHOTS}/${tag}-inicio.png`, fullPage: true })

    await page.goto('/nft/nft_001')
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/${tag}-detalhe.png`, fullPage: true })

    await login(page)
    await page.goto('/entrar')
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/${tag}-login.png`, fullPage: true })
    await page.goto('/cadastro')
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/${tag}-cadastro.png`, fullPage: true })

    await page.goto('/nft/nft_007')
    await page.getByRole('button', { name: 'Comprar', exact: true }).locator('visible=true').first().click()
    await page.waitForURL('/pagamento')
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/${tag}-pagamento.png`, fullPage: true })

    await page.goto('/carrinho')
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/${tag}-carrinho.png`, fullPage: true })

    await page.goto('/pagamento')
    const confirm = page.getByRole('button', { name: 'Confirmar compra' }).locator('visible=true').first()
    await expect(confirm).toBeEnabled({ timeout: 15_000 })
    await confirm.click()
    await page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }).waitFor({ timeout: 20_000 })
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/${tag}-confirmacao.png`, fullPage: true })

    await page.goto('/perfil')
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/${tag}-perfil.png`, fullPage: true })

    await page.goto('/carteiras')
    await settle(page)
    await page.screenshot({ path: `${SHOTS}/${tag}-carteiras.png`, fullPage: true })
  }
})

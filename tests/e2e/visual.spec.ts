import { expect, test } from '@playwright/test'

/**
 * Regressão visual com dados estáveis (reset antes de cada captura).
 * Baselines versionadas em tests/e2e/visual.spec.ts-snapshots/.
 * Atualizar propositalmente: npx playwright test --update-snapshots visual
 */
async function seed(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  await page.evaluate(() => window.__KURIO__.reset())
  await page.reload()
  await page.waitForSelector('article')
  // imagens carregadas antes do snapshot
  await page.evaluate(() => Promise.all(Array.from(document.images).map((img) => (img.complete ? Promise.resolve() : img.decode()))))
}

async function seedWithCart(page: import('@playwright/test').Page) {
  await seed(page)
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')
  await page.goto('/nft/nft_007')
  await page.getByRole('button', { name: 'Comprar', exact: true }).locator('visible=true').first().click()
  await expect(page).toHaveURL('/pagamento')
}

test('visual início', async ({ page }) => {
  await seed(page)
  await expect(page).toHaveScreenshot('inicio.png', { fullPage: true, maxDiffPixelRatio: 0.02 })
})

test('visual detalhe', async ({ page }) => {
  await seed(page)
  await page.goto('/nft/nft_001')
  await page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' }).waitFor()
  await page.evaluate(() => Promise.all(Array.from(document.images).map((img) => (img.complete ? Promise.resolve() : img.decode()))))
  await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true, maxDiffPixelRatio: 0.02 })
})

test('visual carrinho', async ({ page }) => {
  await seedWithCart(page)
  await page.goto('/carrinho')
  await page.waitForSelector('li')
  await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true, maxDiffPixelRatio: 0.02 })
})

test('visual pagamento', async ({ page }) => {
  await seedWithCart(page)
  // no mobile o formulário do colecionador é desktop-only; espera o resumo
  await page.getByText('Seus NFTs').first().waitFor()
  await page.evaluate(() => Promise.all(Array.from(document.images).map((img) => (img.complete ? Promise.resolve() : img.decode()))))
  await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true, maxDiffPixelRatio: 0.02 })
})

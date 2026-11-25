import { expect, test, type Page } from '@playwright/test'

/**
 * Captura telas para comparação manual com docs/figma (não assertion).
 * O carrinho/pagamento são semeados pela própria UI (login + detalhe).
 */
async function seed(page: Page) {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  await page.evaluate(() => window.__KURIO__.reset())
  await page.reload()
  await page.waitForSelector('article')

  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')

  for (const nftId of ['nft_001', 'nft_003']) {
    await page.goto(`/nft/${nftId}`)
    await page.getByRole('button', { name: 'Comprar', exact: true }).first().click()
    await expect(page).toHaveURL('/pagamento')
  }
}

const pages = [
  { name: 'inicio', path: '/' },
  { name: 'detalhe', path: '/nft/nft_001' },
  { name: 'carrinho', path: '/carrinho' },
  { name: 'pagamento', path: '/pagamento' },
]

test('captura desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await seed(page)
  for (const target of pages) {
    await page.goto(target.path)
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `shots/desktop-${target.name}.png`, fullPage: true })
  }
})

test('captura mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page)
  for (const target of pages) {
    await page.goto(target.path)
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `shots/mobile-${target.name}.png`, fullPage: true })
  }
})

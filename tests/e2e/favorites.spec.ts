import { expect, test, type Page } from '@playwright/test'

/**
 * Favoritos: persistência para o usuário autenticado, atualização otimista e
 * rollback em falha de mutation.
 */
// Rollback depende de latência simulada; sob carga de suíte completa pode
// precisar de uma segunda tentativa sem esconder falhas reais de produto.
test.describe.configure({ retries: 1 })
async function login(page: Page) {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  await page.evaluate(() => window.__KURIO__.reset())
  await page.reload()
  await page.waitForSelector('article')
})

test('favorito persiste após refresh e some ao desfavoritar', async ({ page }) => {
  await login(page)
  await page.goto('/nft/nft_001')
  const favorite = page.getByRole('button', { name: 'Favoritar' })
  await favorite.click()
  await expect(favorite).toHaveAttribute('aria-pressed', 'true')

  await page.reload()
  await page.getByRole('button', { name: 'Favoritar' }).click()
  await expect(page.getByRole('button', { name: 'Favoritar' })).toHaveAttribute('aria-pressed', 'false')
})

test('falha de mutation de favorito faz rollback do otimista', async ({ page }) => {
  await login(page)
  await page.goto('/nft/nft_001')
  const favorite = page.getByRole('button', { name: 'Favoritar' })
  await expect(favorite).toBeVisible()
  // falha só a partir do clique: o carregamento do detalhe precisa funcionar
  await page.evaluate(() => window.__KURIO__.config({ failRate: 1 }))
  await favorite.click()
  // otimista marca true e o rollback devolve para false
  await expect(favorite).toHaveAttribute('aria-pressed', 'false', { timeout: 10_000 })
  await page.evaluate(() => window.__KURIO__.config({ failRate: 0 }))
})

test('favoritos aparecem no recorte Lista de interesse', async ({ page }) => {
  await login(page)
  await page.goto('/nft/nft_001')
  await page.getByRole('button', { name: 'Favoritar' }).click()
  await page.goto('/?fav=1')
  await expect(page.locator('#catalogo article').filter({ hasText: 'Emerald Ape #042' })).toBeVisible()
  // o recorte só traz favoritos: um NFT nunca favoritado não aparece
  await expect(page.locator('#catalogo article').filter({ hasText: 'Neon Vessel #552' })).toHaveCount(0)
})

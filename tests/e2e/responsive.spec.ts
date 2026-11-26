import { expect, test, type Page } from '@playwright/test'

/**
 * Item 8 do enunciado: todas as telas em 390, 768 e 1440 px, sem overflow
 * horizontal indevido nem perda de conteúdo.
 */
const WIDTHS = [390, 768, 1440] as const

const ROUTES = ['/', '/nft/nft_001', '/carrinho', '/entrar'] as const

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow, `overflow horizontal de ${overflow}px em ${page.url()}`).toBeLessThanOrEqual(0)
}

for (const width of WIDTHS) {
  test(`layout íntegro em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.waitForFunction(() => Boolean(window.__KURIO__))
    await page.evaluate(() => window.__KURIO__.reset())

    for (const route of ROUTES) {
      await page.goto(route)
      await page.waitForTimeout(600)
      await assertNoHorizontalOverflow(page)
    }

    // tela privada com sessão ativa
    await page.goto('/entrar')
    await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
    await page.getByLabel(/^Senha/).fill('kurio1234')
    await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
    await expect(page).toHaveURL('/')
    for (const route of ['/perfil', '/carteiras', '/pedidos'] as const) {
      await page.goto(route)
      await page.waitForTimeout(600)
      await assertNoHorizontalOverflow(page)
    }
  })
}

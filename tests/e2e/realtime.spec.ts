import { expect, test } from '@playwright/test'

/**
 * W6/W7/W8 + E4: eventos reais de servidor chegam ao cliente via Socket.IO
 * (interceptado pelo MSW) e atualizam o cache — sem recarregar a página.
 */
async function waitForMocks(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => Boolean(window.__KURIO__), undefined, { timeout: 15_000 })
}

test('preço alterado no servidor atualiza o catálogo via socket', async ({ page }) => {
  await page.goto('/')
  const firstCard = page.locator('article').first()
  await expect(firstCard).toBeVisible()
  await waitForMocks(page)

  const before = await firstCard.locator('p.text-accent').first().innerText()

  const patched = await page.evaluate(async () => {
    const list = await (await fetch('/api/nfts?page=1&pageSize=1&sort=recent')).json()
    const nftId = list.items[0].id
    const detail = await (await fetch(`/api/nfts/${nftId}`)).json()
    const editionId = detail.editions[0].id
    window.__KURIO__.patchEdition(nftId, editionId, { priceEth: '7.777' }, 'price-changed')
    return { nftId, editionId }
  })

  await expect(firstCard.locator('p.text-accent').first()).not.toHaveText(before, {
    timeout: 15_000,
  })
  await expect(firstCard.locator('p.text-accent').first()).toContainText('7,777')

  const events = await page.evaluate(() => window.__KURIO__.events())
  expect(events.length).toBeGreaterThanOrEqual(1)
  expect(events[0].payload).toMatchObject({ nftId: patched.nftId })
})

test('pedido só muda de status por evento do servidor', async ({ page }) => {
  await page.goto('/')
  await waitForMocks(page)
  await page.evaluate(() => window.__KURIO__.reset())

  // login
  await page.getByRole('button', { name: 'Entrar' }).first().click()
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page.getByRole('link', { name: /Gustavo/i })).toBeVisible()

  // compra direta pela tela de detalhe (adiciona e leva ao pagamento)
  await page.locator('article a').first().click()
  await page.getByRole('button', { name: 'Comprar', exact: true }).first().click()
  await expect(page).toHaveURL('/pagamento')

  // checkout
  await page.getByLabel('Carteira cadastrada').selectOption({ index: 1 })
  await page.getByLabel('Nome completo').fill('Gustavo Teste')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()

  await expect(page.getByRole('heading', { name: /Pagamento em andamento|Sua compra foi confirmada/i })).toBeVisible()

  // o status final vem do servidor simulado (socket/polling), nunca do clique
  await expect(
    page.getByRole('heading', { name: /Sua compra foi confirmada|Pagamento não autorizado/i }),
  ).toBeVisible({ timeout: 20_000 })
})

import { expect, test } from '@playwright/test'

/**
 * Compra completa, recusa, clique repetido (idempotência) e timeout com
 * recuperação do mesmo pedido — tudo passando pela simulação (MSW + socket).
 */
async function login(page: import('@playwright/test').Page, email = 'gustavo@kurio.test', password = 'kurio1234') {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill(email)
  await page.getByLabel(/^Senha/).fill(password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')
}

async function addToCart(page: import('@playwright/test').Page, nftId: string) {
  await page.goto(`/nft/${nftId}`)
  await page.getByRole('button', { name: 'Comprar', exact: true }).first().click()
  await expect(page).toHaveURL('/pagamento')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  await page.evaluate(() => window.__KURIO__.reset())
  await page.reload()
  await page.waitForSelector('article')
  await login(page)
})

test('compra completa do catálogo ao recibo confirmado', async ({ page }) => {
  await addToCart(page, 'nft_007')
  await page.getByRole('button', { name: 'Confirmar compra' }).first().click()

  await expect(
    page.getByRole('heading', { name: /Pagamento em andamento|Seus NFTs agora estão/i }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }),
  ).toBeVisible({ timeout: 20_000 })

  // recibo reproduz o snapshot e o carrinho perde apenas o item comprado
  await expect(page.getByText('Golden Beat #207')).toBeVisible()
  await page.goto('/carrinho')
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
})

test('pagamento recusado mantém os itens no carrinho', async ({ page }) => {
  await addToCart(page, 'nft_007')
  await page.getByLabel(/Cenário de demonstração/).check()
  await page.getByRole('button', { name: 'Confirmar compra' }).first().click()

  await expect(page.getByRole('heading', { name: /Pagamento recusado/i })).toBeVisible({
    timeout: 20_000,
  })
  await page.goto('/carrinho')
  await expect(page.getByText('Golden Beat #207')).toBeVisible()
})

test('clique repetido não duplica o pedido (idempotência)', async ({ page }) => {
  await addToCart(page, 'nft_007')
  const confirm = page.getByRole('button', { name: 'Confirmar compra' }).first()
  // dois cliques rápidos: o segundo ainda carrega a mesma chave de idempotência
  await confirm.click({ clickCount: 2 })

  await expect(page).toHaveURL(/\/pedido\//, { timeout: 20_000 })
  const orderId = new URL(page.url()).pathname.split('/').pop()
  const orders = await page.evaluate(async () => {
    const token = localStorage.getItem('kurio:session-token')
    const response = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
    return (await response.json()).items
  })
  expect(orders).toHaveLength(1)
  expect(orders[0].id).toBe(orderId)
})

test('timeout após criação recupera o mesmo pedido', async ({ page }) => {
  await addToCart(page, 'nft_007')
  // servidor some com a resposta da criação (timeout no cliente)
  await page.evaluate(() => window.__KURIO__.config({ timeoutMs: 12_000 }))
  const confirm = page.getByRole('button', { name: 'Confirmar compra' }).first()
  await confirm.click()
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 20_000 })

  // reenvio com a MESMA chave de idempotência recupera o pedido já criado
  await page.evaluate(() => window.__KURIO__.config({ timeoutMs: 0 }))
  await confirm.click()
  await expect(page).toHaveURL(/\/pedido\//)
  const orders = await page.evaluate(async () => {
    const token = localStorage.getItem('kurio:session-token')
    const response = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
    return (await response.json()).items
  })
  expect(orders).toHaveLength(1)
})

test('cotação desatualizada bloqueia a confirmação', async ({ page }) => {
  await addToCart(page, 'nft_007')
  // preço muda no servidor, na MESMA edição que está no carrinho
  await page.evaluate(async () => {
    const token = localStorage.getItem('kurio:session-token')
    const cart = await (await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } })).json()
    const item = cart.items[0]
    window.__KURIO__.patchEdition(item.nftId, item.editionId, { priceEth: '3.33' }, 'price-changed')
  })
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: 'Confirmar compra' }).first().click()
  await expect(page.getByText(/valores mudaram|cotação/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Atualizar e confirmar de novo/i })).toBeVisible()
})

import { expect, test, type Page } from '@playwright/test'

/**
 * Carrinho: quantidades, remoção, cupom inválido/válido, persistência após
 * refresh e preservação do carrinho de visitante ao autenticar.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  await page.evaluate(() => window.__KURIO__.reset())
  await page.reload()
  await page.waitForSelector('article')
})

async function login(page: Page) {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')
}

test('quantidade, cupom e remoção', async ({ page }) => {
  await login(page)
  // nft_007 (Golden Beat #207) tem edição com estoque > 1
  await page.goto('/nft/nft_007')
  await page.getByRole('button', { name: 'Comprar', exact: true }).locator('visible=true').first().click()
  await expect(page).toHaveURL('/pagamento')
  await page.goto('/carrinho')

  const quantity = page.locator('li span[aria-live]').first()
  await page.getByRole('button', { name: /Aumentar quantidade de/ }).click()
  await expect(quantity).toHaveText('2')

  await page.reload()
  await expect(page.locator('li span[aria-live]').first()).toHaveText('2')

  await page.getByLabel('Código promocional').fill('NAOEXISTE')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByRole('alert')).toBeVisible()

  await page.getByLabel('Código promocional').fill('KURIO10')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByText(/KURIO10/)).toBeVisible()

  await page.getByRole('button', { name: /Remover Golden Beat #207 do carrinho/ }).click()
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
})

test('compra direta cria o item no carrinho mesmo sem concluir o checkout', async ({ page }) => {
  await page.goto('/nft/nft_007')
  await page.getByRole('button', { name: 'Comprar', exact: true }).locator('visible=true').first().click()
  // checkout exige autenticação: redireciona preservando o destino
  await expect(page).toHaveURL(/\/entrar\?redirect=/)
  // o item já foi adicionado ao carrinho de visitante
  await page.goto('/carrinho')
  await expect(page.getByText('Golden Beat #207')).toBeVisible()
})

test('visitante deslogado acessa o carrinho sem ser enviado ao login', async ({ page }) => {
  await page.goto('/carrinho')
  await expect(page).toHaveURL('/carrinho')
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
})

test('carrinho de visitante é preservado ao autenticar', async ({ page }) => {
  await page.goto('/nft/nft_001')
  await page.getByRole('button', { name: 'Comprar', exact: true }).locator('visible=true').first().click()
  // deslogado: checkout redireciona para o login preservando o destino
  await expect(page).toHaveURL(/\/entrar\?redirect=/)
  await page.getByLabel(/^E-mail/).fill('nova@kurio.test')
  await page.getByLabel(/^Senha/).fill('ape4567')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/pagamento')
  await page.goto('/carrinho')
  await expect(page.getByText('Emerald Ape #042')).toBeVisible()
})

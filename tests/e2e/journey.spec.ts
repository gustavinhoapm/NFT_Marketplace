import { expect, test, type Page } from '@playwright/test'

/**
 * Jornada completa do colecionador, na ordem do aceite manual:
 * criar conta → deslogar → logar → adicionar item → remover item →
 * adicionar de novo → finalizar compra → recibo confirmado.
 */
async function waitForMocks(page: Page) {
  await page.waitForFunction(() => Boolean(window.__KURIO__), undefined, { timeout: 15_000 })
}

test('jornada: conta, sessão, carrinho e compra', async ({ page }) => {
  // --- criar conta
  await page.goto('/cadastro')
  await waitForMocks(page)
  await page.evaluate(() => window.__KURIO__.reset())
  await page.getByLabel(/^Nome de usuário/).fill('jornada')
  await page.getByLabel(/^E-mail/).fill('jornada@kurio.test')
  await page.getByLabel(/^Senha/).fill('jornada-1234')
  await page.getByLabel(/^Confirmar senha/).fill('jornada-1234')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL('/')

  // --- deslogar
  await page.goto('/perfil')
  await page.getByRole('button', { name: /^Sair/ }).locator('visible=true').first().click()
  await expect(page).toHaveURL('/')

  // --- logar de novo (sessão recuperável)
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('jornada@kurio.test')
  await page.getByLabel(/^Senha/).fill('jornada-1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')

  // --- cadastrar carteira (conta nova não tem nenhuma; o checkout exige uma)
  await page.goto('/carteiras')
  await page.getByRole('button', { name: 'Adicionar' }).first().click()
  await page.getByLabel(/^Apelido da carteira/).fill('Principal Jornada')
  await page.getByRole('button', { name: 'Gerar endereço de teste' }).click()
  await page.getByLabel(/^Rede/).selectOption('ethereum')
  await page.getByLabel(/^Tipo de carteira/).selectOption('metamask')
  await page.getByLabel(/^Código de indicação/).fill('KURIO-JOR-01')
  await page.getByRole('button', { name: 'Salvar carteira' }).last().click()
  // a primeira carteira vira principal e aparece no formulário da seção principal
  await expect(page.getByLabel(/^Apelido da carteira/)).toHaveValue('Principal Jornada')

  // --- adicionar item
  await page.goto('/nft/nft_007')
  await page.getByRole('button', { name: 'Comprar', exact: true }).locator('visible=true').first().click()
  await expect(page).toHaveURL('/pagamento')
  await page.goto('/carrinho')
  await expect(page.getByText('Golden Beat #207')).toBeVisible()

  // --- remover item
  await page.getByRole('button', { name: /Remover Golden Beat #207 do carrinho/ }).click()
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()

  // --- adicionar de novo e finalizar
  await page.goto('/nft/nft_002')
  await page.getByRole('button', { name: 'Comprar', exact: true }).locator('visible=true').first().click()
  await expect(page).toHaveURL('/pagamento')
  const confirm = page.getByRole('button', { name: 'Confirmar compra' }).locator('visible=true').first()
  await expect(confirm).toBeEnabled({ timeout: 15_000 })
  await confirm.click()

  // --- recibo: pendente → confirmado pela simulação
  await expect(page.getByRole('heading', { name: /Pagamento em andamento/i })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }),
  ).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText('Sage Nomad #009')).toBeVisible()

  // --- carrinho esvaziado apenas pelos itens comprados
  await page.goto('/carrinho')
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()

  // --- pedido listado e recibo recuperável após refresh
  await page.goto('/pedidos')
  await page.getByRole('link', { name: 'Ver recibo' }).first().click()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }),
  ).toBeVisible()
})

import { expect, test } from '@playwright/test'

/**
 * Conta e sessão: cadastro com conflito, expiração durante a navegação,
 * troca de usuário limpando dados privados, edição de perfil/senha/carteiras
 * com erros de validação vindos da API.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  await page.evaluate(() => window.__KURIO__.reset())
  await page.reload()
  await page.waitForSelector('article')
})

test('cadastro com e-mail duplicado apresenta conflito da API', async ({ page }) => {
  await page.goto('/cadastro')
  await page.getByLabel(/^Nome de usuário/).fill('novato')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('senha1234')
  await page.getByLabel(/^Confirmar senha/).fill('senha1234')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page).toHaveURL('/cadastro')
})

test('sessão expirada durante a navegação leva ao login preservando contexto', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')

  await page.evaluate(() => window.__KURIO__.config({ forceSessionExpired: true }))
  await page.goto('/perfil')
  await expect(page).toHaveURL(/\/entrar\?redirect=/)
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  await page.evaluate(() => window.__KURIO__.config({ forceSessionExpired: false }))

  // login devolve ao contexto original
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/perfil')
})

test('troca de usuário não expõe dados do anterior', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')
  await page.goto('/nft/nft_001')
  await page.getByRole('button', { name: 'Favoritar' }).click()

  await page.goto('/perfil')
  await page.getByRole('button', { name: /^Sair/ }).locator('visible=true').first().click()
  await expect(page).toHaveURL('/')

  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('nova@kurio.test')
  await page.getByLabel(/^Senha/).fill('ape4567')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')

  // o favorito de Gustavo não pode aparecer para Nova
  await page.goto('/?fav=1')
  await expect(page.locator('#catalogo article').filter({ hasText: 'Emerald Ape #042' })).toHaveCount(0)
})

test('edição de perfil persiste após refresh e valida erros da API', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')

  await page.goto('/perfil')
  await page.getByLabel(/^Nome de exibição/).fill('Gustavo Editado')
  await page.getByLabel(/^E-mail/).fill('email-invalido')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()

  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText('Perfil atualizado.')).toBeVisible()

  await page.reload()
  await expect(page.getByLabel(/^Nome de exibição/)).toHaveValue('Gustavo Editado')
})

test('senha com confirmação divergente é barrada no cliente', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')

  await page.goto('/perfil')
  await page.getByLabel(/^Senha atual/).fill('kurio1234')
  await page.getByLabel(/^Nova senha/).fill('nova12345')
  await page.getByLabel(/^Confirmar nova senha/).fill('outra12345')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText(/não confere/)).toBeVisible()
})

test('carteira secundária valida endereço e persiste', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')

  await page.goto('/carteiras')
  await page.getByRole('button', { name: 'Adicionar' }).first().click()
  await page.getByLabel(/^Apelido da carteira/).fill('Reserva fria')
  await page.getByLabel(/^Endereço da carteira/).fill('0x123')
  await page.getByRole('button', { name: 'Salvar carteira' }).last().click()
  await expect(page.getByText('Endereço 0x inválido')).toBeVisible()

  await page.getByLabel(/^Endereço da carteira/).fill('0xABCDEF0123456789ABCDEF0123456789ABCDEF01')
  await page.getByLabel(/^Rede/).selectOption('polygon')
  await page.getByLabel(/^Tipo de carteira/).selectOption('metamask')
  await page.getByLabel(/^Código de indicação/).fill('KURIO-TESTE-01')
  await page.getByRole('button', { name: 'Salvar carteira' }).last().click()
  await expect(page.getByText('Reserva fria')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Reserva fria')).toBeVisible()
})

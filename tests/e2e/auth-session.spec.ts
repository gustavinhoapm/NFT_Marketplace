import { expect, test } from '@playwright/test'

test('login social simulado autentica conta de demonstração', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByRole('button', { name: 'Continuar com Google' }).click()
  await expect(page).toHaveURL('/')
  // sessão efetiva (independente de viewport: header some no mobile)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('kurio:session-token')))
    .toBeTruthy()
})

test('logout limpa o nome no header e os dados privados', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')
  await expect(page.locator('header')).toContainText('Gustavo')

  await page.goto('/perfil')
  await page.getByRole('button', { name: /^Sair/ }).locator('visible=true').first().click()
  await expect(page).toHaveURL('/')
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  // nenhum affordance autenticado permanece (header no desktop, bottom nav no mobile)
  await expect(page.getByRole('link', { name: /Gustavo/ })).toHaveCount(0)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('kurio:session-token')))
    .toBeNull()
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__KURIO__.cache().some((entry) => entry.key[0] === 'profile' && entry.hasData),
      ),
    )
    .toBe(false)
})

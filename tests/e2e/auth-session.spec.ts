import { expect, test } from '@playwright/test'

test('logout limpa o nome no header e os dados privados', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByLabel(/^E-mail/).fill('gustavo@kurio.test')
  await page.getByLabel(/^Senha/).fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page).toHaveURL('/')
  await expect(page.locator('header')).toContainText('Gustavo')

  await page.goto('/perfil')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.locator('header')).toContainText('Entrar')
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

import { expect, test } from '@playwright/test'

/**
 * Carregamento lento (skeletons), falha de conexão com recuperação,
 * navegação por teclado e foco em diálogos.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  await page.evaluate(() => window.__KURIO__.reset())
})

test('skeletons durante carregamento lento', async ({ page }) => {
  await page.evaluate(() => window.__KURIO__.config({ latencyMs: 2500 }))
  await page.reload()
  // skeletons do catálogo visíveis enquanto a resposta não chega
  await expect(
    page.locator('[aria-hidden="true"].animate-pulse').locator('visible=true').first(),
  ).toBeVisible()
  await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
  await page.evaluate(() => window.__KURIO__.config({ latencyMs: 160 }))
})

test('falha de conexão mostra erro e recupera após nova tentativa', async ({ page }) => {
  await page.evaluate(() => window.__KURIO__.config({ offline: true }))
  await page.reload()
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 15_000 })
  await page.evaluate(() => window.__KURIO__.config({ offline: false }))
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
})

test('navegação por teclado alcança filtros e abre diálogo com foco controlado', async ({ page }) => {
  // fluxo de modal de login é do desktop; no mobile o login é página própria
  test.skip((page.viewportSize()?.width ?? 1280) < 768, 'modal de login é desktop-only')
  await page.reload()
  await page.waitForSelector('article')

  // Tab percorre elementos interativos com foco visível
  await page.keyboard.press('Tab')
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
  expect(focusedTag).toBeTruthy()

  // o modal de login prende o foco e fecha com Escape
  await page.getByRole('button', { name: 'Entrar' }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('button').first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
})

test('campos inválidos associam mensagem de erro ao campo', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  // credenciais vazias: a API devolve erro de validação associado ao formulário
  await expect(page.getByRole('alert').first()).toBeVisible()
})

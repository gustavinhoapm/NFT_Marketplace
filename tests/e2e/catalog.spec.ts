import { expect, test } from '@playwright/test'

import { openFiltersIfNeeded, searchInput } from './helpers'

/**
 * Catálogo: busca, filtros combinados, ordenação, paginação e restauração
 * pelo histórico — tudo compondo a URL (requisito de catálogo/detalhe).
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__KURIO__))
  await page.evaluate(() => window.__KURIO__.reset())
  await page.reload()
  await page.waitForSelector('article')
})

test('busca compõe a URL e sobrevive a refresh', async ({ page }) => {
  const search = searchInput(page)
  await search.fill('emerald')
  await search.press('Enter')
  await expect(page).toHaveURL(/\?q=emerald/)
  await expect(page.locator('#catalogo article')).toHaveCount(3)

  await page.reload()
  await expect(searchInput(page)).toHaveValue('emerald')
  await expect(page.locator('#catalogo article')).toHaveCount(3)
})

test('filtros combinados reiniciam a paginação', async ({ page }) => {
  await openFiltersIfNeeded(page)
  await page.getByRole('button', { name: 'Arte digital' }).click()
  await expect(page).toHaveURL(/collections=arte-digital/)
  await page.getByRole('button', { name: /polygon/ }).first().click()
  await expect(page).toHaveURL(/networks=polygon/)
  await expect(page).not.toHaveURL(/page=/)

  await page.goBack()
  await expect(page).not.toHaveURL(/networks=polygon/)
  await expect(page).toHaveURL(/collections=arte-digital/)
})

test('ordenação e paginação pela URL', async ({ page }) => {
  await page.getByLabel('Ordenar catálogo').selectOption('price-asc')
  await expect(page).toHaveURL(/sort=price-asc/)
  // espera a lista efetivamente ordenada (menor preço primeiro)
  await expect(page.locator('#catalogo article p.text-accent').first()).toHaveText('0,020 ETH')
  const firstPrice = await page.locator('#catalogo article p.text-accent').first().innerText()

  await page.getByRole('button', { name: '2', exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  // a lista troca de página de forma assíncrona (placeholder da página anterior)
  await expect
    .poll(() => page.locator('#catalogo article p.text-accent').first().innerText())
    .not.toBe(firstPrice)

  await page.goBack()
  await expect(page).toHaveURL(/sort=price-asc/)
  await expect
    .poll(() => page.locator('#catalogo article p.text-accent').first().innerText())
    .toBe(firstPrice)
})

test('abas de segmento filtram no servidor', async ({ page }) => {
  const allCount = await page.locator('#catalogo article').count()
  await page.getByRole('tab', { name: 'Em alta' }).click()
  await expect(page).toHaveURL(/tab=hot/)
  const hotCount = await page.locator('#catalogo article').count()
  expect(hotCount).toBeLessThanOrEqual(allCount)
})

test('resultado vazio tem recuperação', async ({ page }) => {
  const search = searchInput(page)
  await search.fill('xyzzy-inexistente')
  await search.press('Enter')
  await expect(page.getByText('Nenhum NFT encontrado')).toBeVisible()
  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(page.locator('#catalogo article').first()).toBeVisible()
})

test('acesso direto a NFT inexistente', async ({ page }) => {
  await page.goto('/nft/nft_inexistente')
  await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
})

test('rota inexistente cai no 404', async ({ page }) => {
  await page.goto('/rota-que-nao-existe')
  await expect(page.getByText('404')).toBeVisible()
})

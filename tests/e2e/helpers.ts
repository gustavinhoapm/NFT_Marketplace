import type { Locator, Page } from '@playwright/test'

/** Primeiro elemento visível de um locator (desktop e mobile compartilham DOM). */
export function visible(locator: Locator): Locator {
  return locator.locator('visible=true').first()
}

/** Input de busca visível (header no desktop, barra no mobile). */
export function searchInput(page: Page): Locator {
  return visible(page.locator('input[type="search"]'))
}

/** Abre o drawer de filtros no mobile; no desktop a sidebar já está visível. */
export async function openFiltersIfNeeded(page: Page): Promise<void> {
  const trigger = page.getByRole('button', { name: 'Abrir filtros' })
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click()
  }
}

export function isMobile(page: Page): boolean {
  return page.viewportSize()?.width !== undefined && page.viewportSize()!.width < 768
}

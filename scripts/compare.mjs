/**
 * Gera o comparador Figma × app: captura as telas (COMPARE=1) e monta o HTML.
 * Uso: npm run compare
 */
import { execSync } from 'node:child_process'

process.env.COMPARE = '1'
execSync('npx playwright test tests/e2e/compare-captures.spec.ts --project=desktop', {
  stdio: 'inherit',
})
execSync('node scripts/make-compare-page.mjs', { stdio: 'inherit' })
console.log('Abra docs/comparacao/index.html no navegador.')

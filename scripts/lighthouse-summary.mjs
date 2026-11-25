/**
 * Consolida os relatórios JSON do LHCI (.lighthouseci/*.json) em
 * docs/lighthouse/RESULTADOS.md com a mediana de cada categoria por página e
 * perfil, além de LCP/CLS/TBT. Uso: node scripts/lighthouse-summary.mjs
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = '.lighthouseci'
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

const profiles = ['mobile', 'desktop']
const byProfile = {}

for (const profile of profiles) {
  const dir = join(DIR, profile)
  let files = []
  try {
    files = readdirSync(dir).filter((file) => file.endsWith('.json'))
  } catch {
    continue
  }
  const perUrl = {}
  for (const file of files) {
    const report = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    if (!report.categories) continue // manifest e afins
    const url = new URL(report.finalDisplayedUrl ?? report.requestedUrl).pathname
    const entry = (perUrl[url] ??= { categories: {}, metrics: {} })
    for (const [key, category] of Object.entries(report.categories ?? {})) {
      ;(entry.categories[key] ??= []).push(category.score ?? 0)
    }
    const audits = report.audits ?? {}
    for (const metric of ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time']) {
      ;(entry.metrics[metric] ??= []).push(audits[metric]?.numericValue ?? 0)
    }
    entry.env ??= {
      lighthouse: report.lighthouseVersion,
      node: process.version,
    }
  }
  byProfile[profile] = perUrl
}

const lines = [
  '# Resultados de auditoria (Lighthouse)',
  '',
  'Medições: 3 execuções por página e perfil (`lighthouserc.json` e',
  '`lighthouserc.desktop.json`), build de produção servido por `vite preview`,',
  'mocks no cenário padrão. Valores abaixo são a **mediana**.',
  '',
]

for (const [profile, perUrl] of Object.entries(byProfile)) {
  lines.push(`## Perfil ${profile}`, '')
  lines.push('| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP (ms) | CLS | TBT (ms) |')
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |')
  for (const [url, entry] of Object.entries(perUrl)) {
    const score = (key) => (entry.categories[key] ? (median(entry.categories[key]) * 100).toFixed(0) : '—')
    const metric = (key) => (entry.metrics[key] ? median(entry.metrics[key]).toFixed(0) : '—')
    lines.push(
      `| \`${url}\` | ${score('performance')} | ${score('accessibility')} | ${score('best-practices')} | ${score('seo')} | ${metric('largest-contentful-paint')} | ${(median(entry.metrics['cumulative-layout-shift'] ?? [0])).toFixed(3)} | ${metric('total-blocking-time')} |`,
    )
  }
  const env = Object.values(perUrl)[0]?.env
  if (env) lines.push('', `Lighthouse ${env.lighthouse} · Node ${env.node} · Windows/Chromium local.`)
  lines.push('')
}

lines.push(
  'Relatórios completos (HTML/JSON): gerados em `.lighthouseci/` (ignorado pelo git;',
  'reproduza com `npm run lighthouse` e `npm run lighthouse:desktop`).',
  '',
)

mkdirSync('docs/lighthouse', { recursive: true })
writeFileSync('docs/lighthouse/RESULTADOS.md', lines.join('\n'))
console.log('docs/lighthouse/RESULTADOS.md atualizado')

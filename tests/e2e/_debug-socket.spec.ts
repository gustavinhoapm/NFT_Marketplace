import { expect, test } from '@playwright/test'

test('diagnóstico do handshake socket.io', async ({ page }) => {
  const logs: string[] = []
  page.on('console', (message) => logs.push(`${message.type()}: ${message.text()}`))
  page.on('websocket', (ws) => {
    logs.push(`WS OPEN ${ws.url()}`)
    ws.on('framereceived', (frame) => logs.push(`WS IN ${String(frame.payload).slice(0, 80)}`))
    ws.on('framesent', (frame) => logs.push(`WS OUT ${String(frame.payload).slice(0, 80)}`))
    ws.on('close', () => logs.push('WS CLOSE'))
    ws.on('socketerror', (error) => logs.push(`WS ERROR ${error}`))
  })

  await page.goto('/')
  await page.waitForSelector('article')
  await page.waitForTimeout(4000)

  const connected = await page.evaluate(
    () => window.__KURIO__?.handlers().filter((h) => h.kind === 'websocket').length ?? -1,
  )
  console.log('WS HANDLERS:', connected)
  console.log(logs.join('\n'))
  expect(true).toBe(true)
})

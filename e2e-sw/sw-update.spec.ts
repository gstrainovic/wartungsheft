import type { Page } from '@playwright/test'
import type { Server } from 'node:http'
import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { expect, test } from '@playwright/test'

// Zwei Builds stellen zwei Deploys dar; der Server liefert wie Caddy in deploy/Caddyfile aus
// (try_files {path} {path}/index.html /index.html, Service Worker ohne Cache).
const ordner = mkdtempSync(join(tmpdir(), 'sw-update-'))
let live = 'a'
let server: Server
const PORT = 6071
const URL = `http://localhost:${PORT}`

const TYPEN: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' }

function datei(pfad: string): string {
  const basis = join(ordner, live)
  for (const kandidat of [join(basis, pfad), join(basis, pfad, 'index.html'), join(basis, 'index.html')]) {
    if (existsSync(kandidat) && statSync(kandidat).isFile())
      return kandidat
  }
  return join(basis, 'index.html')
}

function bauen(stand: string): void {
  execSync(`npx vite build -c e2e-sw/vite.config.ts --outDir ${join(ordner, stand)} --emptyOutDir`, {
    env: { ...process.env, SW_TEST_STAND: stand },
    stdio: 'ignore',
  })
}

async function stand(page: Page): Promise<string | null> {
  return page.locator('meta[name="sw-test-stand"]').getAttribute('content', { timeout: 1000 }).catch(() => null)
}

async function mitAltemStand(page: Page): Promise<void> {
  live = 'a'
  await page.goto(`${URL}/`)
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 30_000 }).toBe(true)
  await page.reload()
  expect(await stand(page)).toBe('a')
}

test.beforeAll(async () => {
  test.setTimeout(600_000)
  bauen('a')
  bauen('b')
  server = createServer((req, res) => {
    const pfad = decodeURIComponent(new globalThis.URL(req.url ?? '/', URL).pathname)
    const f = datei(pfad)
    res.writeHead(200, { 'Content-Type': TYPEN[extname(f)] ?? 'application/octet-stream', 'Cache-Control': 'public, max-age=0, must-revalidate' })
    res.end(readFileSync(f))
  })
  await new Promise<void>(r => server.listen(PORT, r))
})

test.afterAll(() => {
  server?.close()
  rmSync(ordner, { recursive: true, force: true })
})

test('nach einem Deploy zeigt schon die nächste Navigation den neuen Stand', async ({ page }) => {
  await mitAltemStand(page)
  live = 'b'
  await page.goto(`${URL}/`)
  await expect.poll(() => stand(page), { timeout: 20_000 }).toBe('b')
})

test('eine offene App holt den neuen Stand, sobald sie wieder sichtbar wird', async ({ page }) => {
  await mitAltemStand(page)
  live = 'b'
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect.poll(() => stand(page), { timeout: 20_000 }).toBe('b')
})

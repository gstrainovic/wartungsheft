import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Der Film trägt seine Untertitel als WebVTT-Spur in der Sprache der Seite, standardmässig an (Spur `showing`),
 * und die Datei kommt als text/vtt mit WEBVTT-Kopf an
 */
export async function untertitelPruefen(page: Page, video: Locator, src: string, sprache: string, name: string) {
  const spur = video.locator('track')
  await expect(spur).toHaveCount(1)
  await expect(spur).toHaveAttribute('src', src)
  await expect(spur).toHaveAttribute('kind', 'subtitles')
  await expect(spur).toHaveAttribute('srclang', sprache)
  await expect(spur).toHaveAttribute('label', name)
  await expect(spur).toHaveAttribute('default', '')
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.textTracks[0]?.mode)).toBe('showing')
  const res = await page.request.get(src)
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toMatch(/^text\/vtt/)
  expect(await res.text()).toMatch(/^WEBVTT\n\n\d\d:\d\d:\d\d\.\d{3} --> /)
}

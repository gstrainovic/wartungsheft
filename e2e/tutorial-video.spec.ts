import type { Locator } from '@playwright/test'
import { clearInstantDB, expect, test, waitForInstantDB } from './fixtures/test-fixtures'
import { untertitelPruefen } from './fixtures/untertitel'

// Tutorial «So startest du mit Wartungsheft» (video-scripts/tutorial-video-script.md) auf /hilfe in der Sprache der
// Seite, wie die Filme der Landing Pages: Handy hochkant, Desktop quer, Poster, VTT-Spur an, Start erst auf Klick.
// Die Checkliste «Einrichten» verweist darauf.

function quellen(v: Locator): Promise<string[]> {
  return v.locator('source').evaluateAll(s => s.map(e => `${e.getAttribute('src')} ${e.getAttribute('type')}`))
}

const SPRACHEN = [
  { pfad: '/hilfe', sprache: 'de', name: 'Deutsch', film: 'film-tutorial' },
  { pfad: '/fr/hilfe', sprache: 'fr', name: 'Français', film: 'film-tutorial-fr' },
  { pfad: '/it/hilfe', sprache: 'it', name: 'Italiano', film: 'film-tutorial-it' },
  { pfad: '/en/hilfe', sprache: 'en', name: 'English', film: 'film-tutorial-en' },
] as const

test.describe('Tutorial auf der Hilfe', () => {
  // Die Sprachwahl liegt am gemeinsamen Testnutzer: zurück auf Deutsch, damit folgende Tests deutsch laufen
  test.afterEach(async ({ page }) => {
    await clearInstantDB(page)
  })

  for (const { pfad, sprache, name, film } of SPRACHEN) {
    test(`TV-001 ${sprache}: ${pfad} zeigt das Tutorial der Sprache, quer und hochkant, mit Spur`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(pfad)
      const abschnitt = page.locator('#video')
      const video = abschnitt.locator('video')
      await expect.poll(() => quellen(video)).toEqual([`/${film}-desktop.mp4 video/mp4`])
      await expect(video).toHaveAttribute('poster', `/${film}-desktop-poster.jpg`)
      expect((await page.request.head(`/${film}-desktop.mp4`)).headers()['content-type']).toMatch(/^video\/mp4/)
      await untertitelPruefen(page, video, `/${film}.vtt`, sprache, name)
      // Kein Autoplay: stumm und angehalten, bis der Knopf startet
      expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
      await expect(abschnitt.locator('.video-play')).toBeVisible()

      await page.setViewportSize({ width: 390, height: 844 })
      await expect.poll(() => quellen(video)).toEqual([`/${film}.mp4 video/mp4`])
      await expect(video).toHaveAttribute('poster', `/${film}-poster.jpg`)
      expect((await page.request.head(`/${film}.mp4`)).headers()['content-type']).toMatch(/^video\/mp4/)
    })
  }

  test('TV-002: die Checkliste «Einrichten» führt zum Tutorial auf der Hilfe, in der Sprache der App', async ({ page }) => {
    for (const { sprache, pfad, link } of [
      { sprache: 'de', pfad: '/hilfe', link: 'Video-Anleitung ansehen' },
      { sprache: 'fr', pfad: '/fr/hilfe', link: 'Voir le tutoriel vidéo' },
    ]) {
      // Die App merkt sich die Sprache am Benutzer: je Sprache frisch beginnen
      await clearInstantDB(page)
      await page.addInitScript(s => localStorage.setItem('sprache', s), sprache)
      await page.goto('/dashboard')
      await waitForInstantDB(page)
      await page.evaluate(async () => {
        const { db, tx, id } = (window as any).__instantdb
        const now = new Date().toISOString()
        await db.transact(tx.vehicles[id()].update({ make: 'VW', model: 'Golf', year: 2016, mileage: 1000, licensePlate: 'SG 1', vin: '', createdAt: now, updatedAt: now }))
      })
      await page.goto('/vehicles')
      await page.locator('.vehicle-card').first().click()
      const verweis = page.getByTestId('setup-checklist').getByRole('link', { name: link })
      await expect(verweis).toHaveAttribute('href', `${pfad}#video`)
      await verweis.click()
      await expect(page).toHaveURL(new RegExp(`${pfad}#video$`))
      await expect(page.locator('#video video')).toBeVisible()
    }
  })
})

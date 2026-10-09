import { PAGE_META_SPRACHEN, SITE_URL } from '../src/lib/page-meta'
import { PRAEFIXE } from '../src/lib/sprache'
import { expect, test } from './fixtures/test-fixtures'

// Öffentliche Seiten auf Französisch, Italienisch und Englisch unter /fr, /it, /en (src/lib/sprache.ts).
// Deutsch bleibt ohne Präfix, damit bestehende Links weiter gelten.
const SEITEN = ['/', '/privathalter', '/betrieb', '/anlagen', '/hilfe', '/impressum', '/datenschutz', '/agb', '/login']

/** Interne Links einer Seite, ohne die Sprachwahl im Kopf (sie führt absichtlich in die anderen Sprachen) */
async function interneLinks(page: import('@playwright/test').Page): Promise<string[]> {
  return page.locator('a[href^="/"]:not([data-testid="language-switch"] a)').evaluateAll(links => links.map(a => a.getAttribute('href')!))
}

test.describe('Sprachfassungen', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth:localSignedOut', '1')
      localStorage.removeItem('auth:knownEmail')
    })
  })

  test('LANG-001: Startseite auf Französisch mit Sprache, Titel, hreflang und Einstieg in der Sprache', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CH')
    await expect(page).toHaveTitle(PAGE_META_SPRACHEN.fr['/']!.title)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('carnet d’entretien')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_URL}/fr`)
    await expect(page.locator('link[rel="alternate"][hreflang="de-CH"]')).toHaveAttribute('href', `${SITE_URL}/`)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', `${SITE_URL}/`)
    await expect(page.getByTestId('price-table')).toContainText('par an')
    // Auch die App hinter der Anmeldung spricht Französisch, das steht im Fuss
    await expect(page.getByRole('contentinfo')).toContainText('aussi en français')

    await expect(page.getByRole('button', { name: 'Essayer 30 jours gratuitement' }).first()).toBeVisible()
    await page.getByRole('banner').getByRole('button', { name: 'Essai gratuit' }).click()
    await expect(page).toHaveURL(/\/fr\/login$/)
    await expect(page.getByRole('button', { name: 'Envoyer le code' })).toBeVisible()
  })

  test('LANG-002: Sprachwahl im Kopf wechselt auf dieselbe Seite in der anderen Sprache und zurück', async ({ page }) => {
    await page.goto('/betrieb')
    // Links wie auf strainovic-it.ch statt Auswahlliste (deren Liste war im dunklen Design unlesbar)
    const sprachwahl = page.getByRole('navigation', { name: 'Sprache' })
    await expect(sprachwahl.getByRole('link', { name: 'DE' })).toHaveAttribute('aria-current', 'true')
    await sprachwahl.getByRole('link', { name: 'IT' }).click()
    await expect(page).toHaveURL(/\/it\/betrieb$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('veicoli aziendali')
    await expect(page.getByRole('table', { name: 'Listino prezzi' }).getByRole('row').filter({ hasText: '10 veicoli' })).toContainText('CHF 360.00')
    await page.getByRole('navigation', { name: 'Lingua' }).getByRole('link', { name: 'DE' }).click()
    await expect(page).toHaveURL(/\/betrieb$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Firmenfahrzeuge')
  })

  test('LANG-003: deutsche Seiten verlinken weiter ohne Präfix', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'de-CH')
    const links = await interneLinks(page)
    expect(links).toContain('/betrieb')
    expect(links).toContain('/impressum')
    expect(links).toContain('/ratgeber')
    expect(links.filter(l => /^\/(?:fr|it|en)(?:\/|$|#)/.test(l))).toEqual([])
  })

  test('LANG-006: Ratgeber steht nur im Fuss, nicht im Kopf', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('banner').getByRole('link', { name: 'Ratgeber' })).toHaveCount(0)
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Ratgeber' })).toBeVisible()
  })

  test('LANG-007: Hell-Dunkel-Schalter im Kopf wechselt das Design und merkt es sich', async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('theme-set')) {
        localStorage.setItem('theme', 'light')
        sessionStorage.setItem('theme-set', '1')
      }
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/fr')
    const schalter = page.getByRole('banner').getByRole('switch', { name: 'Thème sombre' })
    await expect(schalter).toHaveAttribute('aria-checked', 'false')
    await expect(page.locator('html')).not.toHaveClass(/dark-mode/)
    await schalter.click()
    await expect(page.locator('html')).toHaveClass(/dark-mode/)
    await expect(schalter).toHaveAttribute('aria-checked', 'true')
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark-mode/)
    await expect(page.getByRole('banner').getByRole('switch', { name: 'Thème sombre' })).toHaveAttribute('aria-checked', 'true')
  })

  for (const sprache of PRAEFIXE) {
    test(`LANG-004-${sprache}: jede Seite hat Inhalt, verlinkt intern in ihrer Sprache und passt auf 390px`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      for (const seite of SEITEN) {
        const pfad = seite === '/' ? `/${sprache}` : `/${sprache}${seite}`
        await page.goto(pfad)
        await expect(page.locator('html'), pfad).toHaveAttribute('lang', sprache === 'en' ? 'en' : `${sprache}-CH`)
        await expect(page.getByRole('heading', { level: 1 }).first(), pfad).toBeVisible()
        // Rechtstexte verweisen auf die massgebende deutsche Fassung; der Google-Login ist kein Seitenlink
        const fremd = (await interneLinks(page)).filter(l => !l.startsWith(`/${sprache}`) && !l.startsWith('/instant-api/')
          && !['/agb', '/datenschutz', '/impressum'].includes(l))
        expect(fremd, pfad).toEqual([])
        const ueberbreite = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(ueberbreite, pfad).toBeLessThanOrEqual(1)
      }
    })
  }

  test('LANG-005: Kampagnen-Adresse mit Präfix leitet auf die Seite in derselben Sprache', async ({ page }) => {
    await page.goto('/en/ratgeber-test')
    await expect(page).toHaveURL(/\/en\/privathalter$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('service book')
  })
})

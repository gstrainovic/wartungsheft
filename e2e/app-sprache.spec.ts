import { clearInstantDB, expect, test } from './fixtures/test-fixtures'

// Sprache der App hinter der Anmeldung (src/lib/app-sprache.ts): kommt von der Login-Seite, lässt sich in den
// Einstellungen wählen und bleibt am Benutzer (Entität settings, Feld sprache). Im lokalen Modus ist der Nutzer
// immer angemeldet; der Test besucht die Login-Seite und öffnet danach die Übersicht.

test.describe('App-Sprache', () => {
  test.beforeEach(async ({ page }) => {
    await clearInstantDB(page)
  })

  // Die Wahl liegt am gemeinsamen Testnutzer: zurück auf Deutsch, damit folgende Tests deutsch laufen
  test.afterEach(async ({ page }) => {
    await clearInstantDB(page)
  })

  test('AS-001: die App übernimmt die Sprache der Login-Seite', async ({ page }) => {
    await page.goto('/fr/login')
    // Die Login-Seite lädt verzögert; erst wenn sie die Wahl gemerkt hat, weiter zur App
    await expect.poll(() => page.evaluate(() => localStorage.getItem('sprache'))).toBe('fr')
    await page.goto('/dashboard')
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CH')
    await page.getByRole('button', { name: 'Menu' }).click()
    await expect(page.getByRole('link', { name: 'Aperçu' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Réglages' })).toBeVisible()
  })

  test('AS-002: Sprache in den Einstellungen wählen, sie bleibt nach dem Neuladen', async ({ page }) => {
    await page.goto('/settings')
    await page.getByTestId('sprache-wahl').getByText('Italiano').click()
    await page.getByRole('button', { name: 'Menu' }).click()
    await expect(page.getByRole('link', { name: 'Impostazioni' })).toBeVisible()

    // Browser-Wahl löschen: die Sprache kommt jetzt vom Benutzer
    await page.evaluate(() => localStorage.removeItem('sprache'))
    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Menu' }).click()
    await expect(page.getByRole('link', { name: 'Panoramica' })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'it-CH')
  })
})

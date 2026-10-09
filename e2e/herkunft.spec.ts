import type { Page } from '@playwright/test'
import { clearInstantDB, expect, test, waitForInstantDB } from './fixtures/test-fixtures'

// Herkunftsfrage bei der Anmeldung (src/lib/herkunft.ts): freiwillig, nur auf unbekannten Geräten, gespeichert am
// Konto (Entität settings, Felder herkunft und herkunftText). Im lokalen Modus spielt `auth:localSignedOut` den
// abgemeldeten Zustand; Anmelden mit beliebigem Code.

async function startSignedOut(page: Page, knownEmail?: string) {
  await page.addInitScript((email) => {
    if (sessionStorage.getItem('e2e:seeded'))
      return
    sessionStorage.setItem('e2e:seeded', '1')
    localStorage.setItem('auth:localSignedOut', '1')
    localStorage.removeItem('herkunft')
    if (email)
      localStorage.setItem('auth:knownEmail', email)
    else
      localStorage.removeItem('auth:knownEmail')
  }, knownEmail)
}

async function anmelden(page: Page) {
  await page.getByPlaceholder('E-Mail-Adresse').fill('neu@example.ch')
  await page.getByRole('button', { name: 'Code senden' }).click()
  await page.getByPlaceholder('6-stelliger Code').fill('123456')
  await page.getByRole('button', { name: 'Anmelden' }).click()
  await page.waitForURL(/\/dashboard/)
}

async function gespeicherteHerkunft(page: Page): Promise<{ herkunft?: string, herkunftText?: string } | null> {
  await waitForInstantDB(page)
  return page.evaluate(async () => {
    const { db } = (window as any).__instantdb
    const result = await db.queryOnce({ settings: {} })
    const s = (result.data.settings || [])[0]
    return s ? { herkunft: s.herkunft, herkunftText: s.herkunftText } : null
  })
}

test.describe('Herkunftsfrage', () => {
  test.beforeEach(async ({ page }) => {
    await clearInstantDB(page)
  })

  test.afterEach(async ({ page }) => {
    await clearInstantDB(page)
  })

  test('HK-001: neues Konto beantwortet die Frage, die Antwort liegt am Konto', async ({ page, simulateOffline }) => {
    test.skip(simulateOffline, 'Speichern am Konto braucht den Server')
    await startSignedOut(page)
    await page.goto('/login')
    await page.getByTestId('herkunft-wahl').click()
    await page.getByRole('option', { name: 'Empfehlung' }).click()
    await anmelden(page)

    await expect.poll(() => gespeicherteHerkunft(page)).toEqual({ herkunft: 'empfehlung', herkunftText: undefined })
    // Die Wahl verlässt den Browser-Speicher, sobald sie am Konto liegt
    expect(await page.evaluate(() => localStorage.getItem('herkunft'))).toBeNull()
  })

  test('HK-002: «Anderes» mit Freitext', async ({ page, simulateOffline }) => {
    test.skip(simulateOffline, 'Speichern am Konto braucht den Server')
    await startSignedOut(page)
    await page.goto('/login')
    await page.getByTestId('herkunft-wahl').click()
    await page.getByRole('option', { name: 'Anderes' }).click()
    await page.getByTestId('herkunft-text').fill('Garage Meier')
    await anmelden(page)

    await expect.poll(() => gespeicherteHerkunft(page)).toEqual({ herkunft: 'anderes', herkunftText: 'Garage Meier' })
  })

  test('HK-003: freiwillig, Anmelden geht ohne Antwort und speichert nichts', async ({ page, simulateOffline }) => {
    test.skip(simulateOffline, 'Speichern am Konto braucht den Server')
    await startSignedOut(page)
    await page.goto('/login')
    await expect(page.getByText('(freiwillig)')).toBeVisible()
    await anmelden(page)
    expect((await gespeicherteHerkunft(page))?.herkunft).toBeUndefined()
  })

  test('HK-004: bekanntes Gerät sieht die Frage nicht', async ({ page }) => {
    await startSignedOut(page, 'kunde@example.ch')
    await page.goto('/login')
    await expect(page.getByText('Willkommen zurück.')).toBeVisible()
    await expect(page.getByTestId('herkunft-wahl')).toHaveCount(0)
  })
})

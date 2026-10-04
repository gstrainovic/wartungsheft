/**
 * Clips für den Werbefilm «Privathalter» (Drehbuch: video-scripts/privat-video-script.md).
 * Aufnahme: `npm run video -- e2e/video/privat.video.ts`, in einer anderen Sprache mit `VIDEO_SPRACHE=fr` davor.
 * Jede Szene ist ein eigener Clip, damit der Schnitt sie einzeln kürzen und umstellen kann.
 */
import einstellungen from '../../src/texte/app/einstellungen'
import fahrzeugseite from '../../src/texte/app/fahrzeugseite'
import uebersicht from '../../src/texte/app/uebersicht'
import { clearInstantDB, expect, mockInvoiceScan, test, waitForInstantDB } from '../fixtures/test-fixtures'
import { aufnahmeStarten, beat, clipSpeichern, daysAgo, inSprache, musterRechnungFoto, musterRechnungJpeg, pdfZeigen, seed, showPointer, slowClick } from './szenen'

const GOLF = { make: 'VW', model: 'Golf 7', year: 2016, mileage: 118_400, licensePlate: 'SG 248 901' }

/**
 * Erfundene Daten in der Sprache des Films: Werkstatt, Adresse und Arbeiten. Was der Nutzer selbst schreibt, zeigt
 * die App unverändert, darum stehen sie hier je Sprache. Werkstätten bleiben erkennbar erfundene Musternamen.
 */
const DATEN = inSprache({
  de: { werkstatt: 'Muster-Garage AG', pneu: 'Muster-Pneu GmbH', adresse: 'Musterstrasse 12, 9999 Musterhausen', oel: 'Motoröl und Ölfilter', oelKurz: 'Motoröl und Filter', bremsen: 'Bremsbeläge vorne', reifen: 'Winterreifen montiert', service: 'Grosser Service', zuendung: 'Zündkerzen' },
  fr: { werkstatt: 'Garage Modèle SA', pneu: 'Pneus Modèle Sàrl', adresse: 'Rue de l\'Exemple 12, 9999 Exempleville', oel: 'Huile moteur et filtre à huile', oelKurz: 'Huile moteur et filtre', bremsen: 'Plaquettes de frein avant', reifen: 'Pneus d\'hiver montés', service: 'Grand service', zuendung: 'Bougies d\'allumage' },
  it: { werkstatt: 'Garage Modello SA', pneu: 'Pneumatici Modello Sagl', adresse: 'Via Esempio 12, 9999 Esempiano', oel: 'Olio motore e filtro dell\'olio', oelKurz: 'Olio motore e filtro', bremsen: 'Pastiglie dei freni anteriori', reifen: 'Pneumatici invernali montati', service: 'Grande servizio', zuendung: 'Candele d\'accensione' },
  en: { werkstatt: 'Sample Garage Ltd', pneu: 'Sample Tyres Ltd', adresse: 'Sample Street 12, 9999 Sampletown', oel: 'Engine oil and oil filter', oelKurz: 'Engine oil and filter', bremsen: 'Front brake pads', reifen: 'Winter tyres fitted', service: 'Major service', zuendung: 'Spark plugs' },
})
const T = {
  fahrzeug: inSprache(fahrzeugseite),
  uebersicht: inSprache(uebersicht),
  einstellungen: inSprache(einstellungen),
}

test.describe('Werbeclips Privathalter', () => {
  test.beforeEach(async ({ page }) => {
    await clearInstantDB(page)
  })

  test.afterEach(async ({ page }, testInfo) => {
    await clipSpeichern(page, testInfo)
  })

  test('Szene 2: Rechnung fotografieren, Felder füllen sich', async ({ page, browser }, testInfo) => {
    await seed(page, { vehicles: [GOLF] })
    // Bild und Scan-Ergebnis zeigen dasselbe: erfundene Muster-Garage, derselbe Wagen, dieselben Beträge
    const foto = await musterRechnungFoto(browser, testInfo, {
      werkstatt: DATEN.werkstatt,
      adresse: DATEN.adresse,
      datum: daysAgo(3),
      fahrzeug: 'VW Golf 7',
      kontrollschild: GOLF.licensePlate,
      kilometer: 118_400,
      positionen: [{ text: DATEN.oel, betrag: 189 }, { text: DATEN.bremsen, betrag: 297.5 }],
    })
    await mockInvoiceScan(page, {
      photos: [{
        workshopName: DATEN.werkstatt,
        date: daysAgo(3),
        totalAmount: 486.5,
        currency: 'CHF',
        mileageAtService: 118_400,
        items: [
          { description: DATEN.oel, category: 'oelwechsel', amount: 189 },
          { description: DATEN.bremsen, category: 'bremsen', amount: 297.5 },
        ],
      }],
    })
    await page.goto('/vehicles')
    await showPointer(page)
    await aufnahmeStarten(page, testInfo)
    await beat(page)

    await slowClick(page, page.locator('.vehicle-card').first())
    await page.waitForURL(/\/vehicles\/.+/)
    await beat(page)

    await slowClick(page, page.getByRole('tab', { name: T.fahrzeug.tabs.rechnungen }))
    await slowClick(page, page.getByRole('button', { name: T.fahrzeug.rechnungen.hinzufuegen }))
    await beat(page)

    // Foto der Rechnung: der Scan füllt Werkstatt, Datum, Betrag, Kilometerstand und die Positionen.
    // InputNumber verknüpft sein Label über input-id, darum hier die IDs statt getByLabel.
    await page.setInputFiles('input[type="file"]', foto)
    await expect(page.locator('#invoice-workshop')).toHaveValue(DATEN.werkstatt, { timeout: 20_000 })
    await beat(page, 2)

    await page.locator('#invoice-amount').scrollIntoViewIfNeeded()
    await beat(page, 2)
    await page.locator('.scan-items').scrollIntoViewIfNeeded()
    await beat(page, 3)
  })

  test('Szene 3: Fälligkeit auf dem Dashboard und erledigt eintragen', async ({ page }, testInfo) => {
    await seed(page, {
      vehicles: [{ ...GOLF, mileage: 129_600 }],
      maintenances: [
        { vehicleIndex: 0, type: 'oelwechsel', description: DATEN.oelKurz, doneAt: daysAgo(400), mileageAtService: 114_000 },
        { vehicleIndex: 0, type: 'bremsen', description: DATEN.bremsen, doneAt: daysAgo(120), mileageAtService: 126_000 },
      ],
    })
    await page.goto('/dashboard')
    await showPointer(page)
    await aufnahmeStarten(page, testInfo)
    await beat(page, 2)

    // Fälligkeitsliste oben: was ansteht, ohne Suchen
    await page.mouse.move(195, 320)
    await beat(page, 2)
    await page.mouse.wheel(0, 260)
    await beat(page, 2)

    const done = page.getByRole('button', { name: T.uebersicht.erledigtEintragen }).first()
    if (await done.count()) {
      await slowClick(page, done)
      await beat(page, 2)
    }
  })

  test('Szene 4: Kosten und PDF-Dossier für den Verkauf', async ({ page, browser }, testInfo) => {
    // Jede Rechnung mit ihrem Foto, wie nach dem Scan: das Serviceheft-PDF zählt und zeigt die Belege
    const RECHNUNGEN = [
      { werkstatt: DATEN.werkstatt, tage: 30, km: 118_400, positionen: [{ text: DATEN.oel, category: 'oelwechsel', betrag: 189 }, { text: DATEN.bremsen, category: 'bremsen', betrag: 297.5 }] },
      { werkstatt: DATEN.pneu, tage: 210, km: 112_800, positionen: [{ text: DATEN.reifen, category: 'reifen', betrag: 612 }] },
      { werkstatt: DATEN.werkstatt, tage: 400, km: 104_500, positionen: [{ text: DATEN.service, category: 'inspektion', betrag: 890 }, { text: DATEN.zuendung, category: 'elektrik', betrag: 350.8 }] },
    ]
    const invoices = []
    for (const [i, r] of RECHNUNGEN.entries()) {
      const imageData = await musterRechnungJpeg(browser, testInfo, { werkstatt: r.werkstatt, adresse: DATEN.adresse, datum: daysAgo(r.tage), fahrzeug: 'VW Golf 7', kontrollschild: GOLF.licensePlate, kilometer: r.km, positionen: r.positionen }, i)
      invoices.push({
        vehicleIndex: 0,
        workshopName: r.werkstatt,
        date: daysAgo(r.tage),
        totalAmount: Math.round(r.positionen.reduce((s, p) => s + p.betrag, 0) * 100) / 100,
        mileageAtService: r.km,
        items: r.positionen.map(p => ({ description: p.text, category: p.category, amount: p.betrag })),
        imageData,
      })
    }
    await seed(page, {
      vehicles: [GOLF],
      // Wartungen zu den Rechnungen: sonst bliebe die Historie im Serviceheft-PDF leer
      maintenances: [
        { vehicleIndex: 0, type: 'oelwechsel', description: DATEN.oel, doneAt: daysAgo(30), mileageAtService: 118_400 },
        { vehicleIndex: 0, type: 'bremsen', description: DATEN.bremsen, doneAt: daysAgo(30), mileageAtService: 118_400 },
        { vehicleIndex: 0, type: 'reifen', description: DATEN.reifen, doneAt: daysAgo(210), mileageAtService: 112_800 },
        { vehicleIndex: 0, type: 'inspektion', description: DATEN.service, doneAt: daysAgo(400), mileageAtService: 104_500 },
        { vehicleIndex: 0, type: 'elektrik', description: DATEN.zuendung, doneAt: daysAgo(400), mileageAtService: 104_500 },
      ],
      invoices,
    })
    await page.goto('/vehicles')
    await showPointer(page)
    await aufnahmeStarten(page, testInfo)
    await slowClick(page, page.locator('.vehicle-card').first())
    await page.waitForURL(/\/vehicles\/.+/)

    await slowClick(page, page.getByRole('tab', { name: T.fahrzeug.tabs.kosten }))
    await beat(page, 1.5)

    // «Serviceheft für den Verkauf»: die Übergabemappe für den Käufer (Auszug, Wartungshistorie, Belege), wie sie der
    // Sprecher verspricht; danach steht die erste Seite des echten PDFs im Bild. Die Montage rechnet vom Clip-Ende.
    const knopf = page.getByRole('button', { name: T.fahrzeug.kosten.serviceheft })
    // In die Bildmitte, sonst liegt der Knopf am Handy unter dem Untertitel-Kasten
    await knopf.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    await beat(page, 0.8)
    const download = page.waitForEvent('download')
    await slowClick(page, knopf, 0.8)
    await pdfZeigen(page, await download, testInfo)
    await beat(page, 5)
  })

  test('Szene 5: Preis und Testzeit in den Einstellungen', async ({ page }, testInfo) => {
    await seed(page, { vehicles: [GOLF] })
    await page.goto('/settings')
    await waitForInstantDB(page)
    await showPointer(page)
    await aufnahmeStarten(page, testInfo)
    await beat(page)
    const card = page.locator('.settings-card', { hasText: T.einstellungen.abo.titel })
    await card.scrollIntoViewIfNeeded()
    await beat(page, 3)
  })
})

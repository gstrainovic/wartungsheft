/**
 * Clips für den Werbefilm «Betrieb» (Drehbuch: video-scripts/betrieb-video-script.md).
 * Aufnahme: `npm run video -- e2e/video/betrieb.video.ts`, in einer anderen Sprache mit `VIDEO_SPRACHE=fr` davor.
 */
import bestellung from '../../src/texte/app/bestellung'
import einstellungen from '../../src/texte/app/einstellungen'
import fahrzeugseite from '../../src/texte/app/fahrzeugseite'
import uebersicht from '../../src/texte/app/uebersicht'
import { clearInstantDB, expect, mockInvoiceScan, test } from '../fixtures/test-fixtures'
import { aufnahmeStarten, beat, clipSpeichern, daysAgo, inSprache, musterRechnungFoto, seed, showPointer, slowClick } from './szenen'

const FLEET = [
  { make: 'Fiat', model: 'Ducato', year: 2019, mileage: 184_300, licensePlate: 'SG 41 220' },
  { make: 'VW', model: 'Caddy Cargo', year: 2021, mileage: 96_800, licensePlate: 'SG 41 221' },
  { make: 'Renault', model: 'Master', year: 2017, mileage: 241_500, licensePlate: 'SG 41 222' },
  { make: 'Ford', model: 'Transit Custom', year: 2022, mileage: 61_200, licensePlate: 'SG 41 223' },
]

/** Erfundene Werkstätten und Arbeiten in der Sprache des Films; die App zeigt Nutzertexte unverändert */
const DATEN = inSprache({
  de: { nutzfahrzeuge: 'Muster-Nutzfahrzeuge AG', garage: 'Muster-Garage AG', pneu: 'Muster-Pneu GmbH', adresse: 'Musterweg 3, 9999 Musterhausen', oel: 'Motoröl und Filter', scheiben: 'Bremsscheiben hinten', planService: 'Service nach Plan', service180: 'Service 180 000 km', belaege: 'Bremsbeläge hinten', oelservice: 'Ölservice', reifen: 'Vier Reifen', ersterService: 'Erster Service' },
  fr: { nutzfahrzeuge: 'Utilitaires Modèle SA', garage: 'Garage Modèle SA', pneu: 'Pneus Modèle Sàrl', adresse: 'Chemin de l\'Exemple 3, 9999 Exempleville', oel: 'Huile moteur et filtre', scheiben: 'Disques de frein arrière', planService: 'Service selon le plan', service180: 'Service 180 000 km', belaege: 'Plaquettes de frein arrière', oelservice: 'Vidange', reifen: 'Quatre pneus', ersterService: 'Premier service' },
  it: { nutzfahrzeuge: 'Veicoli Commerciali Modello SA', garage: 'Garage Modello SA', pneu: 'Pneumatici Modello Sagl', adresse: 'Via Esempio 3, 9999 Esempiano', oel: 'Olio motore e filtro', scheiben: 'Dischi dei freni posteriori', planService: 'Servizio secondo piano', service180: 'Servizio 180 000 km', belaege: 'Pastiglie dei freni posteriori', oelservice: 'Cambio dell\'olio', reifen: 'Quattro pneumatici', ersterService: 'Primo servizio' },
  en: { nutzfahrzeuge: 'Sample Commercial Vehicles Ltd', garage: 'Sample Garage Ltd', pneu: 'Sample Tyres Ltd', adresse: 'Sample Lane 3, 9999 Sampletown', oel: 'Engine oil and filter', scheiben: 'Rear brake discs', planService: 'Scheduled service', service180: 'Service at 180,000 km', belaege: 'Rear brake pads', oelservice: 'Oil service', reifen: 'Four tyres', ersterService: 'First service' },
})
const T = {
  fahrzeug: inSprache(fahrzeugseite),
  uebersicht: inSprache(uebersicht),
  einstellungen: inSprache(einstellungen),
  bestellung: inSprache(bestellung),
}

// Dieselben Wartungen in Szene 2 und 4: sonst meldet das Dashboard «nichts fällig» und widerspricht dem Film
const WARTUNGEN = [
  { vehicleIndex: 0, type: 'oelwechsel', description: DATEN.oel, doneAt: daysAgo(430), mileageAtService: 170_000 },
  { vehicleIndex: 1, type: 'oelwechsel', description: DATEN.oel, doneAt: daysAgo(90), mileageAtService: 92_000 },
  { vehicleIndex: 2, type: 'bremsen', description: DATEN.scheiben, doneAt: daysAgo(500), mileageAtService: 220_000 },
  { vehicleIndex: 3, type: 'inspektion', description: DATEN.planService, doneAt: daysAgo(60), mileageAtService: 58_000 },
]

test.describe('Werbeclips Betrieb', () => {
  test.beforeEach(async ({ page }) => {
    await clearInstantDB(page)
  })

  test.afterEach(async ({ page }, testInfo) => {
    await clipSpeichern(page, testInfo)
  })

  test('Szene 2: Fuhrpark auf einen Blick, was ist fällig', async ({ page }, testInfo) => {
    await seed(page, { vehicles: FLEET, maintenances: WARTUNGEN })
    await page.goto('/dashboard')
    await showPointer(page)
    await aufnahmeStarten(page, testInfo)
    await beat(page, 2)
    await page.mouse.wheel(0, 240)
    await beat(page, 3)
    await page.mouse.wheel(0, 320)
    await beat(page, 2)
  })

  test('Szene 3: Rechnung vom Fahrer, ein Foto genügt', async ({ page, browser }, testInfo) => {
    await seed(page, { vehicles: FLEET })
    // Bild und Scan-Ergebnis zeigen dasselbe (erfundene Werkstatt, Fiat Ducato SG 41 220)
    const foto = await musterRechnungFoto(browser, testInfo, {
      werkstatt: DATEN.nutzfahrzeuge,
      adresse: DATEN.adresse,
      datum: daysAgo(1),
      fahrzeug: 'Fiat Ducato',
      kontrollschild: FLEET[0]!.licensePlate,
      kilometer: 184_300,
      positionen: [{ text: DATEN.service180, betrag: 740 }, { text: DATEN.belaege, betrag: 547.4 }],
    })
    await mockInvoiceScan(page, {
      photos: [{
        workshopName: DATEN.nutzfahrzeuge,
        date: daysAgo(1),
        totalAmount: 1287.4,
        currency: 'CHF',
        mileageAtService: 184_300,
        items: [
          { description: DATEN.service180, category: 'inspektion', amount: 740 },
          { description: DATEN.belaege, category: 'bremsen', amount: 547.4 },
        ],
      }],
    })
    await page.goto('/vehicles')
    await showPointer(page)
    await aufnahmeStarten(page, testInfo)
    await slowClick(page, page.locator('.vehicle-card').first())
    await page.waitForURL(/\/vehicles\/.+/)
    await slowClick(page, page.getByRole('tab', { name: T.fahrzeug.tabs.rechnungen }))
    await slowClick(page, page.getByRole('button', { name: T.fahrzeug.rechnungen.hinzufuegen }))

    await page.setInputFiles('input[type="file"]', foto)
    await expect(page.locator('#invoice-workshop')).toHaveValue(DATEN.nutzfahrzeuge, { timeout: 20_000 })
    await beat(page, 2)
    await page.locator('.scan-items').scrollIntoViewIfNeeded()
    await beat(page, 3)
  })

  test('Szene 4: Kosten pro Fahrzeug und Jahr, Export für die Buchhaltung', async ({ page }, testInfo) => {
    await seed(page, {
      vehicles: FLEET,
      maintenances: WARTUNGEN,
      invoices: [
        { vehicleIndex: 0, workshopName: DATEN.nutzfahrzeuge, date: daysAgo(20), totalAmount: 1287.4, mileageAtService: 184_300, items: [{ description: DATEN.service180, category: 'inspektion', amount: 740 }, { description: DATEN.belaege, category: 'bremsen', amount: 547.4 }] },
        { vehicleIndex: 1, workshopName: DATEN.garage, date: daysAgo(70), totalAmount: 468.9, mileageAtService: 94_100, items: [{ description: DATEN.oelservice, category: 'oelwechsel', amount: 468.9 }] },
        { vehicleIndex: 2, workshopName: DATEN.pneu, date: daysAgo(140), totalAmount: 1980, mileageAtService: 238_000, items: [{ description: DATEN.reifen, category: 'reifen', amount: 1980 }] },
        { vehicleIndex: 3, workshopName: DATEN.nutzfahrzeuge, date: daysAgo(310), totalAmount: 655.2, mileageAtService: 52_400, items: [{ description: DATEN.ersterService, category: 'inspektion', amount: 655.2 }] },
      ],
    })
    await page.goto('/dashboard')
    await showPointer(page)
    await aufnahmeStarten(page, testInfo)
    await beat(page, 2)
    // Kostentabelle sanft in die Bildmitte rollen; Mausrad-Schritte schossen im Desktop-Layout an ihr vorbei
    await page.getByText(T.uebersicht.kostenTitel).first().evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    await beat(page, 3)

    const exportKnopf = page.getByRole('button', { name: new RegExp(T.uebersicht.export) }).first()
    if (await exportKnopf.count()) {
      await exportKnopf.hover()
      await beat(page, 2)
    }
    await beat(page, 2)
  })

  test('Szene 5: Bestellung mit Rechnung auf die Firma', async ({ page }, testInfo) => {
    await seed(page, { vehicles: FLEET })
    await page.goto('/settings')
    await showPointer(page)
    await aufnahmeStarten(page, testInfo)
    const card = page.locator('.settings-card', { hasText: T.einstellungen.abo.titel })
    await card.scrollIntoViewIfNeeded()
    await beat(page, 2)

    const order = card.getByRole('button', { name: T.einstellungen.abo.bestellen })
    if (await order.count()) {
      await slowClick(page, order)
      const dialog = page.getByTestId('business-order-dialog')
      await slowClick(page, dialog.getByRole('button', { name: T.bestellung.betrieb }))
      await beat(page, 2)
      // Fahrzeugzahl ist vorbelegt, der Preis steht sofort da
      await dialog.getByTestId('order-price').scrollIntoViewIfNeeded()
      await beat(page, 3)
    }
  })
})

/**
 * Clips für das Tutorial «So startest du mit Wartungsheft» (Drehbuch: video-scripts/tutorial-video-script.md).
 * Handy und Desktop: `npx playwright test --project=video --project=video-desktop e2e/video/tutorial.video.ts`,
 * Montage mit `node scripts/werbefilm.ts tutorial` (vertont) bzw. `tutorial-stumm`.
 *
 * Neben den Bildern schreibt jede Szene `marken.json` (Sekunden ab Aufnahmebeginn, z. B. «Felder gefüllt»): die
 * Montage legt die Sätze des Sprechertexts auf diese Stellen, auch wenn der Scan je Lauf verschieden lang braucht.
 * Scans gemockt (`mockInvoiceScan`), keine KI-Aufrufe; alle Daten erfunden («Muster-…»).
 * Andere Sprache: `VIDEO_SPRACHE=fr` davor; Knopfnamen kommen aus src/texte/app/, Musterdaten aus `DATEN`.
 */
import type { Browser, Page, TestInfo } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
import process from 'node:process'
import { mitSprache } from '../../src/lib/sprache'
import { buildReminders } from '../../src/services/reminders'
import allgemein from '../../src/texte/app/allgemein'
import einrichtung from '../../src/texte/app/einrichtung'
import fahrzeuge from '../../src/texte/app/fahrzeuge'
import fahrzeugformular from '../../src/texte/app/fahrzeugformular'
import fahrzeugseite from '../../src/texte/app/fahrzeugseite'
import kategorien from '../../src/texte/app/kategorien'
import rechnungsformular from '../../src/texte/app/rechnungsformular'
import uebersicht from '../../src/texte/app/uebersicht'
import wartungsplan from '../../src/texte/app/wartungsplan'
import { clearInstantDB, expect, mockInvoiceScan, test, waitForInstantDB } from '../fixtures/test-fixtures'
import { aufnahmeStarten, beat, CLIP_DIR, clipName, clipSpeichern, daysAgo, inSprache, musterRechnungFoto, seed, showPointer, slowClick, SPRACHE } from './szenen'

const GOLF = { make: 'VW', model: 'Golf 7', year: 2016, licensePlate: 'SG 248 901' }
const KM_HAND = 118_000
const KM_RECHNUNG = 118_400

/** Erfundene Daten in der Sprache des Films (wie privat.video.ts), dazu Beschriftung von Ausweis und Mail */
const DATEN = inSprache({
  de: {
    werkstatt: 'Muster-Garage AG',
    adresse: 'Musterstrasse 12, 9999 Musterhausen',
    oel: 'Motoröl und Ölfilter',
    bremsen: 'Bremsbeläge vorne',
    mfk: 'MFK',
    halter: 'Max Muster',
    mail: 'max.muster@example.ch',
    mailKopf: (an: string) => `Von: Wartungsheft · An: ${an}`,
    ausweis: { land: 'SCHWEIZERISCHE EIDGENOSSENSCHAFT', titel: 'Fahrzeugausweis', muster: 'MUSTER', schild: 'Kontrollschild', halter: 'Halter/in', adresse: 'Adresse', typ: 'Marke und Typ', erste: '1. Inverkehrsetzung' },
  },
  fr: {
    werkstatt: 'Garage Modèle SA',
    adresse: 'Rue de l\'Exemple 12, 9999 Exempleville',
    oel: 'Huile moteur et filtre à huile',
    bremsen: 'Plaquettes de frein avant',
    mfk: 'Expertise',
    halter: 'Jean Modèle',
    mail: 'jean.modele@example.ch',
    mailKopf: (an: string) => `De : Wartungsheft · À : ${an}`,
    ausweis: { land: 'CONFÉDÉRATION SUISSE', titel: 'Permis de circulation', muster: 'SPÉCIMEN', schild: 'Plaque de contrôle', halter: 'Détenteur/trice', adresse: 'Adresse', typ: 'Marque et type', erste: '1re mise en circulation' },
  },
  it: {
    werkstatt: 'Garage Modello SA',
    adresse: 'Via Esempio 12, 9999 Esempiano',
    oel: 'Olio motore e filtro dell\'olio',
    bremsen: 'Pastiglie dei freni anteriori',
    mfk: 'Collaudo',
    halter: 'Mario Modello',
    mail: 'mario.modello@example.ch',
    mailKopf: (an: string) => `Da: Wartungsheft · A: ${an}`,
    ausweis: { land: 'CONFEDERAZIONE SVIZZERA', titel: 'Licenza di circolazione', muster: 'ESEMPIO', schild: 'Targa', halter: 'Detentore/trice', adresse: 'Indirizzo', typ: 'Marca e tipo', erste: '1a messa in circolazione' },
  },
  en: {
    werkstatt: 'Sample Garage Ltd',
    adresse: 'Sample Street 12, 9999 Sampletown',
    oel: 'Engine oil and oil filter',
    bremsen: 'Front brake pads',
    mfk: 'Inspection',
    halter: 'John Sample',
    mail: 'john.sample@example.ch',
    mailKopf: (an: string) => `From: Wartungsheft · To: ${an}`,
    ausweis: { land: 'SWISS CONFEDERATION', titel: 'Vehicle registration document', muster: 'SAMPLE', schild: 'Number plate', halter: 'Keeper', adresse: 'Address', typ: 'Make and type', erste: 'First registration' },
  },
})
const WERKSTATT = DATEN.werkstatt
const ADRESSE = DATEN.adresse
const OEL = DATEN.oel
const BREMSEN = DATEN.bremsen
/** Bedientexte der App in der Sprache der Aufnahme */
const T = {
  allgemein: inSprache(allgemein),
  einrichtung: inSprache(einrichtung),
  fahrzeuge: inSprache(fahrzeuge),
  formular: inSprache(fahrzeugformular),
  fahrzeug: inSprache(fahrzeugseite),
  kategorien: inSprache(kategorien),
  rechnung: inSprache(rechnungsformular),
  uebersicht: inSprache(uebersicht),
  plan: inSprache(wartungsplan),
}
/** Rechnung aus Szene 2, drei Tage alt: dieselben Daten in Szene 3 und 4 */
const RECHNUNG_TAGE = 3

/** Die Rechnung aus Szene 2 als Bestand der späteren Szenen */
function rechnung() {
  return [{
    vehicleIndex: 0,
    workshopName: WERKSTATT,
    date: daysAgo(RECHNUNG_TAGE),
    totalAmount: 486.5,
    mileageAtService: KM_RECHNUNG,
    items: [{ description: OEL, category: 'oelwechsel', amount: 189 }, { description: BREMSEN, category: 'bremsen', amount: 297.5 }],
  }]
}

/** Die Wartungen, die beim Speichern der Rechnung entstehen */
function ausRechnung() {
  return [
    { vehicleIndex: 0, type: 'oelwechsel', description: OEL, doneAt: daysAgo(RECHNUNG_TAGE), mileageAtService: KM_RECHNUNG },
    { vehicleIndex: 0, type: 'bremsen', description: BREMSEN, doneAt: daysAgo(RECHNUNG_TAGE), mileageAtService: KM_RECHNUNG },
  ]
}

// ---------- Marken für den Schnitt ----------

let beginn = 0
let marken: Record<string, number> = {}

async function starten(page: Page, testInfo: TestInfo): Promise<void> {
  await showPointer(page)
  await aufnahmeStarten(page, testInfo)
  beginn = Date.now() / 1000
  marken = {}
}

function marke(name: string): void {
  marken[name] = Math.round((Date.now() / 1000 - beginn) * 1000) / 1000
}

/** Element ruhig in die Bildmitte rollen: unten liegen am Handy die Untertitel */
async function mitte(page: Page, ziel: ReturnType<Page['locator']>, pause = 1): Promise<void> {
  await ziel.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  await beat(page, pause)
}

/** Antwort der gemockten KI verzögern, damit «wird gelesen» so lange steht wie in echt */
async function scanVerzoegern(page: Page, ms: number): Promise<void> {
  await page.route('**/localhost:8787/v1/chat/completions', async (route) => {
    await new Promise(r => setTimeout(r, ms))
    await route.fallback()
  })
}

// ---------- Musterbilder ----------

/** Fahrzeugausweis als Muster (quer wie das Original), nur mit den Angaben, die der gemockte Scan liefert */
async function musterAusweisFoto(browser: Browser, testInfo: TestInfo): Promise<string> {
  const A = DATEN.ausweis
  const feld = (nr: string, titel: string, wert: string) =>
    `<div class="f"><span class="nr">${nr}</span><span class="t">${titel}</span><b>${wert}</b></div>`
  const html = `<div id="a" style="font-family: Arial; width: 860px; height: 560px; padding: 28px 34px; box-sizing: border-box;
      background: linear-gradient(135deg, #e9efe6, #d7e2d3); color: #1d2a1d; border-radius: 14px; position: relative;">
    <style>
      .f { display: grid; grid-template-columns: 34px 1fr; margin: 10px 0; }
      .nr { grid-row: span 2; font-size: 13px; color: #5d6d5d; }
      .t { font-size: 13px; color: #5d6d5d; }
      b { font-size: 24px; letter-spacing: .5px; }
    </style>
    <div style="position:absolute; right:30px; top:24px; border:2px solid #8a9a8a; color:#8a9a8a; padding:2px 10px; font-size:14px;">${A.muster}</div>
    <div style="font-size:15px; letter-spacing:2px; color:#4f5f4f;">${A.land}</div>
    <div style="font-size:30px; font-weight:bold; margin:6px 0 18px;">${A.titel}</div>
    ${feld('15', A.schild, GOLF.licensePlate)}
    ${feld('01', A.halter, DATEN.halter)}
    ${feld('', A.adresse, ADRESSE)}
    ${feld('21', A.typ, `${GOLF.make} ${GOLF.model}`)}
    ${feld('36', A.erste, `03.${String(GOLF.year).slice(2)}`)}
  </div>`
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } })
  await page.setContent(html)
  const pfad = testInfo.outputPath('muster-ausweis.png')
  await page.locator('#a').screenshot({ path: pfad })
  await page.close()
  return pfad
}

/** Erinnerungsmail über der App eingeblendet, Text aus der echten Erinnerung (`buildReminders`) */
async function mailZeigen(page: Page, mail: { betreff: string, kopf: string, text: string }): Promise<void> {
  await page.evaluate((m) => {
    const style = document.createElement('style')
    style.textContent = `
      .video-mail { position: fixed; inset: 0; z-index: 2147483646; display: grid; place-items: center; padding: 16px;
        background: rgb(3 7 18 / 72%); animation: video-mail-ein 450ms ease-out both; }
      .video-mail .karte { width: 100%; max-height: 80vh; overflow: hidden; background: #fff; color: #16202b; border-radius: 12px;
        box-shadow: 0 24px 60px rgb(0 0 0 / 55%); font: 14px/1.45 system-ui, sans-serif;
        animation: video-mail-zoom 700ms cubic-bezier(.2,.8,.3,1) both; }
      .video-mail .kopf { padding: 12px 14px; border-bottom: 1px solid #e3e8ec; background: #f5f7f9; }
      .video-mail .kopf div { color: #5b6773; font-size: 12px; }
      .video-mail .kopf strong { display: block; font-size: 15px; margin-top: 4px; }
      .video-mail pre { margin: 0; padding: 12px 14px; white-space: pre-wrap; font: inherit; }
      .video-pointer { display: none; }
      @keyframes video-mail-ein { from { opacity: 0; } }
      @keyframes video-mail-zoom { from { transform: translateY(6vh) scale(.8); opacity: 0; } }`
    const huelle = document.createElement('div')
    huelle.className = 'video-mail'
    const karte = document.createElement('div')
    karte.className = 'karte'
    const kopf = document.createElement('div')
    kopf.className = 'kopf'
    const von = document.createElement('div')
    von.textContent = m.kopf
    const betreff = document.createElement('strong')
    betreff.textContent = m.betreff
    kopf.append(von, betreff)
    const text = document.createElement('pre')
    text.textContent = m.text
    karte.append(kopf, text)
    huelle.append(karte)
    huelle.dataset.video = 'mail'
    document.head.append(style)
    document.body.append(huelle)
  }, mail)
}

async function mailWeg(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelector('[data-video="mail"]')?.remove()
  })
}

// ---------- Szenen ----------

test.describe('Tutorial', () => {
  // Ruhiges Tempo: eine Szene dauert länger als die üblichen 30 s eines Tests
  test.describe.configure({ timeout: 120_000 })

  test.beforeEach(async ({ page }) => {
    await clearInstantDB(page)
  })

  test.afterEach(async ({ page }, testInfo) => {
    await clipSpeichern(page, testInfo)
    if (testInfo.status === 'passed')
      await writeFile(`${CLIP_DIR}/${clipName(testInfo)}/marken.json`, `${JSON.stringify(marken, null, 2)}\n`)
  })

  test('Tutorial 1: Fahrzeug anlegen', async ({ page, browser }, testInfo) => {
    const ausweis = await musterAusweisFoto(browser, testInfo)
    // Der Ausweis liefert Marke, Modell, Baujahr (Pflicht im Scan-Schema) und Kontrollschild; die Fahrgestellnummer
    // bleibt offen und erscheint in Szene 3 als «Fehlt noch»
    await mockInvoiceScan(page, { vehicleDoc: { documentType: 'fahrzeugausweis', make: GOLF.make, model: GOLF.model, year: GOLF.year, plate: GOLF.licensePlate } })
    await scanVerzoegern(page, 2200)
    await page.addInitScript(s => localStorage.setItem('sprache', s), SPRACHE)
    await page.goto('/dashboard')
    await waitForInstantDB(page)
    const hinzufuegen = page.getByRole('button', { name: T.uebersicht.fahrzeugHinzufuegen }).first()
    await expect(hinzufuegen).toBeVisible()
    await starten(page, testInfo)
    marke('uebersicht')
    await beat(page, 2.5)
    await mitte(page, hinzufuegen, 0.6)
    await slowClick(page, hinzufuegen, 0.8)

    const dialog = page.getByRole('dialog', { name: T.fahrzeuge.neu })
    const scanKnopf = dialog.getByText(T.formular.ausweisFotografieren)
    await expect(scanKnopf).toBeVisible()
    await beat(page, 0.5)
    marke('formular')
    await beat(page, 1.2)
    await scanKnopf.hover()
    await beat(page, 0.8)
    const auswahl = page.waitForEvent('filechooser')
    await scanKnopf.click()
    await (await auswahl).setFiles(ausweis)
    await expect(dialog.getByText(T.formular.scan.ausgefuellt)).toBeVisible({ timeout: 30_000 })
    await expect(dialog.getByLabel(T.formular.marke)).toHaveValue(GOLF.make)
    marke('gefuellt')
    await beat(page, 1)
    await mitte(page, dialog.getByLabel(T.formular.marke), 2)
    await mitte(page, dialog.getByLabel(T.formular.kontrollschild), 1.5)

    // «Du kannst die Felder auch selbst ausfüllen»: Kilometerstand von Hand
    const km = dialog.getByLabel(T.formular.kilometerstand)
    await mitte(page, km, 0.6)
    marke('selbst')
    await slowClick(page, km, 0.4)
    await km.pressSequentially(String(KM_HAND), { delay: 140 })
    await beat(page, 1)
    const speichern = dialog.getByRole('button', { name: T.formular.speichern })
    await mitte(page, speichern, 0.6)
    await slowClick(page, speichern, 0.8)
    await page.waitForURL(/\/vehicles\/.+/)
    await expect(page.getByRole('heading', { name: `${GOLF.make} ${GOLF.model}` })).toBeVisible()
    marke('fahrzeugseite')
    await beat(page, 3)
  })

  test('Tutorial 2: Erste Werkstattrechnung', async ({ page, browser }, testInfo) => {
    await seed(page, { vehicles: [{ ...GOLF, mileage: KM_HAND }] })
    const foto = await musterRechnungFoto(browser, testInfo, {
      werkstatt: WERKSTATT,
      adresse: ADRESSE,
      datum: daysAgo(RECHNUNG_TAGE),
      fahrzeug: `${GOLF.make} ${GOLF.model}`,
      kontrollschild: GOLF.licensePlate,
      kilometer: KM_RECHNUNG,
      positionen: [{ text: OEL, betrag: 189 }, { text: BREMSEN, betrag: 297.5 }],
    })
    await mockInvoiceScan(page, {
      photos: [{
        workshopName: WERKSTATT,
        date: daysAgo(RECHNUNG_TAGE),
        totalAmount: 486.5,
        currency: 'CHF',
        mileageAtService: KM_RECHNUNG,
        items: [
          { description: OEL, category: 'oelwechsel', amount: 189 },
          { description: BREMSEN, category: 'bremsen', amount: 297.5 },
        ],
      }],
    })
    await scanVerzoegern(page, 3000)
    await page.goto('/vehicles')
    await page.locator('.vehicle-card').first().click()
    await page.waitForURL(/\/vehicles\/.+/)
    const setup = page.getByTestId('setup-checklist')
    await expect(setup).toBeVisible()
    await starten(page, testInfo)
    marke('checkliste')
    await beat(page, 1)
    const knopf = setup.locator('li.next').getByRole('button', { name: T.einrichtung.rechnungen.action })
    await mitte(page, knopf, 1.5)
    await slowClick(page, knopf, 0.8)

    const beleg = page.getByText(T.rechnung.fotografieren)
    await expect(beleg).toBeVisible()
    await beat(page, 1)
    await beleg.hover()
    await beat(page, 0.8)
    const auswahl = page.waitForEvent('filechooser')
    await beleg.click()
    await (await auswahl).setFiles(foto)
    await expect(page.locator('#invoice-workshop')).toHaveValue(WERKSTATT, { timeout: 30_000 })
    marke('gelesen')
    await beat(page, 2)
    // Schwenk über Werkstatt, Datum, Kilometerstand, Betrag und die erkannten Positionen
    await mitte(page, page.locator('#invoice-mileage'), 2)
    await mitte(page, page.locator('#invoice-amount'), 1.5)
    await mitte(page, page.getByText(T.rechnung.erkanntePositionen), 2.5)
    // Bei einem einzelnen Foto heisst der Knopf «Speichern» («1 Rechnung speichern» nur bei mehreren Belegen)
    const speichern = page.getByRole('dialog').getByRole('button', { name: T.allgemein.speichern, exact: true })
    await mitte(page, speichern, 0.8)
    marke('speichern')
    await slowClick(page, speichern, 0.8)
    await expect(speichern).toBeHidden()
    await beat(page, 1)

    // Wartungsplan: aus der Rechnung wurde der Ölwechsel, mit «Zuletzt» und nächstem Termin
    const plan = page.getByRole('tabpanel', { name: T.fahrzeug.tabs.plan })
    const oel = plan.locator('.plan-item', { hasText: T.kategorien.plan.oelwechsel })
    await expect(oel).toContainText(T.fahrzeug.plan.zuletzt.replace(/\s*:$/, ''))
    marke('plan')
    await mitte(page, oel, 3)
    await mitte(page, setup, 3)
  })

  test('Tutorial 3: Checkliste Einrichten', async ({ page }, testInfo) => {
    await seed(page, { vehicles: [{ ...GOLF, mileage: KM_RECHNUNG }], invoices: rechnung(), maintenances: ausRechnung() })
    await page.goto('/vehicles')
    await page.locator('.vehicle-card').first().click()
    await page.waitForURL(/\/vehicles\/.+/)
    const setup = page.getByTestId('setup-checklist')
    await expect(setup).toBeVisible()
    await setup.evaluate(el => el.scrollIntoView({ block: 'center' }))
    await starten(page, testInfo)
    // Reihenfolge wie der Sprechertext: was fehlt, schon eingetragene Wartungen, offene Schritte, freiwillig
    marke('checkliste')
    await beat(page, 2.5)
    // Die Rechnung hat schon Wartungen angelegt: «Letzte Wartungen» ist abgehakt, ohne Knopf
    await setup.locator('[data-step="wartungen"]').hover()
    await beat(page, 4.5)
    await setup.locator('[data-step="ausweis"]').hover()
    await beat(page, 2)
    await setup.getByRole('button', { name: T.einrichtung.serviceheft.action }).hover()
    await beat(page, 2)
    // Finger auf «Ausblenden», ohne zu tippen
    await setup.getByRole('button', { name: T.einrichtung.ausblenden }).hover()
    await beat(page, 4)
  })

  test('Tutorial 4: Faelligkeit und Erinnerung', async ({ page }, testInfo) => {
    const km = 121_300
    const wartungen = [
      ...ausRechnung(),
      // MFK vor knapp zwei Jahren: in drei Wochen fällig, «Bald fällig»
      { vehicleIndex: 0, type: 'tuev', description: DATEN.mfk, doneAt: daysAgo(710), mileageAtService: 96_200 },
    ]
    await seed(page, { vehicles: [{ ...GOLF, mileage: km }], invoices: rechnung(), maintenances: wartungen })
    // Die echte Erinnerung zu genau diesen Daten, an eine Musteradresse
    const [mail] = buildReminders({
      users: [{ id: 'u', email: DATEN.mail }],
      vehicles: [{ id: 'v', creatorId: 'u', ...GOLF, mileage: km }],
      maintenances: wartungen.map(w => ({ vehicleId: 'v', type: w.type, doneAt: w.doneAt, mileageAtService: w.mileageAtService, status: 'done', description: w.description })),
      settings: [{ creatorId: 'u', sprache: SPRACHE }],
      now: new Date(),
    })
    expect(mail, 'Erinnerung zu den Musterdaten').toBeTruthy()
    await page.goto('/dashboard')
    await waitForInstantDB(page)
    const faellig = page.getByRole('region', { name: T.uebersicht.faelligeArbeiten })
    await expect(faellig.locator('.fleet-due-item')).toHaveCount(1)
    await expect(faellig).toContainText(T.plan.status.due)
    await starten(page, testInfo)
    marke('uebersicht')
    await mitte(page, faellig, 2.5)
    await mailZeigen(page, { betreff: mail!.subject, kopf: DATEN.mailKopf(mail!.email), text: mail!.text })
    marke('mail')
    await beat(page, 4.5)
    await mailWeg(page)
    await beat(page, 1)

    const erledigt = faellig.getByRole('button', { name: T.uebersicht.erledigtEintragen })
    await mitte(page, erledigt, 0.6)
    marke('erledigt')
    await slowClick(page, erledigt, 0.8)
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('#maintenance-date')).not.toHaveValue('')
    await beat(page, 1)
    await mitte(page, dialog.locator('#maintenance-mileage'), 2)
    const speichern = dialog.getByRole('button', { name: T.allgemein.speichern })
    await mitte(page, speichern, 0.6)
    await slowClick(page, speichern, 0.8)
    await expect(dialog).toBeHidden()
    marke('ok')
    // Die Arbeit steht beim Fahrzeug auf «OK»
    const mfk = page.locator('.vehicle-section').locator('.maintenance-item', { hasText: DATEN.mfk }).first()
    await mitte(page, mfk, 3.5)
  })

  test('Tutorial 5: Hilfe und Rueckmeldung', async ({ page }, testInfo) => {
    // Stand nach Szene 4: Rechnung erfasst, MFK heute erledigt
    await seed(page, {
      vehicles: [{ ...GOLF, mileage: 121_300 }],
      invoices: rechnung(),
      maintenances: [...ausRechnung(), { vehicleIndex: 0, type: 'tuev', description: DATEN.mfk, doneAt: daysAgo(0), mileageAtService: 121_300 }],
    })
    await page.goto('/dashboard')
    await waitForInstantDB(page)
    await starten(page, testInfo)
    marke('uebersicht')
    await beat(page, 1)
    await slowClick(page, page.getByRole('button', { name: T.allgemein.navigation.menu }), 0.8)
    marke('menu')
    const hilfe = page.getByRole('link', { name: T.allgemein.navigation.hilfe })
    await expect(hilfe).toBeVisible()
    await hilfe.hover()
    await beat(page, 1.8)
    const feedback = page.getByTestId('open-feedback')
    await feedback.hover()
    await beat(page, 1.5)
    await feedback.click()
    const dialog = page.getByTestId('feedback-dialog')
    await expect(dialog).toBeVisible()
    marke('dialog')
    await beat(page, 1)
    await dialog.getByTestId('feedback-record').hover()
    await beat(page, 4)
  })

  test('Tutorial 6: Schlussbild', async ({ page }, testInfo) => {
    const url = new URL(`file://${process.cwd()}/video-scripts/szenen/titel.html`)
    url.searchParams.set('t', 'Wartungsheft')
    url.searchParams.set('s', `wartungsheft.ch${mitSprache(SPRACHE, '/hilfe')}`)
    await page.goto(url.href)
    await expect(page.locator('h1')).toHaveText('Wartungsheft')
    await aufnahmeStarten(page, testInfo, 0)
    beginn = Date.now() / 1000
    marken = {}
    await page.waitForTimeout(6000)
  })
})

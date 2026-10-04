/**
 * Gemeinsame Bausteine der Werbeclips (`npm run video`). Keine Tests: die Szenen spielen die App im Handyformat
 * vor, Playwright zeichnet sie auf. Alle Daten sind erfunden, damit nie Kundendaten im Video landen.
 * Die Drehbücher stehen in `video-scripts/privat-video-script.md` und `video-scripts/betrieb-video-script.md`.
 */
import type { Browser, CDPSession, Page, TestInfo } from '@playwright/test'
import { Buffer } from 'node:buffer'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { waitForInstantDB } from '../fixtures/test-fixtures'

/** Ablage der Aufnahmen: je Szene ein Ordner mit den Einzelbildern und einer concat-Liste für ffmpeg */
export const CLIP_DIR = `${process.cwd()}/video-out/roh`

interface Aufnahme {
  cdp: CDPSession
  ordner: string
  bilder: { datei: string, t: number }[]
  schreiben: Promise<void>[]
}

const aufnahmen = new WeakMap<Page, Aufnahme>()

function clipName(testInfo: TestInfo): string {
  const slug = testInfo.title
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  // Der Desktop-Lauf legt eigene Ordner an, sonst überschreiben sich die beiden Formate
  return testInfo.project.name === 'video-desktop' ? `${slug}-desktop` : slug
}

/**
 * Startet die Aufnahme über den Screencast von Chrome statt über Playwrights recordVideo: dessen VP8 mit rund
 * 1 Mbit/s macht UI-Text unscharf. Die Bilder kommen in Gerätepixeln (Desktop 3840×2160, Handy 1170×2079) als
 * JPEG; Chrome schickt nur bei Änderungen ein Bild, die Standzeiten stehen in der concat-Liste. Erst aufrufen,
 * wenn die Seite steht: Ladeschirme gehören nicht in den Film.
 */
export async function aufnahmeStarten(page: Page, testInfo: TestInfo, warten = 800): Promise<void> {
  // Daten aus InstantDB und Schriften brauchen nach dem Laden einen Moment; gezeichnete Szenen starten sofort
  await page.waitForTimeout(warten)
  const ordner = `${CLIP_DIR}/${clipName(testInfo)}`
  await rm(ordner, { recursive: true, force: true })
  await mkdir(ordner, { recursive: true })
  const cdp = await page.context().newCDPSession(page)
  const a: Aufnahme = { cdp, ordner, bilder: [], schreiben: [] }
  cdp.on('Page.screencastFrame', (f) => {
    const datei = `${ordner}/${String(a.bilder.length).padStart(5, '0')}.jpg`
    a.bilder.push({ datei, t: f.metadata.timestamp ?? Date.now() / 1000 })
    a.schreiben.push(writeFile(datei, Buffer.from(f.data, 'base64')))
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {})
  })
  const { width, height } = page.viewportSize()!
  const dpr = await page.evaluate(() => window.devicePixelRatio)
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: Math.round(width * dpr), maxHeight: Math.round(height * dpr) })
  aufnahmen.set(page, a)
  // Ein stehendes Bild löst keinen Screencast-Rahmen aus: einmal neu zeichnen lassen, damit das erste Bild sofort kommt
  await page.evaluate(() => {
    document.body.style.setProperty('outline', '1px solid transparent')
    requestAnimationFrame(() => document.body.style.removeProperty('outline'))
  })
}

/**
 * Beendet die Aufnahme und schreibt `video-out/roh/<szene>/liste.txt` (ffmpeg concat mit Standzeiten). Gehört in
 * ein `test.afterEach`. Die Montage (`scripts/werbefilm.ts`) liest die Bilder direkt, ohne Zwischenkodierung.
 */
export async function clipSpeichern(page: Page, _testInfo: TestInfo): Promise<void> {
  const a = aufnahmen.get(page)
  if (!a)
    return
  aufnahmen.delete(page)
  const ende = Date.now() / 1000
  await a.cdp.send('Page.stopScreencast').catch(() => {})
  await Promise.all(a.schreiben)
  if (!a.bilder.length)
    throw new Error(`keine Bilder in ${a.ordner}`)
  // Der Zeitstempel von Chrome ist Sekunden seit Epoche wie Date.now(); das letzte Bild steht bis zum Ende
  const zeilen = a.bilder.map((b, i) => {
    const naechstes = a.bilder[i + 1]
    const dauer = (naechstes ? naechstes.t : Math.max(ende, b.t + 0.5)) - b.t
    return `file '${b.datei}'\nduration ${Math.max(dauer, 0.001).toFixed(4)}`
  })
  await writeFile(`${a.ordner}/liste.txt`, `${zeilen.join('\n')}\nfile '${a.bilder.at(-1)!.datei}'\n`)
}

/**
 * Ruhig genug, dass ein Zuschauer folgen kann; im Schnitt lässt sich immer noch kürzen. Zuschauer meldeten,
 * das Tempo sei zu hoch — deshalb lieber zu langsam aufnehmen als zu schnell.
 */
export const BEAT = 1200

export async function beat(page: Page, factor = 1): Promise<void> {
  await page.waitForTimeout(BEAT * factor)
}

/** Zeigt den Mauszeiger als Punkt, sonst wirkt die Aufnahme wie ein Standbild mit Sprüngen */
export async function showPointer(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      .video-pointer {
        position: fixed; z-index: 2147483647; width: 28px; height: 28px; margin: -14px 0 0 -14px;
        border-radius: 50%; background: rgba(20, 120, 255, 0.35); border: 2px solid rgba(20, 120, 255, 0.9);
        pointer-events: none; transition: transform 120ms ease-out; }
    `,
  })
  await page.evaluate(() => {
    const dot = document.createElement('div')
    dot.className = 'video-pointer'
    document.body.append(dot)
    document.addEventListener('mousemove', (e) => {
      dot.style.left = `${e.clientX}px`
      dot.style.top = `${e.clientY}px`
    })
  })
}

/** Klick mit sichtbarer Mausbewegung: erst hinfahren, kurz warten, dann klicken */
export async function slowClick(page: Page, selector: string | { click: () => Promise<void>, hover: () => Promise<void> }, pause = 0.6): Promise<void> {
  const target = typeof selector === 'string' ? page.locator(selector) : selector
  await target.hover()
  await beat(page, pause)
  await target.click()
  await beat(page, pause)
}

export interface VideoVehicle {
  make: string
  model: string
  year: number
  mileage: number
  licensePlate: string
  soldAt?: string
}

export interface VideoInvoice {
  vehicleIndex: number
  workshopName: string
  date: string
  totalAmount: number
  mileageAtService: number
  items: { description: string, category: string, amount: number }[]
}

export interface VideoMaintenance {
  vehicleIndex: number
  type: string
  description: string
  doneAt: string
  mileageAtService: number
}

/** Erfundener Bestand, damit die App im Video nicht leer aussieht */
export async function seed(page: Page, data: {
  vehicles: VideoVehicle[]
  invoices?: VideoInvoice[]
  maintenances?: VideoMaintenance[]
}): Promise<void> {
  await page.goto('/')
  await waitForInstantDB(page)
  await page.evaluate(async (payload) => {
    const { db, tx, id: genId } = (window as any).__instantdb
    const now = new Date().toISOString()
    const vehicleIds = payload.vehicles.map(() => genId())
    const steps: any[] = payload.vehicles.map((v: any, i: number) =>
      tx.vehicles[vehicleIds[i]].update({ ...v, createdAt: now, updatedAt: now, source: 'formular' }),
    )
    for (const inv of payload.invoices ?? []) {
      steps.push(tx.invoices[genId()].update({
        vehicleId: vehicleIds[inv.vehicleIndex],
        workshopName: inv.workshopName,
        date: inv.date,
        totalAmount: inv.totalAmount,
        currency: 'CHF',
        mileageAtService: inv.mileageAtService,
        items: inv.items,
        createdAt: now,
        updatedAt: now,
        source: 'formular',
      }))
    }
    for (const m of payload.maintenances ?? []) {
      steps.push(tx.maintenances[genId()].update({
        vehicleId: vehicleIds[m.vehicleIndex],
        type: m.type,
        description: m.description,
        doneAt: m.doneAt,
        mileageAtService: m.mileageAtService,
        status: 'done',
        createdAt: now,
        updatedAt: now,
        source: 'formular',
      }))
    }
    await db.transact(steps)
  }, data)
}

/** Tage vor heute als ISO-Tag: die Fälligkeiten im Video sollen immer gleich aussehen, egal wann gedreht wird */
export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
}

export interface MusterRechnung {
  werkstatt: string
  adresse: string
  datum: string
  fahrzeug: string
  kontrollschild: string
  kilometer: number
  positionen: { text: string, betrag: number }[]
}

function chf(betrag: number): string {
  return betrag.toFixed(2).replace(/\B(?=(\d{3})+\.)/g, '\'')
}

/**
 * Rendert eine Werkstattrechnung mit genau den Angaben, die der gemockte Scan in die Felder füllt: Bild und
 * Ergebnis müssen im Film übereinstimmen. Werkstatt und Adresse sind erfundene Musternamen, keine echte Firma.
 * Eigener Browser-Kontext ohne Aufnahme, das Bild landet im Ausgabeordner des Clips.
 */
export async function musterRechnungFoto(browser: Browser, testInfo: TestInfo, r: MusterRechnung): Promise<string> {
  const [y, m, d] = r.datum.split('-')
  const total = r.positionen.reduce((sum, p) => sum + p.betrag, 0)
  const zeilen = r.positionen.map(p => `<tr><td>${p.text}</td><td class="r">${chf(p.betrag)}</td></tr>`).join('')
  // Hochformat wie ein A4-Blatt: ein breiteres Bild dreht die App als Handyfoto um 90° (autoRotateForDocument)
  const html = `<div style="font-family: Arial; padding: 40px; width: 640px; min-height: 905px; background: white; color: #111;">
    <div style="float:right; border:2px solid #999; color:#999; padding:2px 8px; font-size:13px;">MUSTER</div>
    <h1 style="margin:0 0 6px">${r.werkstatt}</h1>
    <p style="margin:0">${r.adresse}</p>
    <hr>
    <p><strong>Rechnung Nr.:</strong> 26-0417 &nbsp; <strong>Datum:</strong> ${d}.${m}.${y}</p>
    <p><strong>Fahrzeug:</strong> ${r.fahrzeug} · Kontrollschild ${r.kontrollschild}</p>
    <p><strong>Kilometerstand:</strong> ${r.kilometer.toLocaleString('de-CH').replace(/’/g, '\'')} km</p>
    <hr>
    <style>td,th{padding:6px;border-bottom:1px solid #eee} .r{text-align:right}</style>
    <table style="width:100%; border-collapse:collapse">
      <tr><th style="text-align:left">Position</th><th class="r">CHF</th></tr>
      ${zeilen}
      <tr style="font-weight:bold; border-top:2px solid #000"><td>Total CHF inkl. MWST</td><td class="r">${chf(total)}</td></tr>
    </table>
  </div>`
  const page = await browser.newPage({ viewport: { width: 720, height: 900 } })
  await page.setContent(html)
  const pfad = testInfo.outputPath('muster-rechnung.png')
  await page.locator('div').first().screenshot({ path: pfad })
  await page.close()
  return pfad
}

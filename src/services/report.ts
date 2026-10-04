import type { Sprache } from '../lib/sprache'
/**
 * Auswertungen für Kostenübersicht, CSV-Export (Treuhänder, Excel) und PDF-Dossier (Verkauf).
 * Reine Funktionen ohne DOM, damit sie im Unit-Test laufen. Mit `homeCurrency` und `rates`
 * (siehe fx.ts) werden fremde Währungen zum Kurs am Rechnungsdatum umgerechnet; ohne Kurs bleibt
 * eine Rechnung in ihrer Währung und wird als «nicht umgerechnet» gezählt.
 */
import type { Invoice } from '../stores/invoices'
import type { Maintenance } from '../stores/maintenances'
import type { RateMap } from './fx'
import { appSprache, waehle } from '../lib/app-sprache'
import { formatDate, formatNumber, normalizeCurrency } from '../lib/locale'
import auswertungTexte from '../texte/app/auswertung'
import kategorienTexte from '../texte/app/kategorien'
import { rateKey } from './fx'

/** Differenz zwischen Total (brutto) und Positionen (meist netto), damit die Kategorien zum Total addieren */
export const UNASSIGNED_CATEGORY = 'nicht_zugeordnet'

/** Kategorie lesbar in der App-Sprache (Tabelle in src/texte/app/kategorien.ts); Unbekanntes bleibt stehen */
export function categoryLabel(category: string, sprache: Sprache = appSprache.value): string {
  return (kategorienTexte[sprache].kategorien as Record<string, string>)[category] ?? category
}

/**
 * Gespeicherte Bezeichnung (Wartungsplan, Beschreibung einer Wartung) in der App-Sprache: Standard-Bezeichnungen
 * und Kategorien stehen deutsch in den Daten und werden übersetzt, eigene Texte bleiben, wie sie sind.
 */
export function planLabel(label: string | undefined | null, sprache: Sprache = appSprache.value): string {
  if (!label)
    return ''
  const de = kategorienTexte.de
  const ziel = kategorienTexte[sprache]
  for (const gruppe of ['plan', 'kategorien'] as const) {
    const eintrag = Object.entries(de[gruppe]).find(([, text]) => text === label)
    if (eintrag)
      return (ziel[gruppe] as Record<string, string>)[eintrag[0]]!
  }
  return label
}

/** Kilometerstand für Anzeige; 0 oder fehlend bedeutet unbekannt und bleibt leer */
export function formatKm(value: number | undefined | null): string {
  return value ? `${formatNumber(value)} km` : ''
}

export interface CurrencyOptions {
  homeCurrency: string
  rates: RateMap
}

export interface YearCosts {
  year: number
  currency: string
  total: number
  byCategory: Record<string, number>
  /** Rechnungen, die aus einer fremden Währung umgerechnet wurden */
  converted: number
  /** Rechnungen in fremder Währung ohne Kurs, stehen in ihrer eigenen Zeile */
  unconverted: number
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function yearOf(date: string): number {
  return Number.parseInt(date.slice(0, 4), 10) || 0
}

interface Priced {
  currency: string
  factor: number
  converted: boolean
  unconverted: boolean
}

/** Entscheidet pro Rechnung, in welcher Währung und mit welchem Faktor sie zählt. */
function price(inv: Invoice, opts?: CurrencyOptions): Priced {
  const currency = normalizeCurrency(inv.currency)
  if (!opts || currency === opts.homeCurrency)
    return { currency, factor: 1, converted: false, unconverted: false }
  // Kurs ungerundet als Faktor; gerundet wird erst der Betrag
  const rate = opts.rates.get(rateKey(currency, opts.homeCurrency, inv.date))
  if (rate === undefined)
    return { currency, factor: 1, converted: false, unconverted: true }
  return { currency: opts.homeCurrency, factor: rate, converted: true, unconverted: false }
}

function itemsOf(inv: Invoice) {
  return inv.items?.length ? inv.items : [{ description: '', category: 'sonstiges', amount: inv.totalAmount ?? 0 }]
}

/** Summen pro Jahr und Währung, aufgeteilt nach Kategorie der Positionen; Rechnungen ohne Positionen zählen als «sonstiges». */
export function costsByYear(invoices: Invoice[], opts?: CurrencyOptions): YearCosts[] {
  const map = new Map<string, YearCosts>()
  for (const inv of invoices) {
    const year = yearOf(inv.date)
    const p = price(inv, opts)
    const key = `${year}|${p.currency}`
    let row = map.get(key)
    if (!row) {
      row = { year, currency: p.currency, total: 0, byCategory: {}, converted: 0, unconverted: 0 }
      map.set(key, row)
    }
    for (const item of itemsOf(inv)) {
      const cat = item.category || 'sonstiges'
      row.byCategory[cat] = round2((row.byCategory[cat] ?? 0) + round2((item.amount ?? 0) * p.factor))
    }
    row.total = round2(row.total + round2((inv.totalAmount ?? 0) * p.factor))
    if (p.converted)
      row.converted++
    if (p.unconverted)
      row.unconverted++
  }
  for (const row of map.values()) {
    const assigned = Object.values(row.byCategory).reduce((sum, v) => sum + v, 0)
    const diff = round2(row.total - assigned)
    if (Math.abs(diff) > 0.005)
      row.byCategory[UNASSIGNED_CATEGORY] = diff
  }
  return [...map.values()].sort((a, b) => b.year - a.year || a.currency.localeCompare(b.currency))
}

export interface VehicleInfo {
  make: string
  model: string
  licensePlate: string
  year?: number
  vin?: string
  mileage?: number
  /** verkauft oder abgegeben: steht im Dossier, die Kosten bleiben in allen Auswertungen */
  soldAt?: string | null
  soldMileage?: number | null
}

export interface FleetRow {
  vehicleId: string
  vehicle: string
  year: number
  currency: string
  total: number
}

/** Kosten pro Fahrzeug und Jahr über den ganzen Fuhrpark; neuestes Jahr zuerst, innerhalb des Jahres alphabetisch. */
export function fleetCostsByVehicleYear(vehicles: (VehicleInfo & { id: string })[], invoices: Invoice[], opts?: CurrencyOptions): FleetRow[] {
  const rows: FleetRow[] = []
  for (const v of vehicles) {
    const label = `${v.make} ${v.model} · ${v.licensePlate}`
    for (const yc of costsByYear(invoices.filter(i => i.vehicleId === v.id), opts))
      rows.push({ vehicleId: v.id, vehicle: label, year: yc.year, currency: yc.currency, total: yc.total })
  }
  return rows.sort((a, b) => b.year - a.year || a.vehicle.localeCompare(b.vehicle) || a.currency.localeCompare(b.currency))
}

function csvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null)
    return ''
  const s = String(value)
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Eine Zeile pro Rechnungsposition, Semikolon-getrennt mit BOM, damit Excel (de-CH) die Datei direkt richtig öffnet.
 * Mit `opts` kommen die Spalten «Betrag <Heimwährung>» und «Kurs» dazu (leer, wenn kein Kurs vorliegt).
 */
export function invoicesToCsv(invoices: Invoice[], vehicle: VehicleInfo, opts?: CurrencyOptions): string {
  return invoicesToCsvRows(invoices.map(inv => ({ inv, vehicle })), opts)
}

export function invoicesToCsvRows(entries: { inv: Invoice, vehicle: VehicleInfo }[], opts?: CurrencyOptions): string {
  const t = waehle(auswertungTexte)
  const c = t.csv
  const header = [c.fahrzeug, c.kontrollschild, c.datum, c.werkstatt, c.kilometerstand, c.kategorie, c.beschreibung, c.betrag, c.waehrung]
  if (opts)
    header.push(`${c.betrag} ${opts.homeCurrency}`, c.kurs)
  const rows: string[][] = []
  const sorted = [...entries].sort((a, b) => a.inv.date.localeCompare(b.inv.date))
  for (const { inv, vehicle } of sorted) {
    const p = price(inv, opts)
    // Positionen sind oft netto, das Total brutto: Differenz als eigene Zeile, damit die Summe den Belegen entspricht
    const items = itemsOf(inv)
    const diff = round2((inv.totalAmount ?? 0) - items.reduce((s, i) => s + (i.amount ?? 0), 0))
    const withDiff = diff > 0.005
      ? [...items, { description: t.differenz, category: UNASSIGNED_CATEGORY, amount: diff }]
      : items
    for (const item of withDiff) {
      const row = [
        `${vehicle.make} ${vehicle.model}`,
        vehicle.licensePlate,
        inv.date,
        inv.workshopName ?? '',
        inv.mileageAtService === undefined || inv.mileageAtService === null ? '' : String(inv.mileageAtService),
        categoryLabel(item.category || 'sonstiges'),
        item.description ?? '',
        (item.amount ?? 0).toFixed(2),
        normalizeCurrency(inv.currency),
      ]
      if (opts) {
        row.push(
          p.unconverted ? '' : round2((item.amount ?? 0) * p.factor).toFixed(2),
          p.unconverted ? '' : String(p.factor),
        )
      }
      rows.push(row)
    }
  }
  const lines = [header, ...rows].map(cols => cols.map(csvCell).join(';'))
  return String.fromCharCode(0xFEFF) + lines.join('\r\n')
}

/** Wartungshistorie für das Dossier, neueste zuerst, Datum als TT.MM.JJJJ. */
export function maintenanceRows(maintenances: Maintenance[]): string[][] {
  return [...maintenances]
    .sort((a, b) => b.doneAt.localeCompare(a.doneAt))
    .map(m => [formatDate(m.doneAt), planLabel(m.description) || categoryLabel(m.type), formatKm(m.mileageAtService)])
}

/**
 * PDF-Berichte: Dossier eines Fahrzeugs (Verkauf, Übergabe) und Fuhrpark-Übersicht (Treuhänder, Jahresabschluss).
 * jsPDF mit Standardschrift (Helvetica, WinAnsi, reicht für Umlaute, französische und italienische Akzente und den
 * Schweizer Apostroph), Tabellen über jspdf-autotable. Texte in der App-Sprache (src/texte/app/dossier.ts).
 * Fremde Währungen werden mit `currency` (Heimwährung, Kurse) umgerechnet, siehe report.ts.
 */
import type { Invoice } from '../stores/invoices'
import type { Maintenance } from '../stores/maintenances'
import type { CurrencyOptions, VehicleInfo } from './report'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { waehle } from '../lib/app-sprache'
import { formatCurrency, formatDate, formatNumber, normalizeCurrency } from '../lib/locale'
import texte from '../texte/app/dossier'
import { categoryLabel, costsByYear, fleetCostsByVehicleYear, formatKm, maintenanceRows } from './report'
import { serviceRecordSummary } from './service-record'
import { isSold } from './vehicle-status'

export interface DossierInput {
  vehicle: VehicleInfo
  invoices: Invoice[]
  maintenances: Maintenance[]
  generatedAt?: Date
  /** Heimwährung und Kurse: fremde Währungen werden in der Kostentabelle umgerechnet */
  currency?: CurrencyOptions
}

export interface FleetReportInput {
  vehicles: (VehicleInfo & { id: string })[]
  invoices: Invoice[]
  maintenances: Maintenance[]
  generatedAt?: Date
  currency?: CurrencyOptions
}

const MARGIN = 15
const HEAD = { fillColor: [40, 40, 40] as [number, number, number] }

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function slug(s: string): string {
  return s.toLowerCase()
    .replace(/[äöü]/g, c => ({ ä: 'ae', ö: 'oe', ü: 'ue' })[c] ?? c)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function dossierFilename(vehicle: VehicleInfo, at: Date = new Date()): string {
  return `wartungsheft-${slug(`${vehicle.make} ${vehicle.model} ${vehicle.licensePlate}`)}-${isoDate(at)}.pdf`
}

export function fleetReportFilename(at: Date = new Date()): string {
  return `wartungsheft-${waehle(texte).datei.alleFahrzeuge}-${isoDate(at)}.pdf`
}

function newDoc(): jsPDF {
  // eslint-disable-next-line new-cap
  return new jsPDF({ unit: 'mm', format: 'a4' })
}

function finalY(doc: jsPDF): number {
  return (doc as any).lastAutoTable.finalY
}

function heading(doc: jsPDF, y: number, text: string): number {
  doc.setFontSize(13)
  doc.text(text, MARGIN, y)
  return y + 3
}

function title(doc: jsPDF, y: number, text: string, subtitle: string): number {
  doc.setFontSize(18)
  doc.text(text, MARGIN, y)
  y += 7
  doc.setFontSize(10)
  doc.setTextColor(90)
  doc.text(subtitle, MARGIN, y)
  doc.setTextColor(0)
  return y + 8
}

/** Verkaufsvermerk im Dossier: Datum und Kilometer, vor der Übergabe «Übergabe am …» */
function soldValue(vehicle: VehicleInfo): string {
  const t = waehle(texte)
  const when = formatDate(vehicle.soldAt)
  if (!isSold({ make: vehicle.make, model: vehicle.model, soldAt: vehicle.soldAt }))
    return t.uebergabeAm(when)
  return vehicle.soldMileage ? t.verkauftBei(when, formatNumber(vehicle.soldMileage)) : when
}

/** Stammdaten, Wartungshistorie, Kosten pro Jahr und Rechnungsliste eines Fahrzeugs ab Position y. */
function renderVehicle(doc: jsPDF, y: number, { vehicle, invoices, maintenances, currency }: DossierInput): number {
  const t = waehle(texte)
  autoTable(doc, {
    startY: y,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
    body: [
      [t.feld.kontrollschild, vehicle.licensePlate],
      [t.feld.baujahr, vehicle.year ? String(vehicle.year) : ''],
      [t.feld.fahrgestellnummer, vehicle.vin ?? ''],
      [t.feld.kilometerstand, formatKm(vehicle.mileage)],
      ...(vehicle.soldAt ? [[t.feld.verkauft, soldValue(vehicle)]] : []),
    ],
  })
  y = finalY(doc) + 8

  y = heading(doc, y, t.wartungshistorie)
  const mRows = maintenanceRows(maintenances)
  autoTable(doc, {
    startY: y,
    head: [[t.datum, t.arbeit, t.feld.kilometerstand]],
    body: mRows.length ? mRows : [['', t.keineEintraege, '']],
    styles: { fontSize: 9 },
    headStyles: HEAD,
  })
  y = finalY(doc) + 8

  y = heading(doc, y, t.kostenProJahr)
  const years = costsByYear(invoices, currency)
  const categories = [...new Set(years.flatMap(r => Object.keys(r.byCategory)))]
  const convertedCount = years.reduce((n, r) => n + r.converted, 0)
  autoTable(doc, {
    startY: y,
    head: [[t.jahr, t.waehrung, ...categories.map(c => categoryLabel(c)), t.total]],
    body: years.length
      ? years.map(r => [String(r.year), r.currency, ...categories.map(c => r.byCategory[c] === undefined ? '' : formatNumber(r.byCategory[c], 2)), formatNumber(r.total, 2)])
      : [['', '', ...categories.map(() => ''), t.keineRechnungen]],
    styles: { fontSize: 9, halign: 'right' },
    columnStyles: { 0: { halign: 'left' }, 1: { halign: 'left' } },
    headStyles: { ...HEAD, halign: 'right' },
  })
  y = finalY(doc) + 4
  if (convertedCount > 0 && currency) {
    doc.setFontSize(8)
    doc.setTextColor(90)
    doc.text(t.umgerechnet(convertedCount, currency.homeCurrency), MARGIN, y)
    doc.setTextColor(0)
  }
  y += 6

  y = heading(doc, y, t.rechnungen)
  const invRows = [...invoices]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(inv => [
      formatDate(inv.date),
      inv.workshopName ?? '',
      formatKm(inv.mileageAtService),
      (inv.items ?? []).map(i => categoryLabel(i.category || 'sonstiges')).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      formatCurrency(inv.totalAmount, normalizeCurrency(inv.currency)),
    ])
  autoTable(doc, {
    startY: y,
    head: [[t.datum, t.werkstatt, t.feld.kilometerstand, t.kategorien, t.betrag]],
    body: invRows.length ? invRows : [['', t.keineRechnungen, '', '', '']],
    styles: { fontSize: 9 },
    columnStyles: { 4: { halign: 'right' } },
    headStyles: HEAD,
  })
  return finalY(doc)
}

function footer(doc: jsPDF): void {
  const t = waehle(texte)
  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(t.fuss(p, pages), MARGIN, doc.internal.pageSize.getHeight() - 8)
    doc.setTextColor(0)
  }
}

export interface ServiceRecordInput extends DossierInput {
  /** Preise und Rechnungsbeträge zeigen; beim Verkauf meist unerwünscht */
  withPrices?: boolean
}

export function serviceRecordFilename(vehicle: VehicleInfo, at: Date = new Date()): string {
  return `${waehle(texte).datei.serviceheft}-${slug(`${vehicle.make} ${vehicle.model} ${vehicle.licensePlate}`)}-${isoDate(at)}.pdf`
}

/**
 * Übergabemappe für den Käufer: Auszug auf der ersten Seite, danach die Wartungshistorie, die Belege als Bilder
 * und am Schluss eine Seite über Wartungsheft. Ohne `withPrices` steht nirgends ein Betrag.
 */
export function buildServiceRecord(input: ServiceRecordInput): jsPDF {
  const { vehicle, invoices, maintenances, generatedAt = new Date(), withPrices = false, currency } = input
  const t = waehle(texte)
  const doc = newDoc()
  const summary = serviceRecordSummary(maintenances, generatedAt)
  let y = title(doc, MARGIN, t.serviceheft(`${vehicle.make} ${vehicle.model}`), t.stand(formatDate(generatedAt)))

  autoTable(doc, {
    startY: y,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    body: [
      [t.feld.kontrollschild, vehicle.licensePlate],
      [t.feld.baujahr, vehicle.year ? String(vehicle.year) : ''],
      [t.feld.fahrgestellnummer, vehicle.vin ?? ''],
      [t.feld.kilometerstand, formatKm(vehicle.mileage)],
      [t.eintraege, summary.count ? t.eintraegeWert(summary.count, formatDate(summary.from), formatDate(summary.to)) : t.keine],
      [t.laufleistung, summary.firstMileage && summary.lastMileage ? t.vonBis(formatKm(summary.firstMileage), formatKm(summary.lastMileage)) : ''],
      [t.historie, summary.gapless ? t.lueckenlos : t.mitLuecken(summary.note)],
      [t.belege, t.belegeWert(invoices.filter(i => i.imageData).length, invoices.length)],
    ],
  })
  y = finalY(doc) + 8

  y = heading(doc, y, t.wartungshistorie)
  const rows = maintenanceRows(maintenances)
  autoTable(doc, {
    startY: y,
    head: [[t.datum, t.arbeit, t.feld.kilometerstand]],
    body: rows.length ? rows : [['—', t.keineEintraege, '']],
    styles: { fontSize: 9 },
    headStyles: HEAD,
  })
  y = finalY(doc) + 8

  if (withPrices) {
    y = heading(doc, y, t.kostenProJahr)
    const years = costsByYear(invoices, currency)
    autoTable(doc, {
      startY: y,
      head: [[t.jahr, t.total]],
      body: years.length ? years.map(r => [String(r.year), formatCurrency(r.total, r.currency)]) : [['—', '']],
      styles: { fontSize: 9 },
      headStyles: HEAD,
    })
  }

  // Belege als Bildseiten, damit der Käufer die Rechnungen sieht und nicht nur die Liste
  for (const invoice of [...invoices].sort((a, b) => a.date.localeCompare(b.date))) {
    if (!invoice.imageData)
      continue
    doc.addPage()
    doc.setFontSize(11)
    const head = [formatDate(invoice.date), invoice.workshopName, withPrices ? formatCurrency(invoice.totalAmount, normalizeCurrency(invoice.currency)) : '']
      .filter(Boolean)
      .join(' · ')
    doc.text(head, MARGIN, MARGIN)
    try {
      const format = invoice.imageData.startsWith('/9j/') ? 'JPEG' : 'WEBP'
      const width = doc.internal.pageSize.getWidth() - 2 * MARGIN
      doc.addImage(invoice.imageData, format, MARGIN, MARGIN + 6, width, 0)
    }
    catch {
      doc.setFontSize(9)
      doc.text(t.belegFehlt, MARGIN, MARGIN + 12)
    }
  }

  // Schlussseite: wer das Heft geführt hat
  doc.addPage()
  let z = title(doc, MARGIN, t.gefuehrt, 'wartungsheft.ch')
  doc.setFontSize(10)
  for (const line of t.vorteile) {
    doc.text(`•  ${line}`, MARGIN, z)
    z += 6
  }

  footer(doc)
  return doc
}

export function buildDossier(input: DossierInput): jsPDF {
  const { vehicle, generatedAt = new Date() } = input
  const doc = newDoc()
  const y = title(doc, MARGIN, `${vehicle.make} ${vehicle.model}`, waehle(texte).dossierStand(formatDate(generatedAt)))
  renderVehicle(doc, y, input)
  footer(doc)
  return doc
}

/** Übersichtsseite mit Kosten pro Fahrzeug und Jahr, danach eine Seite je Fahrzeug wie im Dossier. */
export function buildFleetReport({ vehicles, invoices, maintenances, generatedAt = new Date(), currency }: FleetReportInput): jsPDF {
  const t = waehle(texte)
  const doc = newDoc()
  let y = title(doc, MARGIN, t.fuhrpark, t.fuhrparkUnter(vehicles.length, formatDate(generatedAt)))

  y = heading(doc, y, t.kostenProFahrzeug)
  const rows = fleetCostsByVehicleYear(vehicles, invoices, currency)
  const totals = new Map<string, number>()
  for (const r of rows)
    totals.set(r.currency, Math.round(((totals.get(r.currency) ?? 0) + r.total) * 100) / 100)
  autoTable(doc, {
    startY: y,
    head: [[t.jahr, t.fahrzeug, t.total]],
    body: rows.length
      ? [
          ...rows.map(r => [String(r.year), r.vehicle, formatCurrency(r.total, r.currency)]),
          ['', t.gesamt, [...totals].map(([c, sum]) => formatCurrency(sum, c)).join(' + ')],
        ]
      : [['', t.keineRechnungen, '']],
    styles: { fontSize: 9 },
    columnStyles: { 2: { halign: 'right' } },
    headStyles: HEAD,
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === rows.length && rows.length)
        data.cell.styles.fontStyle = 'bold'
    },
  })
  if (currency) {
    const converted = invoices.filter(i => normalizeCurrency(i.currency) !== currency.homeCurrency).length
    if (converted > 0) {
      y = finalY(doc) + 4
      doc.setFontSize(8)
      doc.setTextColor(90)
      doc.text(t.fuhrparkUmgerechnet(currency.homeCurrency), MARGIN, y)
      doc.setTextColor(0)
    }
  }

  for (const v of vehicles) {
    doc.addPage()
    const yv = title(doc, MARGIN, `${v.make} ${v.model}`, v.licensePlate)
    renderVehicle(doc, yv, {
      vehicle: v,
      invoices: invoices.filter(i => i.vehicleId === v.id),
      maintenances: maintenances.filter(m => m.vehicleId === v.id),
      currency,
    })
  }
  footer(doc)
  return doc
}

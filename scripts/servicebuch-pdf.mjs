#!/usr/bin/env node
/**
 * Baut die Servicebuch-Vorlage als PDF (A4, fünf Seiten: Fahrzeugdaten, drei Seiten Wartungshistorie,
 * übliche Intervalle) in allen vier Sprachen nach public/ – verlinkt aus
 * content/ratgeber/<sprache>/servicebuch-vorlage.md. Schweizer Begriffe: MFK / expertise (MFK) /
 * collaudo (MFK) / MFK inspection. Aufruf: node scripts/servicebuch-pdf.mjs
 */
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright'

const TEXTE = {
  de: {
    titel: 'Servicebuch',
    unter: 'Wartungshistorie für Fahrzeuge in der Schweiz – zum Ausdrucken und Ausfüllen',
    daten: 'Fahrzeugdaten',
    felder: [
      ['Marke und Modell', 'Kontrollschild'],
      ['Fahrgestellnummer (VIN)', 'Erstzulassung'],
    ],
    halter: 'Halter / Halterin (Name, Adresse)',
    hinweis: 'Eine Zeile pro Service, auch für kleine Arbeiten. Zusammen mit den Rechnungen helfen die Kilometerstände, die Wartungshistorie nachzuvollziehen.',
    historie: 'Wartungshistorie',
    spalten: ['Datum', 'Kilometerstand', 'Arbeit / Service', 'Werkstatt', 'Rechnungsnr.', 'Kosten (CHF)', 'Nächster Termin'],
    intervalle: 'Wartungsplan für dieses Fahrzeug',
    intervallSpalten: ['Arbeit', 'Intervall gemäss Hersteller', 'Letzter Eintrag', 'Nächster Termin'],
    intervalleZeilen: [
      ['Öl und Filter', '', '', ''],
      ['Bremsen', '', '', ''],
      ['Reifen', '', '', ''],
      ['Weitere Arbeiten', '', '', ''],
      ['MFK', 'Gemäss Fahrzeugtyp und Aufgebot', '', ''],
    ],
    bemerkungen: 'Bemerkungen',
    fuss: 'wartungsheft.ch – Serviceheft auf dem Handy',
  },
  fr: {
    titel: 'Carnet d’entretien',
    unter: 'Historique d’entretien pour les véhicules en Suisse – à imprimer et remplir',
    daten: 'Données du véhicule',
    felder: [
      ['Marque et modèle', 'Immatriculation'],
      ['Numéro de châssis (VIN)', 'Mise en circulation'],
    ],
    halter: 'Détenteur / détentrice (nom, adresse)',
    hinweis: 'Une ligne par intervention, même petite. Avec les factures, les kilométrages aident à reconstituer l’historique. Conservez les factures à part.',
    historie: 'Historique d’entretien',
    spalten: ['Date', 'Kilométrage', 'Travail / service', 'Garage', 'N° facture', 'Coût (CHF)', 'Prochaine échéance'],
    intervalle: 'Plan d’entretien de ce véhicule',
    intervallSpalten: ['Intervention', 'Intervalle selon le constructeur', 'Dernière intervention', 'Prochaine échéance'],
    intervalleZeilen: [
      ['Huile et filtre', '', '', ''],
      ['Freins', '', '', ''],
      ['Pneus', '', '', ''],
      ['Autres interventions', '', '', ''],
      ['Expertise (MFK)', 'Selon le type de véhicule et la convocation', '', ''],
    ],
    bemerkungen: 'Remarques',
    fuss: 'wartungsheft.ch – le carnet d’entretien sur le téléphone',
  },
  it: {
    titel: 'Libretto di manutenzione',
    unter: 'Storia della manutenzione per veicoli in Svizzera – da stampare e compilare',
    daten: 'Dati del veicolo',
    felder: [
      ['Marca e modello', 'Targa'],
      ['Numero di telaio (VIN)', 'Messa in circolazione'],
    ],
    halter: 'Detentore / detentrice (nome, indirizzo)',
    hinweis: 'Una riga per intervento, anche per i lavori piccoli. Insieme alle fatture, i chilometraggi aiutano a ricostruire la storia. Conserva le fatture a parte.',
    historie: 'Storia della manutenzione',
    spalten: ['Data', 'Chilometraggio', 'Lavoro / servizio', 'Officina', 'N. fattura', 'Costo (CHF)', 'Prossima scadenza'],
    intervalle: 'Piano di manutenzione di questo veicolo',
    intervallSpalten: ['Intervento', 'Intervallo secondo il costruttore', 'Ultimo intervento', 'Prossima scadenza'],
    intervalleZeilen: [
      ['Olio e filtro', '', '', ''],
      ['Freni', '', '', ''],
      ['Pneumatici', '', '', ''],
      ['Altri interventi', '', '', ''],
      ['MFK', 'Secondo il tipo di veicolo e la convocazione', '', ''],
    ],
    bemerkungen: 'Note',
    fuss: 'wartungsheft.ch – il libretto di manutenzione sul telefono',
  },
  en: {
    titel: 'Service book',
    unter: 'Maintenance history for vehicles in Switzerland – print and fill in',
    daten: 'Vehicle details',
    felder: [
      ['Make and model', 'Number plate'],
      ['Chassis number (VIN)', 'First registration'],
    ],
    halter: 'Owner (name, address)',
    hinweis: 'One line per service, even for small jobs. Together with invoices, the mileage entries help reconstruct the maintenance history. Keep invoices separately.',
    historie: 'Service history',
    spalten: ['Date', 'Mileage', 'Work / service', 'Garage', 'Invoice no.', 'Cost (CHF)', 'Next due'],
    intervalle: 'Maintenance plan for this vehicle',
    intervallSpalten: ['Work', 'Interval per manufacturer', 'Last completed', 'Next due'],
    intervalleZeilen: [
      ['Oil and filter', '', '', ''],
      ['Brakes', '', '', ''],
      ['Tyres', '', '', ''],
      ['Other work', '', '', ''],
      ['MFK', 'According to vehicle type and notice', '', ''],
    ],
    bemerkungen: 'Notes',
    fuss: 'wartungsheft.ch – your service book on your phone',
  },
}

const ZEILEN_HISTORIE = 13

function zeilen(n, zellen) {
  return Array.from({ length: n }, () => `<tr>${zellen.map(() => '<td></td>').join('')}</tr>`).join('')
}

function seite(t) {
  const breite = [16, 22, 44, 26, 20, 18, 24].map(x => `${x}mm`)
  const hist = nr => `
    <section class="page">
      <h2>${t.historie} (${nr}/3)</h2>
      <table class="hist">
        <colgroup>${breite.map(b => `<col style="width:${b}">`).join('')}</colgroup>
        <thead><tr>${t.spalten.map(s => `<th>${s}</th>`).join('')}</tr></thead>
        <tbody>${zeilen(ZEILEN_HISTORIE, t.spalten)}</tbody>
      </table>
      <p class="note">${t.hinweis}</p>
    </section>`
  return `<!doctype html>
<html lang="">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4 portrait; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 10pt/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif; color: #111; }
  section.page { page-break-after: always; padding: 2mm 0; }
  section.page:last-child { page-break-after: auto; }
  h1 { font-size: 18pt; margin: 0 0 1mm; }
  h2 { font-size: 12pt; margin: 0 0 3mm; }
  .sub { color: #444; margin: 0 0 6mm; }
  .mark { font-weight: 700; letter-spacing: 0.02em; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 0.4mm solid #111; padding: 1.4mm; text-align: left; vertical-align: top; }
  th { font-size: 8.5pt; background: #f0f0f0; }
  table.ident td { height: 12mm; }
  table.ident td.label { width: 38%; background: #f7f7f7; font-weight: 600; }
  table.hist td { height: 11.5mm; }
  table.hist th { font-size: 8pt; padding: 1.2mm; }
  table.int th { font-size: 7pt; }
  table.int td { height: 10mm; }
  p.note { font-size: 8.5pt; color: #333; margin-top: 4mm; }
  .linien { margin-top: 6mm; }
  .linie { border-bottom: 0.3mm solid #666; height: 9mm; }
</style>
</head>
<body>
  <section class="page">
    <h1><span class="mark">Wartungsheft</span> · ${t.titel}</h1>
    <p class="sub">${t.unter}</p>
    <h2>${t.daten}</h2>
    <table class="ident">
      ${t.felder.map(([a, b]) => `<tr><td class="label">${a}</td><td></td><td class="label">${b}</td><td></td></tr>`).join('\n      ')}
      <tr><td class="label">${t.halter}</td><td colspan="3"></td></tr>
    </table>
    <p class="note">${t.hinweis}</p>
    <div class="linien">${Array.from({ length: 5 }, () => '<div class="linie"></div>').join('')}</div>
  </section>
  ${hist(1)}
  ${hist(2)}
  ${hist(3)}
  <section class="page">
    <h2>${t.intervalle}</h2>
    <table class="int">
      <thead><tr>${t.intervallSpalten.map(s => `<th>${s}</th>`).join('')}</tr></thead>
      <tbody>${t.intervalleZeilen.map(z => `<tr>${z.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <h2 style="margin-top: 8mm">${t.bemerkungen}</h2>
    <div class="linien">${Array.from({ length: 8 }, () => '<div class="linie"></div>').join('')}</div>
  </section>
</body>
</html>
`
}

const browser = await chromium.launch()
for (const [sprache, t] of Object.entries(TEXTE)) {
  const ziel = sprache === 'de'
    ? join('public', 'servicebuch-vorlage.pdf')
    : join('public', sprache, 'servicebuch-vorlage.pdf')
  mkdirSync(dirname(ziel), { recursive: true })
  const page = await browser.newPage()
  await page.setContent(seite(t), { waitUntil: 'load' })
  await page.pdf({
    path: ziel,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font:7pt system-ui;color:#666;padding:0 14mm;display:flex;justify-content:space-between;"><span>${t.fuss}</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`,
    margin: { top: '12mm', bottom: '14mm', left: '12mm', right: '12mm' },
  })
  await page.close()
  console.log(`PDF: ${ziel}`)
}
await browser.close()

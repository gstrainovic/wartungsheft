import type { AiAccess } from './ai-access'
import type { PageKind } from './invoice-scan'
import { createMistral } from '@ai-sdk/mistral'
import { generateObject } from 'ai'
import { z } from 'zod'
import { getCurrentUserId } from '../composables/useAuth'
import { db, id, tx } from '../lib/instantdb'
import { MAINTENANCE_CATEGORIES } from './categories'
import { mergePdfPages } from './invoice-scan'
import { diktatKopf, INVOICE_PAGE_PROMPT, INVOICE_PROMPT, KATEGORIE_SCAN, OCR_TEXT_KOPF, ocrSeite, SEITENART, SERVICE_BOOK_PROMPT, VEHICLE_DOC_PROMPT, vorherigeSeite } from './prompts'

export { MAINTENANCE_CATEGORIES }
export type { MaintenanceCategory } from './categories'

const invoiceSchema = z.object({
  workshopName: z.string().describe('Name der Werkstatt'),
  date: z.string().describe('Datum der Arbeit im Format YYYY-MM-DD: Reparatur- oder Leistungsdatum, falls angegeben, sonst Rechnungsdatum'),
  totalAmount: z.number().describe('Gesamtbetrag (brutto, inkl. MwSt.)'),
  currency: z.string().describe('Währung: CHF, EUR, USD etc.'),
  mileageAtService: z.number().nullable().optional().describe('Kilometerstand bei Reparatur falls angegeben, null wenn nicht vorhanden'),
  licensePlate: z.string().nullable().optional().describe('Kennzeichen des Fahrzeugs (z.B. SG 218574, M-AB 1234). NICHT die Fahrgestellnummer/VIN.'),
  vin: z.string().nullable().optional().describe('Fahrgestellnummer/VIN (17-stellig, beginnt meist mit W, V, oder ähnlich)'),
  items: z.array(z.object({
    description: z.string().describe('Beschreibung der Arbeit oder des Teils'),
    category: z.enum(MAINTENANCE_CATEGORIES).describe(KATEGORIE_SCAN),
    amount: z.number().describe('Einzelbetrag dieser Position (nicht die Zwischensumme oder Gesamtsumme)'),
  })),
})

export type ParsedInvoice = z.infer<typeof invoiceSchema>

const vehicleDocumentSchema = z.object({
  documentType: z.string().describe('Art des Dokuments: fahrzeugausweis, kaufvertrag, fahrzeugschein, sonstiges'),
  make: z.string().describe('Marke des Fahrzeugs (Schweizer Fahrzeugausweis: erster Teil von Feld 21 «Marke und Typ»)'),
  model: z.string().describe('Modell/Typ (Fahrzeugausweis: Rest von Feld 21, z. B. «SAURER 3 DUX» → Modell «3 DUX»)'),
  year: z.number().describe('Vierstelliges Jahr der 1. Inverkehrsetzung (Fahrzeugausweis Feld 36, «03.64» → 1964), sonst Baujahr'),
  vin: z.string().nullable().optional().describe('Fahrgestellnummer (Fahrzeugausweis Feld 23) wie gedruckt, bei neueren Fahrzeugen 17-stellige VIN'),
  plate: z.string().nullable().optional().describe('Kontrollschild (Fahrzeugausweis Feld 15, z. B. «SG 218574»); steht nur das Kantonskürzel, nur dieses'),
  mileage: z.number().nullable().optional().describe('Kilometerstand, auch aus Vermerken (Fahrzeugausweis Feld 13/14, z. B. «KM-STAND: 405260»)'),
  engineType: z.string().nullable().optional().describe('Motortyp: Diesel, Benzin, Elektro, Hybrid'),
  enginePower: z.string().nullable().optional().describe('Leistung z.B. 140 kW / 190 PS'),
  purchaseDate: z.string().nullable().optional().describe('Kaufdatum im Format YYYY-MM-DD'),
  purchasePrice: z.number().nullable().optional().describe('Kaufpreis (Währung wie im Dokument, sonst CHF)'),
})

export type ParsedVehicleDocument = z.infer<typeof vehicleDocumentSchema>

const serviceBookSchema = z.object({
  entries: z.array(z.object({
    // alles ausser der Struktur tolerant: ein leeres Feld darf nicht die ganze Seite verwerfen
    date: z.string().nullable().optional().describe('Datum im Format YYYY-MM-DD'),
    mileage: z.number().nullable().optional().describe('Kilometerstand, weglassen wenn nicht eingetragen'),
    workshopName: z.string().nullable().optional().describe('Name der Werkstatt'),
    items: z.array(z.object({
      description: z.string().describe('Beschreibung der Arbeit'),
      // bewusst kein Enum: eine unbekannte Art würde sonst die ganze Seite verwerfen; die Auswertung filtert
      category: z.string().describe(`Kategorie, genau eine aus: ${MAINTENANCE_CATEGORIES.join(', ')}`),
    })).optional(),
  })),
  manufacturerIntervals: z.array(z.object({
    type: z.string().describe(`Wartungsart, genau eine aus: ${MAINTENANCE_CATEGORIES.join(', ')}`),
    label: z.string().optional().describe('Bezeichnung wie im Heft, z. B. «Motoröl + Ölfilter»'),
    intervalKm: z.number().describe('Intervall in km, 0 wenn nur zeitbasiert'),
    intervalMonths: z.number().describe('Intervall in Monaten, 0 wenn nur km-basiert'),
  })).optional().describe('Hersteller-Wartungsintervalle falls auf der Seite sichtbar'),
})

export type ParsedServiceBook = z.infer<typeof serviceBookSchema>

export const DEFAULT_MODEL = 'mistral-small-latest'

interface ModelOptions {
  access: AiAccess
  model?: string
}

export function getModel(opts: ModelOptions) {
  const { baseURL, apiKey, headers } = opts.access
  return createMistral({ apiKey, baseURL, headers })(opts.model || DEFAULT_MODEL)
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 4): Promise<T> {
  let lastError: any
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    }
    catch (e: any) {
      lastError = e
      const msg = e.message || ''
      const isRateLimit = msg.includes('429') || msg.includes('Rate limit') || msg.includes('RESOURCE_EXHAUSTED') || e.statusCode === 429
      if (!isRateLimit || attempt === maxRetries)
        break
      const waitMs = [5000, 15000, 30000, 60000][attempt] ?? 60000
      console.warn(`Rate limit — warte ${waitMs / 1000}s (Versuch ${attempt + 1}/${maxRetries})`)
      await new Promise(r => setTimeout(r, waitMs))
    }
  }
  throw lastError
}

/**
 * In-Memory-Cache für OCR-Ergebnisse: SHA-256-Hash des Bildes → Markdown-Text.
 * Verhindert doppelte OCR-Aufrufe für dasselbe Bild (z.B. bei Tests, Retry, Phase 1 + scan_document).
 */
const ocrCache = new Map<string, string>()

export async function hashImage(base64: string): Promise<string> {
  const data = new TextEncoder().encode(base64)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface OcrPage {
  markdown?: string
  header?: string
  footer?: string
  tables?: { id: string, content: string }[]
}

/**
 * Ruft die Mistral OCR API auf und gibt den extrahierten Markdown-Text zurück.
 * Nutzt /v1/ocr statt /v1/chat/completions — spezialisiertes OCR-Modell mit
 * perfekter Tabellen- und Spaltenstruktur-Erkennung.
 * Ergebnisse werden per SHA-256-Hash gecacht (In-Memory).
 */
export interface OcrResult {
  markdown: string
  cacheId: string
}

export async function callMistralOcr(imageBase64: string, access: AiAccess): Promise<OcrResult> {
  const hash = await hashImage(imageBase64)

  // 1. In-Memory-Cache (schnellste Stufe)
  const memCached = ocrCache.get(hash)
  if (memCached) {
    return { markdown: memCached, cacheId: hash }
  }

  // 2. InstantDB-Cache (persistente Stufe)
  // InstantDB verlangt UUIDs als Entity-IDs, daher hash als Feld speichern
  try {
    const result = await db.queryOnce({ ocrcache: {} })
    const ocrEntries = result.data.ocrcache || []
    const cached = ocrEntries.find((o: any) => o.hash === hash)
    if (cached) {
      ocrCache.set(hash, cached.markdown)
      return { markdown: cached.markdown, cacheId: hash }
    }
  }
  catch (e) {
    // Ohne Verbindung gibt es keinen Cache-Treffer; das ist kein Fehler, der Scan läuft trotzdem
    console.warn('[OCR] Cache nicht abfragbar:', e)
  }

  const resp = await fetch(`${access.baseURL}/ocr`, {
    method: 'POST',
    headers: {
      ...access.headers,
      'Authorization': `Bearer ${access.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        image_url: imageBase64.startsWith('/9j/') ? `data:image/jpeg;base64,${imageBase64}` : `data:image/webp;base64,${imageBase64}`,
      },
      table_format: 'markdown',
    }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(`Mistral OCR error ${resp.status}: ${(err as any).error?.message || resp.statusText}`)
  }

  const data = await resp.json() as { pages?: OcrPage[] }
  const text = data.pages?.map((p) => {
    let md = p.markdown || ''
    // Tabellen-Platzhalter durch echten Inhalt ersetzen
    if (p.tables?.length) {
      for (const tbl of p.tables)
        md = md.replace(`[${tbl.id}](${tbl.id})`, tbl.content)
    }
    return md
  }).join('\n\n') || ''

  ocrCache.set(hash, text)

  // In InstantDB persistieren (UUID als Entity-ID, hash als Feld)
  try {
    const entityId = id()
    await db.transact([tx.ocrcache[entityId].update({ hash, markdown: text, creatorId: getCurrentUserId(), createdAt: Date.now() })])
  }
  catch (e) {
    console.error('[OCR] InstantDB cache write failed:', e)
  }

  return { markdown: text, cacheId: hash }
}

/**
 * Ruft die Mistral OCR API für ein PDF-Dokument auf.
 * Gibt ein Array von Markdown-Texten zurück (einer pro Seite).
 * Mistral OCR: max 50 MB Dateigröße, max 1000 Seiten.
 */
export async function callMistralOcrPdf(pdfBase64: string, access: AiAccess): Promise<string[]> {
  const resp = await fetch(`${access.baseURL}/ocr`, {
    method: 'POST',
    headers: {
      ...access.headers,
      'Authorization': `Bearer ${access.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-ocr-latest',
      document: {
        type: 'document_url',
        document_url: `data:application/pdf;base64,${pdfBase64}`,
      },
      table_format: 'markdown',
    }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(`Mistral OCR PDF error ${resp.status}: ${(err as any).error?.message || resp.statusText}`)
  }

  const data = await resp.json() as { pages?: OcrPage[] }
  return (data.pages || []).map((p) => {
    let md = p.markdown || ''
    if (p.tables?.length) {
      for (const tbl of p.tables)
        md = md.replace(`[${tbl.id}](${tbl.id})`, tbl.content)
    }
    return md
  })
}

/**
 * Zwei-Stufen-Pipeline für Mistral: OCR → Chat
 * Stufe 1: mistral-ocr-latest extrahiert Text perfekt (inkl. Tabellen)
 * Stufe 2: Chat-Modell parst den OCR-Text in strukturiertes JSON (ohne Bild)
 *
 * Getestet vs. document_annotation_format (Ein-Stufen): Document Annotation
 * halluziniert massiv bei Rechnungen (erfindet Beträge, falsche Kategorien).
 * 2-Stufen ist zuverlässiger weil das Chat-Modell nur den OCR-Text sieht.
 */
async function parseWithOcrPipeline<T>(
  imageBase64: string,
  access: AiAccess,
  schema: z.ZodType<T>,
  prompt: string,
  modelId?: string,
): Promise<T> {
  const { markdown: ocrText } = await withRetry(() => callMistralOcr(imageBase64, access))
  return parseOcrText(ocrText, access, schema, prompt, modelId)
}

/** Stufe 2 allein: bereits erkannten OCR-Text (z. B. aus einem PDF) in das Schema überführen */
async function parseOcrText<T>(
  ocrText: string,
  access: AiAccess,
  schema: z.ZodType<T>,
  prompt: string,
  modelId?: string,
): Promise<T> {
  const model = getModel({ access, model: modelId })

  const { object } = await withRetry(() => generateObject({
    model,
    maxRetries: 0,
    temperature: 0,
    schema,
    messages: [{
      role: 'user',
      content: `${prompt}\n\n${OCR_TEXT_KOPF}\n${ocrText}`,
    }],
  }))

  return object as T
}

export async function parseInvoice(
  imageBase64: string,
  access: AiAccess,
  modelId?: string,
): Promise<ParsedInvoice> {
  return parseWithOcrPipeline(imageBase64, access, invoiceSchema, INVOICE_PROMPT, modelId)
}

/**
 * Rechnung aus gesprochenem Text: dieselbe zweite Stufe wie beim Foto, nur kommt der Text aus dem Diktat statt
 * aus der OCR. Im Test traf dieser Weg alle fünf Felder, während das Audio-Modell direkt den Werkstattnamen
 * verhörte (`stt-vergleich.md`).
 */
export async function parseInvoiceFromSpeech(
  gesprochen: string,
  access: AiAccess,
  modelId?: string,
): Promise<ParsedInvoice> {
  return parseOcrText(diktatKopf(gesprochen), access, invoiceSchema, INVOICE_PROMPT, modelId)
}

const invoicePageSchema = invoiceSchema.extend({
  kind: z.enum(['rechnung', 'fortsetzung', 'andere']).describe(SEITENART),
})

export type ParsedPdfInvoice = ParsedInvoice & { pages: number[] }

/** Seiten gleichzeitig auswerten, aber nicht alle auf einmal (Rate-Limit des Proxys) */
const PAGE_CONCURRENCY = 3

/**
 * Rechnungen aus einem PDF: alle Seiten per OCR lesen, dann jede Seite einzeln auswerten und Fortsetzungen
 * zusammenführen (mergePdfPages). Ein Aufruf für das ganze PDF liess bei 9 Seiten Rechnungen aus und übertrug die
 * Werkstatt der ersten Rechnung auf alle.
 */
export async function parseInvoicesPdf(
  pdfBase64: string,
  access: AiAccess,
  modelId?: string,
  onProgress?: (done: number, total: number) => void,
): Promise<{ invoices: ParsedPdfInvoice[], pages: number }> {
  const texts = await withRetry(() => callMistralOcrPdf(pdfBase64, access))
  const results: { page: number, kind: PageKind, parsed: ParsedInvoice }[] = Array.from({ length: texts.length })
  let next = 0
  let done = 0
  async function worker() {
    while (next < texts.length) {
      const i = next++
      const previous = i > 0 ? vorherigeSeite(texts[i - 1]!.slice(0, 1200)) : ''
      const { kind, ...parsed } = await parseOcrText(`${texts[i]}${previous}`, access, invoicePageSchema, INVOICE_PAGE_PROMPT, modelId)
      results[i] = { page: i + 1, kind, parsed }
      onProgress?.(++done, texts.length)
    }
  }
  await Promise.all(Array.from({ length: Math.min(PAGE_CONCURRENCY, texts.length) }, worker))
  return { invoices: mergePdfPages(results), pages: texts.length }
}

export async function parseVehicleDocument(
  imageBase64: string,
  access: AiAccess,
  modelId?: string,
): Promise<ParsedVehicleDocument> {
  return parseWithOcrPipeline(imageBase64, access, vehicleDocumentSchema, VEHICLE_DOC_PROMPT, modelId)
}

/** Fahrzeugdokument als PDF: alle Seiten per OCR, gemeinsam auswerten (Ausweis und Kaufvertrag sind kurz) */
export async function parseVehicleDocumentPdf(
  pdfBase64: string,
  access: AiAccess,
  modelId?: string,
): Promise<ParsedVehicleDocument> {
  const pages = await withRetry(() => callMistralOcrPdf(pdfBase64, access))
  const text = pages.map((t, i) => `${ocrSeite(i + 1)}\n${t}`).join('\n\n')
  return parseOcrText(text, access, vehicleDocumentSchema, VEHICLE_DOC_PROMPT, modelId)
}

export async function parseServiceBook(
  imageBase64: string,
  access: AiAccess,
  modelId?: string,
): Promise<ParsedServiceBook> {
  return parseWithOcrPipeline(imageBase64, access, serviceBookSchema, SERVICE_BOOK_PROMPT, modelId)
}

/** Serviceheft als PDF (eingescannte Seiten): alle Seiten per OCR, gemeinsam auswerten */
export async function parseServiceBookPdf(
  pdfBase64: string,
  access: AiAccess,
  modelId?: string,
): Promise<ParsedServiceBook> {
  const pages = await withRetry(() => callMistralOcrPdf(pdfBase64, access))
  const text = pages.map((t, i) => `${ocrSeite(i + 1)}\n${t}`).join('\n\n')
  return parseOcrText(text, access, serviceBookSchema, SERVICE_BOOK_PROMPT, modelId)
}

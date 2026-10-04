import type { AiAccess } from './ai-access'
import type { EntrySource } from './entry-source'
import { generateText, stepCountIs, tool } from 'ai'
import { z } from 'zod'
import { getCurrentUserId } from '../composables/useAuth'
import { autoRotateForDocument } from '../composables/useImageResize'
import { appSprache, waehle } from '../lib/app-sprache'
import { db, id as instantId, tx } from '../lib/instantdb'
import { formatCurrency, formatDate, formatNumber, normalizeCurrency } from '../lib/locale'
import chatTexte from '../texte/app/chat'
import { callMistralOcr, callMistralOcrPdf, getModel, hashImage, MAINTENANCE_CATEGORIES, parseInvoice, parseServiceBook, parseVehicleDocument, withRetry } from './ai'
import { correctCategory } from './category-correction'
import { claimsActionWithoutTool } from './chat-guard'
import { saveInvoice } from './invoice-save'
import { checkDueMaintenances, getMaintenanceSchedule } from './maintenance-schedule'
import {
  AKTION_NACHFASSEN,
  BILD_ANALYSIEREN,
  bildOcrKontext,
  bildPhase1,
  bildPhase2,
  chatSystemPrompt,
  fahrzeugKontext,
  KATEGORIE_RECHNUNG,
  KATEGORIE_WARTUNG,
  LISTE_SERVICEHEFT_FEHLT,
  LISTE_SERVICEHEFT_HINTERLEGT,
  ocrSeite,
  offenesFahrzeug,
  pdfPhase1,
  pdfPhase2,
  SERVICEHEFT_FEHLT,
  SERVICEHEFT_HINTERLEGT,
} from './prompts'

export interface ToolResult {
  tool: string
  data: Record<string, any>
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachment?: { type: 'image' | 'pdf', name: string, preview?: string }
  attachments?: { type: 'image' | 'pdf', name: string, preview?: string }[]
  toolResults?: ToolResult[]
}

/** Begrüssung mit Beispielen in der App-Sprache; nennt die eigenen Fahrzeuge, damit die Beispiele nicht erfunden wirken */
export function welcomeMessage(vehicles: { make: string, model: string }[] = []): ChatMessage {
  const first = vehicles[0] ? `${vehicles[0].make} ${vehicles[0].model}` : 'Caddy'
  const second = vehicles[1] ? `${vehicles[1].make} ${vehicles[1].model}` : vehicles[0] ? first : 'Ducato'
  return {
    id: 'welcome',
    role: 'assistant',
    content: waehle(chatTexte).begruessung(first, second),
  }
}

export const WELCOME_MESSAGE: ChatMessage = welcomeMessage()

/** Texte der Werkzeug-Ergebnisse in der App-Sprache: das Modell gibt sie weiter, ohne Modelltext zeigt sie der Chat */
function w() {
  return waehle(chatTexte).werkzeug
}

function createTools(access: AiAccess, modelId?: string, imagesBase64?: string[]) {
  return {
    list_vehicles: tool({
      description: 'Listet alle Fahrzeuge auf',
      inputSchema: z.object({}),
      execute: async () => {
        const result = await db.queryOnce({ vehicles: {} })
        const vehicles = result.data.vehicles || []
        return vehicles.map((v: any) => ({
          id: v.id,
          make: v.make,
          model: v.model,
          year: v.year,
          mileage: v.mileage,
          licensePlate: v.licensePlate,
        }))
      },
    }),

    add_vehicle: tool({
      description: 'Fügt ein neues Fahrzeug hinzu. Frage nach fehlenden Pflichtfeldern (Marke, Modell, Baujahr).',
      inputSchema: z.object({
        make: z.string().describe('Marke (z.B. BMW, Audi, VW)'),
        model: z.string().describe('Modell (z.B. 320d, A4, Golf)'),
        year: z.number().describe('Baujahr'),
        mileage: z.number().optional().describe('Kilometerstand'),
        licensePlate: z.string().optional().describe('Kontrollschild (Kennzeichen)'),
        vin: z.string().optional().describe('Fahrgestellnummer'),
      }),
      execute: async ({ make, model, year, mileage, licensePlate, vin }) => {
        const now = Date.now()
        const vehicleId = instantId()
        await db.transact([
          tx.vehicles[vehicleId].update({
            make,
            model,
            year,
            mileage: mileage || 0,
            licensePlate: licensePlate || '',
            vin: vin || '',
            source: 'chat' satisfies EntrySource,
            creatorId: getCurrentUserId(),
            createdAt: now,
          }),
        ])
        return {
          success: true,
          vehicleId,
          message: w().fahrzeugAngelegt,
          data: { make, model, year, mileage: mileage || 0, licensePlate: licensePlate || '', vin: vin || '' },
        }
      },
    }),

    update_vehicle: tool({
      description: 'Aktualisiert Fahrzeug-Daten. Nur die übergebenen Felder werden geändert.',
      inputSchema: z.object({
        vehicleId: z.string().describe('Fahrzeug-ID'),
        make: z.string().optional().describe('Neue Marke'),
        model: z.string().optional().describe('Neues Modell'),
        year: z.number().optional().describe('Neues Baujahr'),
        mileage: z.number().optional().describe('Neuer Kilometerstand'),
        licensePlate: z.string().optional().describe('Neues Kontrollschild (Kennzeichen)'),
        vin: z.string().optional().describe('Neue Fahrgestellnummer'),
      }),
      execute: async ({ vehicleId, make, model, year, mileage, licensePlate, vin }) => {
        const result = await db.queryOnce({ vehicles: {} })
        const vehicles = result.data.vehicles || []
        const vehicle = vehicles.find((v: any) => v.id === vehicleId)
        if (!vehicle)
          return { success: false, message: w().fahrzeugNichtGefunden }
        const before: Record<string, any> = {}
        const after: Record<string, any> = {}
        const patch: Record<string, any> = {}
        const fields = { make, model, year, mileage, licensePlate, vin } as Record<string, any>
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) {
            before[key] = (vehicle as any)[key]
            after[key] = value
            patch[key] = value
          }
        }
        await db.transact([tx.vehicles[vehicleId].update(patch)])
        return {
          success: true,
          message: w().aktualisiert(`${after.make || vehicle.make} ${after.model || vehicle.model}`),
          vehicle: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
          changes: { before, after },
        }
      },
    }),

    delete_vehicle: tool({
      description: 'Löscht ein Fahrzeug und alle zugehörigen Rechnungen und Wartungen',
      inputSchema: z.object({
        vehicleId: z.string().describe('Fahrzeug-ID'),
      }),
      execute: async ({ vehicleId }) => {
        const result = await db.queryOnce({ vehicles: {}, invoices: {}, maintenances: {} })
        const vehicles = result.data.vehicles || []
        const vehicle = vehicles.find((v: any) => v.id === vehicleId)
        if (!vehicle)
          return { success: false, message: w().fahrzeugNichtGefunden }
        const name = `${vehicle.make} ${vehicle.model}`
        const invoices = (result.data.invoices || []).filter((i: any) => i.vehicleId === vehicleId)
        const maintenances = (result.data.maintenances || []).filter((m: any) => m.vehicleId === vehicleId)
        const transactions = [
          ...invoices.map((i: any) => tx.invoices[i.id].delete()),
          ...maintenances.map((m: any) => tx.maintenances[m.id].delete()),
          tx.vehicles[vehicleId].delete(),
        ]
        await db.transact(transactions)
        return {
          success: true,
          message: w().fahrzeugGeloescht,
          deleted: { vehicle: name, invoices: invoices.length, maintenances: maintenances.length },
        }
      },
    }),

    get_vehicle: tool({
      description: 'Zeigt Details eines Fahrzeugs mit Rechnungen und Wartungshistorie',
      inputSchema: z.object({
        vehicleId: z.string().describe('Fahrzeug-ID'),
      }),
      execute: async ({ vehicleId }) => {
        const result = await db.queryOnce({ vehicles: {}, invoices: {}, maintenances: {} })
        const vehicles = result.data.vehicles || []
        const vehicle = vehicles.find((v: any) => v.id === vehicleId)
        if (!vehicle)
          return { error: w().fahrzeugNichtGefunden }
        const invoices = (result.data.invoices || []).filter((i: any) => i.vehicleId === vehicleId)
        const maintenances = (result.data.maintenances || []).filter((m: any) => m.vehicleId === vehicleId)
        return {
          vehicle: { id: vehicle.id, make: vehicle.make, model: vehicle.model, year: vehicle.year, mileage: vehicle.mileage, licensePlate: vehicle.licensePlate, hasCustomSchedule: !!vehicle.customSchedule?.length },
          invoices: invoices.map((i: any) => ({
            id: i.id,
            workshopName: i.workshopName,
            date: i.date,
            totalAmount: i.totalAmount,
            items: i.items,
            hasOcrText: !!i.ocrCacheId,
          })),
          maintenances: maintenances.map((m: any) => ({
            type: m.type,
            description: m.description,
            doneAt: m.doneAt,
            mileageAtService: m.mileageAtService,
          })),
        }
      },
    }),

    get_maintenance_status: tool({
      description: 'Prüft den Wartungsstatus eines Fahrzeugs. Status je Arbeit: done (erledigt), due (bald fällig, innerhalb 30 Tagen oder 1000 km), overdue (überfällig), unknown (kein Eintrag vorhanden, nicht als fällig werten)',
      inputSchema: z.object({
        vehicleId: z.string().describe('Fahrzeug-ID'),
      }),
      execute: async ({ vehicleId }) => {
        const result = await db.queryOnce({ vehicles: {}, maintenances: {} })
        const vehicles = result.data.vehicles || []
        const vehicle = vehicles.find((v: any) => v.id === vehicleId)
        if (!vehicle)
          return { error: w().fahrzeugNichtGefunden }
        const schedule = getMaintenanceSchedule(vehicle.customSchedule)
        // Nur erledigte Arbeiten zählen als Wartung; geplante Einträge sind vereinbarte Termine
        const own = (result.data.maintenances || []).filter((m: any) => m.vehicleId === vehicleId)
        const lastMaintenances = own.filter((m: any) => m.status === 'done').map((m: any) => ({
          type: m.type,
          mileageAtService: m.mileageAtService,
          doneAt: m.doneAt,
        }))
        const status = checkDueMaintenances({
          currentMileage: vehicle.mileage,
          lastMaintenances,
          plannedMaintenances: own.filter((m: any) => m.status !== 'done').map((m: any) => ({ type: m.type, doneAt: m.doneAt })),
          schedule,
        })
        const hasCustomSchedule = !!vehicle.customSchedule?.length
        return {
          ...status,
          hasCustomSchedule,
          // Anweisung im Tool-Ergebnis, weil Mistral den Prompt-Hinweis sonst auch bei hinterlegtem Serviceheft bringt
          serviceBookHint: hasCustomSchedule ? SERVICEHEFT_HINTERLEGT : SERVICEHEFT_FEHLT,
          vehicle: `${vehicle.make} ${vehicle.model}`,
        }
      },
    }),

    set_maintenance_schedule: tool({
      description: 'Setzt den Wartungsplan eines Fahrzeugs basierend auf Hersteller-Angaben aus dem Service-Heft',
      inputSchema: z.object({
        vehicleId: z.string().describe('Fahrzeug-ID'),
        schedule: z.array(z.object({
          type: z.enum(MAINTENANCE_CATEGORIES).describe('Wartungskategorie'),
          label: z.string().describe('Beschreibung z.B. "Motoröl + Ölfilter"'),
          intervalKm: z.number().describe('km-Intervall (0 wenn nur zeitbasiert)'),
          intervalMonths: z.number().describe('Monats-Intervall'),
        })).describe('Wartungsintervalle aus dem Service-Heft'),
      }),
      execute: async ({ vehicleId, schedule }) => {
        const result = await db.queryOnce({ vehicles: {} })
        const vehicles = result.data.vehicles || []
        const vehicle = vehicles.find((v: any) => v.id === vehicleId)
        if (!vehicle)
          return { error: w().fahrzeugNichtGefunden }
        await db.transact([tx.vehicles[vehicleId].update({ customSchedule: schedule })])
        return {
          success: true,
          message: w().planGespeichert(`${vehicle.make} ${vehicle.model}`, schedule.length),
          schedule: schedule.map(s => ({
            label: s.label,
            interval: `${s.intervalKm > 0 ? `${formatNumber(s.intervalKm)} km` : ''}${s.intervalKm > 0 && s.intervalMonths > 0 ? ' / ' : ''}${s.intervalMonths > 0 ? w().monate(s.intervalMonths) : ''}`,
          })),
        }
      },
    }),

    add_invoice: tool({
      description: 'Trägt eine Rechnung manuell ein',
      inputSchema: z.object({
        vehicleId: z.string().describe('Fahrzeug-ID'),
        workshopName: z.string().describe('Name der Werkstatt'),
        date: z.string().describe('Datum im Format YYYY-MM-DD'),
        totalAmount: z.number().describe('Gesamtbetrag'),
        currency: z.string().optional().describe('Währung (z.B. CHF, EUR, USD). Standard: CHF'),
        mileageAtService: z.number().optional().describe('Kilometerstand'),
        imageIndex: z.number().optional().describe('Index des zugehörigen Bildes (0-basiert)'),
        items: z.array(z.object({
          description: z.string().describe('Beschreibung der Arbeit oder des Teils'),
          category: z.enum(MAINTENANCE_CATEGORIES).describe(KATEGORIE_RECHNUNG),
          amount: z.number().describe('Einzelbetrag dieser Position'),
        })).describe('Positionen der Rechnung'),
      }),
      execute: async ({ vehicleId, workshopName, date, totalAmount, currency, mileageAtService, imageIndex, items }) => {
        // Duplikat nur bei gleichem Datum, gleicher Werkstatt und gleichem Betrag
        const result = await db.queryOnce({ invoices: {}, vehicles: {} })
        const duplicate = (result.data.invoices || []).find((i: any) =>
          i.vehicleId === vehicleId && i.date === date && i.workshopName === workshopName && i.totalAmount === totalAmount)
        if (duplicate) {
          return {
            success: false,
            message: w().rechnungExistiert(duplicate.workshopName, formatDate(duplicate.date), formatCurrency(duplicate.totalAmount, normalizeCurrency(duplicate.currency))),
          }
        }

        const imgRaw = imagesBase64?.length ? (imagesBase64[imageIndex ?? 0] ?? '') : ''
        const imageData = imgRaw ? await autoRotateForDocument(imgRaw) : ''
        const ocrCacheId = imgRaw ? await hashImage(imgRaw) : ''
        // Gleicher Speicherweg wie Formular und Stapel: Kategorien korrigieren, Positionen prüfen,
        // eine Wartung pro Kategorie, Kilometerstand nachziehen
        const { plan } = await saveInvoice({ vehicleId, workshopName, date, totalAmount, currency, mileageAtService, items, imageData, ocrCacheId }, 'chat')
        return {
          success: true,
          message: w().rechnungErfasst,
          data: {
            workshopName,
            date,
            totalAmount,
            currency: plan.invoice.currency,
            mileageAtService: plan.invoice.mileageAtService ?? 0,
            items: plan.invoice.items.map(i => ({ description: i.description, category: i.category, amount: i.amount })),
          },
        }
      },
    }),

    delete_invoice: tool({
      description: 'Löscht eine Rechnung und zugehörige Wartungseinträge',
      inputSchema: z.object({
        invoiceId: z.string().describe('Rechnungs-ID'),
      }),
      execute: async ({ invoiceId }) => {
        const result = await db.queryOnce({ invoices: {}, maintenances: {} })
        const invoices = result.data.invoices || []
        const invoice = invoices.find((i: any) => i.id === invoiceId)
        if (!invoice)
          return { success: false, message: w().rechnungNichtGefunden }
        const maintenances = (result.data.maintenances || []).filter((m: any) => m.invoiceId === invoiceId)
        const transactions = [
          ...maintenances.map((m: any) => tx.maintenances[m.id].delete()),
          tx.invoices[invoiceId].delete(),
        ]
        await db.transact(transactions)
        return {
          success: true,
          message: w().rechnungGeloescht,
          deleted: { workshopName: invoice.workshopName, date: invoice.date, totalAmount: invoice.totalAmount, currency: invoice.currency, maintenances: maintenances.length },
        }
      },
    }),

    get_ocr_text: tool({
      description: 'Liest den OCR-Text einer Rechnung aus dem Cache. Nützlich um Details einer gespeicherten Rechnung nachzuschlagen.',
      inputSchema: z.object({
        invoiceId: z.string().describe('Rechnungs-ID'),
      }),
      execute: async ({ invoiceId }) => {
        const result = await db.queryOnce({ invoices: {}, ocrcache: {} })
        const invoices = result.data.invoices || []
        const invoice = invoices.find((i: any) => i.id === invoiceId)
        if (!invoice)
          return { error: w().rechnungNichtGefunden }
        if (!invoice.ocrCacheId)
          return { error: w().keinOcr }
        const ocrEntries = result.data.ocrcache || []
        const ocrEntry = ocrEntries.find((o: any) => o.hash === invoice.ocrCacheId)
        if (!ocrEntry)
          return { error: w().ocrFehlt }
        return { invoiceId, ocrText: ocrEntry.markdown }
      },
    }),

    add_maintenance: tool({
      description: 'Trägt eine Wartung OHNE Rechnung ein. Verwende dies wenn der Benutzer eine erledigte Wartung melden will aber keine Rechnung hat.',
      inputSchema: z.object({
        vehicleId: z.string().describe('Fahrzeug-ID'),
        type: z.enum(MAINTENANCE_CATEGORIES).describe(KATEGORIE_WARTUNG),
        description: z.string().describe('Beschreibung der Wartung'),
        doneAt: z.string().describe('Datum im Format YYYY-MM-DD'),
        mileageAtService: z.number().optional().describe('Kilometerstand bei der Wartung'),
      }),
      execute: async ({ vehicleId, type, description, doneAt, mileageAtService }) => {
        const result = await db.queryOnce({ vehicles: {} })
        const vehicles = result.data.vehicles || []
        const vehicle = vehicles.find((v: any) => v.id === vehicleId)
        if (!vehicle)
          return { success: false, message: w().fahrzeugNichtGefunden }

        const category = correctCategory(description, type)
        const maintenanceId = instantId()
        const transactions: any[] = [
          tx.maintenances[maintenanceId].update({
            vehicleId,
            invoiceId: '',
            type: category,
            description,
            doneAt,
            mileageAtService: mileageAtService || 0,
            nextDueDate: '',
            nextDueMileage: 0,
            status: 'done',
            source: 'chat' satisfies EntrySource,
            creatorId: getCurrentUserId(),
            createdAt: Date.now(),
          }),
        ]

        if (mileageAtService && mileageAtService > (vehicle.mileage || 0))
          transactions.push(tx.vehicles[vehicleId].update({ mileage: mileageAtService }))

        await db.transact(transactions)
        return {
          success: true,
          message: w().wartungEingetragen,
          data: {
            type: category,
            description,
            doneAt,
            mileageAtService: mileageAtService || 0,
            vehicle: `${vehicle.make} ${vehicle.model}`,
          },
        }
      },
    }),

    scan_document: tool({
      description: 'Analysiert ein Foto. Erkennt automatisch ob es eine Rechnung, ein Kaufvertrag, ein Fahrzeugausweis oder eine Service-Heft-Seite ist. Das Bild muss als base64 übergeben werden.',
      inputSchema: z.object({
        imageBase64: z.string().describe('Base64-kodiertes Bild'),
        documentType: z.string().describe('Art des Dokuments: rechnung, kaufvertrag, fahrzeugschein, serviceheft'),
        vehicleId: z.string().optional().describe('Fahrzeug-ID falls bekannt (nötig für Rechnungen und Service-Hefte)'),
      }),
      execute: async ({ imageBase64, documentType }) => {
        if (documentType === 'rechnung') {
          const result = await parseInvoice(imageBase64, access, modelId)
          return { type: 'rechnung', data: result }
        }
        else if (documentType === 'serviceheft') {
          const result = await parseServiceBook(imageBase64, access, modelId)
          return { type: 'serviceheft', data: result }
        }
        else {
          const result = await parseVehicleDocument(imageBase64, access, modelId)
          return { type: 'fahrzeugdokument', data: result }
        }
      },
    }),
  }
}

export interface ChatOptions {
  access: AiAccess
  model?: string
  /** Fahrzeug, dessen Seite gerade offen ist: Rechnungen und Wartungen ohne Nachfrage diesem zuordnen */
  currentVehicle?: { id: string, name: string }
}

/** Systemtext in der App-Sprache, mit dem offenen Fahrzeug, damit der Chat nicht nach dem Fahrzeug fragen muss */
function systemPrompt(opts: ChatOptions): string {
  const basis = chatSystemPrompt(appSprache.value)
  if (!opts.currentVehicle)
    return basis
  return `${basis}${offenesFahrzeug(opts.currentVehicle.name, opts.currentVehicle.id)}`
}

function buildAiMessages(messages: ChatMessage[], imagesBase64?: string[]) {
  return messages
    .filter(m => m.id !== 'welcome')
    .map((m) => {
      if (m.role === 'user' && m === messages[messages.length - 1] && imagesBase64?.length) {
        return {
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: m.content || BILD_ANALYSIEREN },
            ...imagesBase64.map(img => ({ type: 'image' as const, image: img })),
          ],
        }
      }
      return { role: m.role as 'user' | 'assistant', content: m.content }
    })
}

/** Ersatztext aus den Werkzeug-Ergebnissen, wenn das Modell selbst nichts schreibt */
function formatToolResult(r: any): string | undefined {
  if (!r || typeof r !== 'object')
    return undefined
  const t = w()
  const parts: string[] = []
  if (r.message)
    parts.push(String(r.message))
  if (r.data) {
    const d = r.data
    if (d.make)
      parts.push(`${t.marke}: ${d.make}, ${t.modell}: ${d.model}, ${t.baujahr}: ${d.year}, ${t.kilometerstand}: ${formatNumber(d.mileage)} km${d.licensePlate ? `, ${t.kontrollschild}: ${d.licensePlate}` : ''}`)
    if (d.workshopName)
      parts.push(`${t.werkstatt}: ${d.workshopName}, ${t.datum}: ${formatDate(d.date)}, ${t.betrag}: ${formatCurrency(d.totalAmount, normalizeCurrency(d.currency))}`)
    if (d.items?.length)
      parts.push(`${t.positionen}: ${d.items.map((i: any) => `${i.description} (${formatNumber(i.amount, 2)})`).join(', ')}`)
    if (d.type && d.doneAt && !d.workshopName)
      parts.push(`${t.typ}: ${d.type}, ${t.beschreibung}: ${d.description}, ${t.datum}: ${formatDate(d.doneAt)}${d.mileageAtService ? `, ${t.kilometerstand}: ${formatNumber(d.mileageAtService)} km` : ''}`)
  }
  if (r.changes) {
    const entries = Object.keys(r.changes.before || {})
    for (const key of entries)
      parts.push(`${key}: ${r.changes.before[key]} → ${r.changes.after[key]}`)
  }
  if (r.deleted) {
    const d = r.deleted
    if (d.vehicle)
      parts.push(`${t.geloescht}: ${d.vehicle}${d.invoices ? ` (${t.rechnungenUndWartungen(d.invoices, d.maintenances)})` : ''}`)
    if (d.workshopName)
      parts.push(`${t.geloescht}: ${t.rechnungVon(d.workshopName)} (${formatDate(d.date)}, ${formatCurrency(d.totalAmount, normalizeCurrency(d.currency))})`)
  }
  return parts.length ? parts.join('\n') : undefined
}

function extractResult(result: any): { text?: string, toolResults?: ToolResult[] } {
  const toolResults: ToolResult[] = []
  const allStepResults = result.steps
    ?.flatMap((s: any) => s.toolResults ?? []) as any[] | undefined
  if (allStepResults?.length) {
    for (const tr of allStepResults) {
      // AI SDK v6: tool results have .output (not .result)
      const output = tr?.output ?? tr?.result
      if (!output?.success || !tr?.toolName)
        continue
      if (output.data) {
        toolResults.push({ tool: tr.toolName, data: output.data })
      }
      else if (output.schedule) {
        // set_maintenance_schedule: schedule array als data
        toolResults.push({ tool: tr.toolName, data: { schedule: output.schedule, message: output.message } })
      }
    }
  }

  if (result.text)
    return { text: result.text, toolResults: toolResults.length ? toolResults : undefined }

  const messages = (allStepResults ?? [])
    .map((tr: any) => formatToolResult(tr?.output ?? tr?.result))
    .filter(Boolean)
  const text = messages.length ? messages.join('\n') : undefined
  return { text, toolResults: toolResults.length ? toolResults : undefined }
}

// Zwischenspeicher für Bilder/PDF-OCR zwischen Phase 1 (Analyse) und Phase 2 (Tool-Calls)
let pendingImages: string[] = []
let pendingPdfOcrTexts: string[] = []

export async function sendChatMessage(
  messages: ChatMessage[],
  opts: ChatOptions,
  imagesBase64?: string[],
  pdfBase64s?: string[],
): Promise<{ text: string, toolResults?: ToolResult[] }> {
  const model = getModel({
    access: opts.access,
    model: opts.model,
  })
  const t = waehle(chatTexte)

  if (pdfBase64s?.length) {
    // Phase 1 für PDF(s): OCR alle Seiten aller PDFs, dann Ergebnisse anzeigen
    pendingPdfOcrTexts = []
    pendingImages = []

    const allOcrPages: string[] = []
    for (const pdfBase64 of pdfBase64s) {
      const ocrPages = await withRetry(() => callMistralOcrPdf(pdfBase64, opts.access))
      allOcrPages.push(...ocrPages)
    }
    const ocrPages = allOcrPages
    pendingPdfOcrTexts = ocrPages

    const ocrContext = ocrPages
      .map((page, i) => `${ocrSeite(i + 1)}\n${page}`)
      .join('\n\n')

    const phase1System = `${systemPrompt(opts)}

${pdfPhase1(ocrPages.length, ocrContext)}`

    const phase1 = await withRetry(() => generateText({
      model,
      maxRetries: 0,
      temperature: 0,
      system: phase1System,
      messages: buildAiMessages(messages),
      stopWhen: stepCountIs(1),
    }))
    return { text: phase1.text || t.keineErgebnisse }
  }

  if (imagesBase64?.length) {
    // Phase 1: Bilder analysieren — nur Text zurückgeben, NICHTS speichern
    pendingImages = imagesBase64
    pendingPdfOcrTexts = []

    // OCR-Vorverarbeitung für perfekte Texterkennung (Tabellen, Spalten, Beträge)
    const ocrResults = await Promise.all(
      imagesBase64.map(img => withRetry(() => callMistralOcr(img, opts.access)).catch(() => ({ markdown: '', cacheId: '' }))),
    )
    const ocrTexts = ocrResults.map(r => r.markdown)

    const ocrContext = ocrTexts.filter(Boolean).length ? bildOcrKontext(ocrTexts) : ''

    const phase1System = `${systemPrompt(opts)}

${bildPhase1(ocrContext)}`

    // Vision-Modell: max 8 Bilder. Bei >8 nur OCR-Text verwenden (kein Bild im Request)
    const visionImages = imagesBase64.length <= 8 ? imagesBase64 : undefined

    const phase1 = await withRetry(() => generateText({
      model,
      maxRetries: 0,
      temperature: 0,
      system: phase1System,
      messages: buildAiMessages(messages, visionImages),
      stopWhen: stepCountIs(1),
    }))
    return { text: phase1.text || t.keineErgebnisse }
  }

  // Phase 2: Wenn Bilder oder PDF-OCR aus vorheriger Nachricht zwischengespeichert sind
  const storedImages = pendingImages.length ? [...pendingImages] : undefined
  const storedPdfOcr = pendingPdfOcrTexts.length ? [...pendingPdfOcrTexts] : undefined
  if (storedImages?.length)
    pendingImages = []
  if (storedPdfOcr?.length)
    pendingPdfOcrTexts = []

  const allTools = createTools(opts.access, opts.model, storedImages)
  const { scan_document: _, ...toolsWithoutScan } = allTools
  const tools = (storedImages?.length || storedPdfOcr?.length) ? toolsWithoutScan : allTools

  // Fahrzeugliste für Kontext — IMMER injizieren, nicht nur bei Bildern
  const vehicleResult = await db.queryOnce({ vehicles: {} })
  const vehicles = vehicleResult.data.vehicles || []
  const vehicleList = vehicles.map((v: any) => {
    const scheduleInfo = v.customSchedule?.length ? LISTE_SERVICEHEFT_HINTERLEGT : LISTE_SERVICEHEFT_FEHLT
    return `- ${v.make} ${v.model} (${v.year}), ${v.mileage} km${v.licensePlate ? `, ${v.licensePlate}` : ''} [${scheduleInfo}]: ID=${v.id}`
  }).join('\n')

  const vehicleContext = fahrzeugKontext(vehicleList)

  const aiMessages = buildAiMessages(messages)

  // Kontext immer anhängen, damit das Modell Fahrzeuge ohne ID-Nachfrage zuordnen kann
  if (storedPdfOcr?.length) {
    const pdfContext = storedPdfOcr
      .map((page, i) => `${ocrSeite(i + 1)}\n${page}`)
      .join('\n\n')
    aiMessages.push({
      role: 'user' as any,
      content: pdfPhase2(storedPdfOcr.length, pdfContext, vehicleContext),
    })
  }
  else if (storedImages?.length) {
    aiMessages.push({
      role: 'user' as any,
      content: bildPhase2(storedImages.length, vehicleContext),
    })
  }
  else {
    aiMessages.push({
      role: 'user' as any,
      content: `[System-Kontext] ${vehicleContext}`,
    })
  }

  // Mehr Steps für PDF mit vielen Seiten (jede Seite = mind. 1 add_invoice + 1 add_vehicle)
  const maxSteps = storedPdfOcr?.length ? Math.max(5, storedPdfOcr.length * 2 + 2) : 5

  let result = await withRetry(() => generateText({
    model,
    maxRetries: 0,
    temperature: 0,
    system: systemPrompt(opts),
    messages: aiMessages,
    tools,
    stopWhen: stepCountIs(maxSteps),
  }))

  // Guard: Das Modell behauptet eine Aktion ("wurde eingetragen"), hat aber kein Tool aufgerufen.
  // Dann einmal mit Tool-Zwang nachfassen, statt eine Falschaussage anzuzeigen.
  if (claimsActionWithoutTool(result)) {
    console.warn('[chat] Aktion behauptet ohne Tool-Aufruf — erneuter Versuch mit toolChoice=required')
    result = await withRetry(() => generateText({
      model,
      maxRetries: 0,
      temperature: 0,
      system: systemPrompt(opts),
      messages: [
        ...aiMessages,
        { role: 'user' as const, content: AKTION_NACHFASSEN },
      ],
      tools,
      // Tool-Zwang nur im ersten Schritt: gälte er auch nach dem Tool-Ergebnis, antwortete Mistral auf
      // tool_choice "any" nie, und der Chat hing in der Lade-Blase
      prepareStep: ({ stepNumber }) => (stepNumber === 0 ? { toolChoice: 'required' } : {}),
      stopWhen: stepCountIs(maxSteps),
    }))
  }

  const extracted = extractResult(result)
  return {
    text: extracted.text || t.erledigt,
    toolResults: extracted.toolResults,
  }
}

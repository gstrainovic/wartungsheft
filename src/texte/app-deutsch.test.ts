import { describe, expect, it } from 'vitest'
import { deutscheTexte } from './deutsch-finden'

/**
 * Seiten, Komponenten und Dienste der App hinter der Anmeldung: kein deutscher Text fest im Template oder Script.
 * Texte gehören nach src/texte/app/<datei>.ts (je Sprache ein Objekt, `useSprache(texte)` bzw. `waehle(texte)`).
 * Kommentare, Konsolenausgaben und Prompts an das Sprachmodell (`.describe(...)`, `description:`, src/services/prompts.ts)
 * bleiben deutsch und zählen nicht. Die Erkennung ist eine Heuristik (Umlaute und häufige deutsche Wörter);
 * was sie fälschlich meldet, kommt mit Begründung in AUSNAHMEN.
 */
const raw = (dateien: Record<string, unknown>) => dateien as Record<string, string>

const QUELLEN = raw(import.meta.glob([
  '../App.vue',
  '../pages/{DashboardPage,VehiclesPage,VehicleDetailPage,SettingsPage}.vue',
  '../components/{ChatDrawer,DictateButton,FeedbackDialog,InvoiceFormDialog,InvoiceForm,MaintenanceFormDialog,MaintenanceForm,MediaViewer,MileageDialog,OrderDialog,SellVehicleDialog,ServiceBookDialog,SetupChecklist,StatCard,ToolResultCard,VehicleCard,VehicleForm}.vue',
  '../lib/errors.ts',
  '../services/{report,maintenance-schedule,pdf-report,vehicle-status,vehicle-limit,vehicle-setup,service-record,service-book,year-export,db-export,account-delete,ai-access,invoice-items,invoice-form,chat,ai,trial-reminder,reminders}.ts',
  '../composables/{useInvoiceScan,useVehicleScan,useServiceBookScan,useDictation,useOfflineScanQueue}.ts',
], { query: '?raw', import: 'default', eager: true }))

/** Zeichenketten, die die Heuristik fälschlich für deutschen Oberflächentext hält (Datei → erlaubte Texte) */
const AUSNAHMEN: Record<string, string[]> = {}

describe('app ohne fest eingebaute deutsche Texte', () => {
  it('findet die Dateien', () => {
    expect(Object.keys(QUELLEN).length).toBeGreaterThan(40)
  })

  for (const [datei, quelle] of Object.entries(QUELLEN)) {
    it(datei, () => {
      const erlaubt = new Set(AUSNAHMEN[datei.replace(/^\.\.\//, '')] ?? [])
      expect(deutscheTexte(quelle).filter(t => !erlaubt.has(t))).toEqual([])
    })
  }
})

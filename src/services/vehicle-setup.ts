/**
 * Einrichtungs-Checkliste pro Fahrzeug: empfohlene Reihenfolge, aber kein Zwang. «Erledigt» folgt aus den Daten,
 * egal über welchen Weg sie kamen (Formular, Chat, Scan), damit ein Kaufvertrag statt Ausweis als Lücke sichtbar bleibt.
 * Texte in der App-Sprache (src/texte/app/einrichtung.ts).
 */
import { waehle } from '../lib/app-sprache'
import texte from '../texte/app/einrichtung'

export type SetupStepKey = 'ausweis' | 'serviceheft' | 'wartungen' | 'rechnungen'

export interface SetupStep {
  key: SetupStepKey
  label: string
  /** Knopf-Beschriftung */
  action: string
  hint: string
  done: boolean
}

export interface SetupInput {
  vehicle: { licensePlate?: string, vin?: string, year?: number, customSchedule?: unknown[] }
  /** Wartungen mit Status «erledigt», aus welcher Quelle auch immer */
  doneMaintenances: number
  invoices: number
}

export function setupSteps({ vehicle, doneMaintenances, invoices }: SetupInput): SetupStep[] {
  const t = waehle(texte)
  const missing = [
    !vehicle.licensePlate && t.felder.kontrollschild,
    !vehicle.vin && t.felder.fahrgestellnummer,
    !vehicle.year && t.felder.baujahr,
  ].filter(Boolean)

  // Rechnung zuerst: dafür kommt man (Foto, KI liest). Steht der Ausweis vorne, endet der erste Besuch beim Fahrzeug
  return [
    {
      key: 'rechnungen',
      ...t.rechnungen,
      done: invoices > 0,
    },
    {
      key: 'ausweis',
      label: t.ausweis.label,
      action: t.ausweis.action,
      hint: missing.length ? t.fehltNoch(missing.join(', ')) : t.ausweis.vollstaendig,
      done: !missing.length,
    },
    {
      key: 'serviceheft',
      ...t.serviceheft,
      done: !!vehicle.customSchedule?.length,
    },
    {
      key: 'wartungen',
      ...t.wartungen,
      done: doneMaintenances > 0,
    },
  ]
}

export function nextSetupStep(steps: SetupStep[]): SetupStep | undefined {
  return steps.find(s => !s.done)
}

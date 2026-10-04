/**
 * Kennzahlen für die Übergabemappe beim Verkauf: Zeitraum, Anzahl Einträge, Laufleistung und die Frage,
 * ob die Historie lückenlos wirkt. Reine Funktion, das PDF baut daraus die erste Seite (pdf-report.ts).
 */
import type { Maintenance } from '../stores/maintenances'
import { waehle } from '../lib/app-sprache'
import texte from '../texte/app/historie'

/** Ab dieser Lücke zwischen zwei Einträgen gilt die Historie nicht mehr als lückenlos */
const GAP_MONTHS = 18

export interface ServiceRecordSummary {
  count: number
  from: string
  to: string
  firstMileage?: number
  lastMileage?: number
  gapless: boolean
  /** Hinweis, wenn etwas gegen «lückenlos» spricht; leer, wenn alles passt */
  note: string
}

function months(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / (30.44 * 86_400_000)
}

export function serviceRecordSummary(maintenances: Maintenance[], now: Date = new Date()): ServiceRecordSummary {
  const t = waehle(texte)
  const done = maintenances
    .filter(m => m.status === 'done' && m.doneAt)
    .sort((a, b) => a.doneAt.localeCompare(b.doneAt))
  if (!done.length)
    return { count: 0, from: '', to: '', gapless: false, note: t.keine }

  const first = done[0]!
  const last = done[done.length - 1]!
  const gaps: string[] = []
  for (let i = 1; i < done.length; i++) {
    if (months(done[i - 1]!.doneAt, done[i]!.doneAt) > GAP_MONTHS)
      gaps.push(t.bis(done[i - 1]!.doneAt.slice(0, 7), done[i]!.doneAt.slice(0, 7)))
  }
  const sinceLast = months(last.doneAt, now.toISOString())
  const notes = [
    ...(done.length < 2 ? [t.nurEiner] : []),
    ...(gaps.length ? [t.luecke(gaps.join(', '))] : []),
    ...(sinceLast > GAP_MONTHS ? [t.langeHer] : []),
  ]
  return {
    count: done.length,
    from: first.doneAt,
    to: last.doneAt,
    firstMileage: first.mileageAtService || undefined,
    lastMileage: last.mileageAtService || undefined,
    gapless: notes.length === 0,
    note: notes.join('; '),
  }
}

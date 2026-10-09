/**
 * E-Mail-Erinnerungen für fällige und überfällige Arbeiten. Reine Funktionen, damit der Server-Job
 * (scripts/reminders.ts) und die Tests dieselbe Logik nutzen. Fälligkeit kommt aus maintenance-schedule.ts.
 */
import type { Sprache } from '../lib/sprache'
import type { DueResult } from './maintenance-schedule'
import { textToHtml } from '@strainovic/ai-proxy/mail-html'
import { istSprache } from '../lib/app-sprache'
import { formatDate, formatNumber } from '../lib/locale'
import erinnerungTexte from '../texte/app/erinnerung'
import { checkDueMaintenances, getMaintenanceSchedule, planLabel } from './maintenance-schedule'
import { activeVehicles } from './vehicle-status'

export interface ReminderUser {
  id: string
  email?: string | null
}

export interface ReminderVehicle {
  id: string
  creatorId: string
  make: string
  model: string
  licensePlate?: string
  mileage: number
  customSchedule?: any
  soldAt?: string | null
  soldMileage?: number | null
}

export interface ReminderMaintenance {
  vehicleId: string
  type: string
  doneAt: string
  mileageAtService?: number | null
  status: string
  description?: string
}

/** Entität `settings` in InstantDB, ein Dokument pro Nutzer (creatorId) */
export interface ReminderSetting {
  id?: string
  creatorId: string
  /** fehlt = eingeschaltet */
  emailReminders?: boolean
  /** Sprache der App und der Mails (src/lib/app-sprache.ts); fehlt = Deutsch */
  sprache?: string
  lastReminderAt?: string
  lastReminderKey?: string
  /** Merker der Mail vor Ende der Testzeit (trial-reminder.ts), eine pro Testzeit */
  lastTrialNoticeKey?: string
  /** Zeitpunkt, zu dem die Anmeldung an den Betreiber gemeldet wurde (signup-notice.ts) */
  signupNoticeAt?: string
  /** Antwort auf die freiwillige Herkunftsfrage der Anmeldung (src/lib/herkunft.ts) */
  herkunft?: string
  herkunftText?: string
  /** Merker der Rückfragen an Testkonten (trial-feedback.ts), zuletzt gesendete */
  lastFeedbackKey?: string
}

export interface DueEntry {
  vehicleId: string
  type: string
  status: string
}

export interface Reminder {
  userId: string
  email: string
  subject: string
  text: string
  /** Fingerabdruck der fälligen Arbeiten, gegen Wiederholungen */
  key: string
  entries: DueEntry[]
}

export const APP_URL = 'https://wartungsheft.ch'
/** Unveränderte Erinnerung frühestens nach so vielen Tagen erneut senden */
export const REPEAT_AFTER_DAYS = 30

export function reminderKey(entries: DueEntry[]): string {
  return entries.map(e => `${e.vehicleId}:${e.type}:${e.status}`).sort().join('|')
}

export function shouldSend(setting: ReminderSetting | undefined, key: string, now: Date): boolean {
  if (!setting?.lastReminderKey || !setting.lastReminderAt)
    return true
  if (setting.lastReminderKey !== key)
    return true
  const last = new Date(setting.lastReminderAt).getTime()
  return now.getTime() - last >= REPEAT_AFTER_DAYS * 86_400_000
}

/** Sprache der Mails an einen Nutzer: settings.sprache, sonst Deutsch */
export function mailSprache(setting: ReminderSetting | undefined): Sprache {
  return istSprache(setting?.sprache) ? setting.sprache : 'de'
}

function vehicleName(v: ReminderVehicle): string {
  return `${v.make} ${v.model}`
}

function itemLine(item: DueResult, sprache: Sprache): string {
  const t = erinnerungTexte[sprache]
  const when = item.nextDueDate ? formatDate(item.nextDueDate, sprache) : ''
  const km = item.nextDueMileage ? `${formatNumber(item.nextDueMileage, 0, sprache)} km` : ''
  const target = [when, km].filter(Boolean).join(` ${t.faellig.alternativ} `)
  const label = `- ${planLabel(item.label, sprache)}${t.doppelpunkt}`
  if (item.status === 'overdue')
    return `${label}${t.faellig.ueberfaellig}${target ? t.faellig.faelligWar(target) : ''}`
  return `${label}${t.faellig.baldFaellig}${target ? t.faellig.bis(target) : ''}`
}

function dueItems(v: ReminderVehicle, maintenances: ReminderMaintenance[]): DueResult[] {
  const own = maintenances.filter(m => m.vehicleId === v.id)
  const done = own.filter(m => m.status === 'done')
  return checkDueMaintenances({
    currentMileage: v.mileage,
    lastMaintenances: done.map(m => ({ type: m.type, doneAt: m.doneAt, mileageAtService: m.mileageAtService, description: m.description })),
    plannedMaintenances: own.filter(m => m.status !== 'done').map(m => ({ type: m.type, doneAt: m.doneAt })),
    schedule: getMaintenanceSchedule(v.customSchedule),
  })
    // vereinbarter Termin: der Nutzer weiss Bescheid, keine Erinnerung
    .filter(i => (i.status === 'due' || i.status === 'overdue') && !i.plannedAt)
}

export function buildReminders(input: {
  users: ReminderUser[]
  vehicles: ReminderVehicle[]
  maintenances: ReminderMaintenance[]
  settings: ReminderSetting[]
  now: Date
}): Reminder[] {
  const { users, vehicles, maintenances, settings, now } = input
  const today = now.toISOString().slice(0, 10)
  const byUser = new Map(settings.map(s => [s.creatorId, s]))
  const reminders: Reminder[] = []

  for (const user of users) {
    if (!user.email)
      continue
    if (byUser.get(user.id)?.emailReminders === false)
      continue
    const sprache = mailSprache(byUser.get(user.id))
    const t = erinnerungTexte[sprache]

    const blocks: string[] = []
    const entries: DueEntry[] = []
    const names: string[] = []
    // verkaufte Fahrzeuge gehören dem Nutzer nicht mehr, ihre Termine sind seine Sache nicht
    for (const v of activeVehicles(vehicles.filter(v => v.creatorId === user.id), today)) {
      const items = dueItems(v, maintenances)
      if (!items.length)
        continue
      names.push(vehicleName(v))
      entries.push(...items.map(i => ({ vehicleId: v.id, type: i.type, status: i.status })))
      const head = [vehicleName(v), v.licensePlate, v.mileage ? `${formatNumber(v.mileage, 0, sprache)} km` : ''].filter(Boolean).join(' · ')
      blocks.push([head, ...items.map(i => itemLine(i, sprache))].join('\n'))
    }
    if (!entries.length)
      continue

    const n = entries.length
    const subject = t.faellig.betreff(n, names.length === 1 ? names[0]! : '')
    const text = [
      t.hallo,
      '',
      t.faellig.intro(n, names.length),
      '',
      blocks.join('\n\n'),
      '',
      // Ein Fahrzeug: direkt zu seinem Abschnitt; mehrere: zur Fälligkeitsliste oben im Dashboard
      `${t.faellig.details} ${APP_URL}/dashboard${names.length === 1 ? `#fahrzeug-${entries[0]!.vehicleId}` : ''}`,
      '',
      t.faellig.hinweis,
      '',
      t.fragen(APP_URL),
      '',
      t.signatur,
    ].join('\n')

    reminders.push({ userId: user.id, email: user.email, subject, text, key: reminderKey(entries), entries })
  }
  return reminders
}

/** Resend-Nutzlast: Text plus HTML-Fassung, sonst zieht Outlook die Zeilen zusammen */
export function resendPayload(mail: { from: string, replyTo: string, to: string, subject: string, text: string }) {
  return { from: mail.from, to: [mail.to], reply_to: mail.replyTo, subject: mail.subject, text: mail.text, html: textToHtml(mail.text) }
}

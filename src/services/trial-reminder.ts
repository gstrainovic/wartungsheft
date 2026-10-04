/**
 * Anstoss vor Ende der Testzeit: in der App ein Hinweis in der letzten Woche, dazu eine Mail sieben Tage vorher.
 * Reine Funktionen, damit Dashboard (`trialNotice`) und Server-Job (`buildTrialReminders`, scripts/reminders.ts)
 * dieselbe Regel nutzen. Der Zustand der Testzeit kommt aus dem AI-Proxy (`trial.ts`), die Abos stehen in der
 * Entität `subscriptions`.
 */
import type { ReminderSetting } from './reminders'
import { waehle } from '../lib/app-sprache'
import { formatDate } from '../lib/locale'
import erinnerungTexte from '../texte/app/erinnerung'
import { APP_URL, mailSprache } from './reminders'

/** Ab so vielen verbleibenden Tagen weist die App auf das Abo hin (Tag 23 von 30) */
export const NOTICE_DAYS_LEFT = 7

export interface TrialInfo {
  active: boolean
  daysLeft: number
  /** ISO-Datum des letzten Testtags */
  endsAt: string
}

/** Abo-Zeile aus InstantDB, wie der Proxy sie schreibt */
export interface TrialSubscription {
  userId: string
  status: string
  trialStartedAt?: string | null
}

export interface TrialReminder {
  userId: string
  email: string
  subject: string
  text: string
  /** Merker gegen Wiederholung: eine Mail pro Testzeit */
  key: string
}

/**
 * Hinweistext für die App, oder null solange die Testzeit noch lange läuft. Nach Ablauf bleibt der Hinweis stehen,
 * dann nennt er den Grund statt der Restzeit.
 */
export function trialNotice(trial: TrialInfo | null | undefined): string | null {
  if (!trial)
    return null
  const t = waehle(erinnerungTexte).hinweis
  if (!trial.active)
    return t.vorbei
  if (trial.daysLeft > NOTICE_DAYS_LEFT)
    return null
  return t.laeuft(trial.daysLeft, formatDate(trial.endsAt))
}

/** Verbleibende Tage einer Testzeit aus ihrem Beginn; dieselbe Rechnung wie `trialState` im AI-Proxy */
export function trialDaysLeft(trialStartedAt: string, now: Date, trialDays: number): number {
  const end = new Date(trialStartedAt).getTime() + trialDays * 86_400_000
  return Math.max(0, Math.ceil((end - now.getTime()) / 86_400_000))
}

/**
 * Eine Mail pro Nutzer, dessen Testzeit in sieben Tagen endet. Wer schon bestellt hat (Status nicht mehr `trial`)
 * oder die Mail bereits bekommen hat, wird übersprungen; Erinnerungen abbestellen schaltet auch diese Mail ab.
 */
export function buildTrialReminders(input: {
  users: { id: string, email?: string | null }[]
  subscriptions: TrialSubscription[]
  settings: ReminderSetting[]
  now: Date
  trialDays: number
}): TrialReminder[] {
  const { users, subscriptions, settings, now, trialDays } = input
  const byUser = new Map(settings.map(s => [s.creatorId, s]))
  const subs = new Map(subscriptions.map(s => [s.userId, s]))
  const reminders: TrialReminder[] = []

  for (const user of users) {
    if (!user.email)
      continue
    if (byUser.get(user.id)?.emailReminders === false)
      continue
    const sub = subs.get(user.id)
    if (!sub?.trialStartedAt || sub.status !== 'trial')
      continue
    const daysLeft = trialDaysLeft(sub.trialStartedAt, now, trialDays)
    if (daysLeft !== NOTICE_DAYS_LEFT)
      continue
    const key = `trial:${sub.trialStartedAt}`
    if (byUser.get(user.id)?.lastTrialNoticeKey === key)
      continue
    const endsAt = new Date(new Date(sub.trialStartedAt).getTime() + trialDays * 86_400_000).toISOString().slice(0, 10)
    const sprache = mailSprache(byUser.get(user.id))
    const t = erinnerungTexte[sprache]
    const datum = formatDate(endsAt, sprache)
    reminders.push({
      userId: user.id,
      email: user.email,
      key,
      subject: t.testzeit.betreff(datum),
      text: [
        t.hallo,
        '',
        t.testzeit.laeuft(NOTICE_DAYS_LEFT, datum),
        '',
        t.testzeit.danach,
        '',
        `${t.testzeit.bestellen} ${APP_URL}/settings`,
        '',
        t.testzeit.preise,
        '',
        t.fragen(APP_URL),
        '',
        t.signatur,
      ].join('\n'),
    })
  }
  return reminders
}

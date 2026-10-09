/**
 * Willkommensmail an neue Testkonten, persönlich im Namen von Goran (scripts/reminders.ts): am Tag nach der Anmeldung
 * (Tag 2 der Testzeit) Dank und die ersten Schritte; fehlt am Konto die Antwort auf die Herkunftsfrage der Anmeldung
 * (settings.herkunft), fragt eine zusätzliche Zeile danach. Ein verpasster Lauf wird bis Tag 7 nachgeholt. Einmal pro
 * Konto, Merker settings.welcomeMailAt. Versand nur mit dem Schalter WELCOME_MAILS=on (Standard aus, bis Goran die
 * Texte freigibt); sonst zeigt der Job nur an, wer fällig wäre.
 */
import type { ReminderSetting } from './reminders'
import type { TrialSubscription } from './trial-reminder'
import willkommenTexte from '../texte/app/willkommen'
import { mailSprache } from './reminders'

/** Tag der Testzeit für die Willkommensmail (Tag 1 = Tag der Anmeldung) */
export const WILLKOMMEN_TAG = 2
/** Letzter Tag, an dem eine verpasste Willkommensmail noch kommt */
export const WILLKOMMEN_BIS_TAG = 7

export type WelcomeSetting = ReminderSetting & {
  /** Zeitpunkt der gesendeten Willkommensmail, eine pro Konto */
  welcomeMailAt?: string
}

export interface WelcomeMail {
  userId: string
  email: string
  subject: string
  text: string
  /** enthält die Frage, wie das Konto auf Wartungsheft gestossen ist */
  mitHerkunftsfrage: boolean
}

/** Schalter für den Versand: nur `on` schaltet ein */
export function willkommenVersandAn(env: Record<string, string | undefined>): boolean {
  return env.WELCOME_MAILS === 'on'
}

/** Kalendertag in der Schweiz als YYYY-MM-DD */
function schweizerDatum(d: Date): string {
  return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' })
}

/** Tag der Testzeit nach Kalendertagen, 1 am Tag der Anmeldung (Schweizer Zeit) */
function kalenderTag(trialStartedAt: string, now: Date): number {
  const start = Date.parse(schweizerDatum(new Date(trialStartedAt)))
  const heute = Date.parse(schweizerDatum(now))
  return Math.round((heute - start) / 86_400_000) + 1
}

function mailText(sprache: keyof typeof willkommenTexte, mitFrage: boolean): string {
  const t = willkommenTexte[sprache]
  const teile = mitFrage ? [t.oben, '', t.herkunftsfrage, '', t.unten] : [t.oben, '', t.unten]
  return teile.join('\n')
}

/**
 * Fällige Willkommensmails: nur Konten in der Testzeit ohne Abo (Status `trial`), mit E-Mail, ohne abbestellte
 * Erinnerungen und ohne bereits gesendete Willkommensmail.
 */
export function buildWelcomeMails(input: {
  users: { id: string, email?: string | null }[]
  subscriptions: TrialSubscription[]
  settings: WelcomeSetting[]
  now: Date
}): WelcomeMail[] {
  const { users, subscriptions, settings, now } = input
  const byUser = new Map(settings.map(s => [s.creatorId, s]))
  const subs = new Map(subscriptions.map(s => [s.userId, s]))
  const mails: WelcomeMail[] = []

  for (const user of users) {
    const setting = byUser.get(user.id)
    if (!user.email || setting?.emailReminders === false || setting?.welcomeMailAt)
      continue
    const sub = subs.get(user.id)
    if (!sub?.trialStartedAt || sub.status !== 'trial')
      continue
    const tag = kalenderTag(sub.trialStartedAt, now)
    if (tag < WILLKOMMEN_TAG || tag > WILLKOMMEN_BIS_TAG)
      continue
    const sprache = mailSprache(setting)
    const mitHerkunftsfrage = !setting?.herkunft
    mails.push({
      userId: user.id,
      email: user.email,
      subject: willkommenTexte[sprache].betreff,
      text: mailText(sprache, mitHerkunftsfrage),
      mitHerkunftsfrage,
    })
  }
  return mails
}

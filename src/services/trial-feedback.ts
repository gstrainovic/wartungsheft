/**
 * Rückfragen an Testkonten, persönlich im Namen von Goran (scripts/reminders.ts): am Tag 21 der Testzeit Fragen zur
 * Erfahrung, am Tag nach Ende der Testzeit (Tag 31) eine Frage, falls kein Abo bestellt ist. Antwort per Reply,
 * kein Umfrage-Werkzeug. Versand nur mit dem Schalter TRIAL_FEEDBACK_MAILS=on (Standard aus, bis Goran die Texte
 * freigibt); sonst zeigt der Job nur an, wer fällig wäre.
 */
import type { ReminderSetting } from './reminders'
import type { TrialSubscription } from './trial-reminder'
import feedbackTexte from '../texte/app/feedback'
import { mailSprache } from './reminders'

/** Tag der Testzeit für die Fragen zur Erfahrung (Tag 1 = Tag des Beginns) */
export const FEEDBACK_TAG_MITTE = 21
/** Ein verpasster Lauf (Server aus, Fehler) wird so viele Tage lang nachgeholt, länger nicht */
export const FEEDBACK_NACHHOLEN_TAGE = 2

export type FeedbackArt = 'tag21' | 'tag31'

export interface FeedbackMail {
  userId: string
  email: string
  art: FeedbackArt
  subject: string
  text: string
  /** Merker gegen Wiederholung (settings.lastFeedbackKey), je Art und Testzeit */
  key: string
}

/** Schalter für den Versand: nur `on` schaltet ein */
export function feedbackVersandAn(env: Record<string, string | undefined>): boolean {
  return env.TRIAL_FEEDBACK_MAILS === 'on'
}

/** Tag der Testzeit, 1 am Tag des Beginns */
export function trialTag(trialStartedAt: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(trialStartedAt).getTime()) / 86_400_000) + 1
}

function artAmTag(tag: number, trialDays: number): FeedbackArt | null {
  const ende = trialDays + 1
  if (tag >= FEEDBACK_TAG_MITTE && tag <= FEEDBACK_TAG_MITTE + FEEDBACK_NACHHOLEN_TAGE)
    return 'tag21'
  if (tag >= ende && tag <= ende + FEEDBACK_NACHHOLEN_TAGE)
    return 'tag31'
  return null
}

/**
 * Fällige Rückfragen: nur Konten in der Testzeit ohne Abo (Status `trial`), mit E-Mail und ohne abbestellte
 * Erinnerungen; jede Mail einmal pro Testzeit.
 */
export function buildTrialFeedbackMails(input: {
  users: { id: string, email?: string | null }[]
  subscriptions: TrialSubscription[]
  settings: ReminderSetting[]
  now: Date
  trialDays: number
}): FeedbackMail[] {
  const { users, subscriptions, settings, now, trialDays } = input
  const byUser = new Map(settings.map(s => [s.creatorId, s]))
  const subs = new Map(subscriptions.map(s => [s.userId, s]))
  const mails: FeedbackMail[] = []

  for (const user of users) {
    const setting = byUser.get(user.id)
    if (!user.email || setting?.emailReminders === false)
      continue
    const sub = subs.get(user.id)
    if (!sub?.trialStartedAt || sub.status !== 'trial')
      continue
    const art = artAmTag(trialTag(sub.trialStartedAt, now), trialDays)
    if (!art)
      continue
    const key = `feedback-${art}:${sub.trialStartedAt}`
    if (setting?.lastFeedbackKey === key)
      continue
    const t = feedbackTexte[mailSprache(setting)][art]
    mails.push({ userId: user.id, email: user.email, art, key, subject: t.betreff, text: t.text })
  }
  return mails
}

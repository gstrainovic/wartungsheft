/**
 * Täglicher Erinnerungs-Job: liest Nutzer, Fahrzeuge, Wartungen, Abos und Einstellungen über die Admin-API von
 * InstantDB, baut pro Nutzer eine E-Mail mit fälligen und überfälligen Arbeiten (src/services/reminders.ts) sowie
 * sieben Tage vor Ende der Testzeit einen Anstoss zum Abo (src/services/trial-reminder.ts) und sendet beides
 * über Resend. Dazu Rückfragen an Testkonten am Tag 21 und 31 (src/services/trial-feedback.ts, nur mit
 * TRIAL_FEEDBACK_MAILS=on). Neue Anmeldungen meldet er gebündelt an SIGNUP_NOTICE_TO (src/services/signup-notice.ts).
 * Gesendete Erinnerungen werden im Dokument `settings` des Nutzers vermerkt (lastReminderKey/At), damit
 * dieselbe Erinnerung erst nach 30 Tagen wiederkommt.
 *
 * Läuft auf der Instanz als Container (deploy/docker-compose.yml, Dienst `reminders`, Profil `jobs`), gebündelt mit
 * `npm run build:reminders` nach deploy/reminders.mjs. Umgebung: INSTANT_API_URI, INSTANT_APP_ID, INSTANT_ADMIN_TOKEN,
 * RESEND_TOKEN, optional REMINDER_FROM, TRIAL_FEEDBACK_MAILS, FEEDBACK_MAIL_FROM, FEEDBACK_TO. Optionen: --dry-run
 * (nichts senden, nichts schreiben, zeigt auch die Rückfragen bei ausgeschaltetem Versand), --only=<email>.
 */
import { randomUUID } from 'node:crypto'
import process from 'node:process'
import { TRIAL_DAYS } from '@strainovic/ai-proxy/trial'
import { buildReminders, resendPayload, shouldSend } from '../src/services/reminders'
import { buildSignupNotice } from '../src/services/signup-notice'
import { buildTrialFeedbackMails, feedbackVersandAn } from '../src/services/trial-feedback'
import { buildTrialReminders } from '../src/services/trial-reminder'

const API = process.env.INSTANT_API_URI ?? ''
const APP_ID = process.env.INSTANT_APP_ID ?? ''
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN ?? ''
const RESEND_TOKEN = process.env.RESEND_TOKEN ?? ''
const FROM = process.env.REMINDER_FROM ?? 'Wartungsheft <erinnerung@wartungsheft.ch>'
/** Antworten landen im Postfach info@wartungsheft.ch (Infomaniak), nicht bei Resend */
const REPLY_TO = process.env.REMINDER_REPLY_TO ?? 'info@wartungsheft.ch'
/** Empfänger der Meldung über neue Anmeldungen (der Betreiber) */
const SIGNUP_NOTICE_TO = process.env.SIGNUP_NOTICE_TO ?? 'info@wartungsheft.ch'
/** Rückfragen an Testkonten: aus, bis Goran die Texte freigibt (find-jobs/freigaben/wartungsheft-feedback-mails.md) */
const FEEDBACK_ON = feedbackVersandAn(process.env)
const FEEDBACK_FROM = process.env.FEEDBACK_MAIL_FROM || 'Goran Strainovic <info@wartungsheft.ch>'
/** Antworten gehen an Goran: dasselbe Postfach wie die Rückmeldungen aus der App */
const FEEDBACK_REPLY_TO = process.env.FEEDBACK_TO || 'info@wartungsheft.ch'

const dryRun = process.argv.includes('--dry-run')
const only = process.argv.find(a => a.startsWith('--only='))?.slice('--only='.length)

function log(msg: string): void {
  console.log(`${new Date().toISOString()} ${msg}`)
}

async function admin(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${API}/admin/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'App-Id': APP_ID, 'Authorization': `Bearer ${ADMIN_TOKEN}` },
    body: JSON.stringify(body),
  })
  if (!res.ok)
    throw new Error(`Admin-API ${path}: ${res.status} ${await res.text()}`)
  return res.json()
}

async function sendMail(to: string, subject: string, text: string, from = FROM, replyTo = REPLY_TO): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(resendPayload({ from, replyTo, to, subject, text })),
  })
  if (!res.ok)
    throw new Error(`Resend: ${res.status} ${await res.text()}`)
}

async function main(): Promise<void> {
  for (const [name, value] of Object.entries({ INSTANT_API_URI: API, INSTANT_APP_ID: APP_ID, INSTANT_ADMIN_TOKEN: ADMIN_TOKEN })) {
    if (!value)
      throw new Error(`${name} fehlt`)
  }
  if (!RESEND_TOKEN && !dryRun)
    throw new Error('RESEND_TOKEN fehlt')

  const now = new Date()
  const { $users = [], vehicles = [], maintenances = [], settings = [], subscriptions = [] } = await admin('query', {
    query: { $users: {}, vehicles: {}, maintenances: {}, settings: {}, subscriptions: {} },
  })
  log(`${$users.length} Nutzer, ${vehicles.length} Fahrzeuge, ${maintenances.length} Wartungen, ${settings.length} Einstellungen`)

  const reminders = buildReminders({ users: $users, vehicles, maintenances, settings, now })
    .filter(r => !only || r.email === only)
  const byUser = new Map<string, any>(settings.map((s: any) => [s.creatorId, s]))

  let sent = 0
  for (const r of reminders) {
    const setting = byUser.get(r.userId)
    if (!shouldSend(setting, r.key, now)) {
      log(`${r.email}: unverändert seit ${setting?.lastReminderAt}, keine Mail`)
      continue
    }
    if (dryRun) {
      log(`[dry-run] ${r.email}: ${r.subject}\n${r.text}\n`)
      continue
    }
    await sendMail(r.email, r.subject, r.text)
    const id = setting?.id ?? randomUUID()
    // neu angelegtes Dokument merken, sonst legen die späteren Schritte ein zweites an
    byUser.set(r.userId, { ...setting, id, creatorId: r.userId })
    await admin('transact', {
      steps: [['update', 'settings', id, {
        creatorId: r.userId,
        lastReminderAt: now.toISOString(),
        lastReminderKey: r.key,
        updatedAt: now.toISOString(),
      }]],
    })
    sent++
    log(`${r.email}: ${r.subject}`)
  }
  log(`${sent} Erinnerung(en) gesendet, ${reminders.length - sent} übersprungen`)

  // Anstoss vor Ende der Testzeit: eine Mail pro Testzeit, sieben Tage vor Schluss
  const trialMails = buildTrialReminders({ users: $users, subscriptions, settings, now, trialDays: TRIAL_DAYS })
    .filter(r => !only || r.email === only)
  let trialSent = 0
  for (const r of trialMails) {
    if (dryRun) {
      log(`[dry-run] ${r.email}: ${r.subject}\n${r.text}\n`)
      continue
    }
    await sendMail(r.email, r.subject, r.text)
    const setting = byUser.get(r.userId)
    const id = setting?.id ?? randomUUID()
    byUser.set(r.userId, { ...setting, id, creatorId: r.userId })
    await admin('transact', {
      steps: [['update', 'settings', id, {
        creatorId: r.userId,
        lastTrialNoticeKey: r.key,
        updatedAt: now.toISOString(),
      }]],
    })
    trialSent++
    log(`${r.email}: ${r.subject}`)
  }
  log(`${trialSent} Testzeit-Hinweis(e) gesendet`)

  // Rückfragen an Testkonten (Tag 21 und Tag 31), persönlich von Goran; Versand nur mit TRIAL_FEEDBACK_MAILS=on
  const feedbackMails = buildTrialFeedbackMails({ users: $users, subscriptions, settings, now, trialDays: TRIAL_DAYS })
    .filter(r => !only || r.email === only)
  let feedbackSent = 0
  for (const r of feedbackMails) {
    if (dryRun) {
      log(`[dry-run] ${r.email} (${r.art}, von ${FEEDBACK_FROM}): ${r.subject}\n${r.text}\n`)
      continue
    }
    if (!FEEDBACK_ON) {
      log(`${r.email}: Rückfrage ${r.art} fällig, Versand aus (TRIAL_FEEDBACK_MAILS)`)
      continue
    }
    await sendMail(r.email, r.subject, r.text, FEEDBACK_FROM, FEEDBACK_REPLY_TO)
    const setting = byUser.get(r.userId)
    const id = setting?.id ?? randomUUID()
    byUser.set(r.userId, { ...setting, id, creatorId: r.userId })
    await admin('transact', {
      steps: [['update', 'settings', id, {
        creatorId: r.userId,
        lastFeedbackKey: r.key,
        updatedAt: now.toISOString(),
      }]],
    })
    feedbackSent++
    log(`${r.email}: ${r.subject}`)
  }
  log(`${feedbackSent} Rückfrage(n) an Testkonten gesendet${FEEDBACK_ON ? '' : ' (Versand aus)'}`)

  // Meldung an den Betreiber: wer sich seit dem letzten Lauf angemeldet hat
  const notice = only ? null : buildSignupNotice({ users: $users, settings, now })
  if (!notice) {
    log('keine neuen Anmeldungen')
  }
  else if (dryRun) {
    log(`[dry-run] ${SIGNUP_NOTICE_TO}: ${notice.subject}\n${notice.text}\n`)
  }
  else {
    await sendMail(SIGNUP_NOTICE_TO, notice.subject, notice.text)
    await admin('transact', {
      steps: notice.userIds.map(userId => ['update', 'settings', byUser.get(userId)?.id ?? randomUUID(), {
        creatorId: userId,
        signupNoticeAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }]),
    })
    log(`${SIGNUP_NOTICE_TO}: ${notice.subject}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

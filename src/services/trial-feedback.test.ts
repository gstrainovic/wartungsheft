import { describe, expect, it } from 'vitest'
import feedbackTexte from '../texte/app/feedback'
import { buildTrialFeedbackMails, feedbackVersandAn } from './trial-feedback'

const TRIAL_DAYS = 30
const users = [{ id: 'u1', email: 'a@b.ch' }]
const START = '2026-09-10T18:30:00.000Z'

/** Lauf des Jobs (07:00 UTC) am Tag `tag` der Testzeit; Tag 1 = Tag des Beginns */
function mails(tag: number, opts: { status?: string, settings?: any[], users?: any[] } = {}) {
  const now = new Date(new Date(START).getTime() + (tag - 1) * 86_400_000 + 12 * 3_600_000)
  return buildTrialFeedbackMails({
    users: opts.users ?? users,
    subscriptions: [{ userId: 'u1', status: opts.status ?? 'trial', trialStartedAt: START }],
    settings: opts.settings ?? [],
    now,
    trialDays: TRIAL_DAYS,
  })
}

describe('buildTrialFeedbackMails', () => {
  it('fragt am Tag 21 nach der Erfahrung', () => {
    const [mail] = mails(21)
    expect(mail!.email).toBe('a@b.ch')
    expect(mail!.subject).toBe(feedbackTexte.de.tag21.betreff)
    expect(mail!.text).toBe(feedbackTexte.de.tag21.text)
  })

  it('listet die freiwilligen Angaben untereinander, je Sprache vier Zeilen mit Strich', () => {
    for (const sprache of ['de', 'fr', 'it', 'en'] as const) {
      const zeilen = feedbackTexte[sprache].tag21.text.split('\n').filter(z => z.startsWith('- '))
      expect(zeilen, sprache).toHaveLength(4)
      for (const z of zeilen) expect(z.endsWith('?'), `${sprache}: ${z}`).toBe(true)
    }
  })

  it('siezt auf Französisch wie die App, in beiden Mails', () => {
    for (const mail of ['tag21', 'tag31'] as const) {
      const { betreff, text } = feedbackTexte.fr[mail]
      const ganz = `${betreff}\n${text}`
      // Wortgrenzen über Buchstaben statt \b, sonst gilt «êtes» als «tes»
      expect(ganz, mail).not.toMatch(/(?<!\p{L})(tu|te|ton|ta|tes|toi|utilises)(?!\p{L})|(?<!\p{L})t'/iu)
      expect(ganz, mail).toMatch(/\bvous\b/i)
    }
  })

  it('nennt am Tag 31 keinen Tag des Testendes, weil die Mail bis zwei Tage später kommen kann', () => {
    for (const sprache of ['de', 'fr', 'it', 'en'] as const) {
      const { betreff, text } = feedbackTexte[sprache].tag31
      expect(`${betreff}\n${text}`, sprache).not.toMatch(/\b(gestern|hier|ieri|yesterday)\b/i)
    }
  })

  it('fragt am Tag 31 nach dem, was überzeugt hätte', () => {
    const [mail] = mails(31)
    expect(mail!.subject).toBe(feedbackTexte.de.tag31.betreff)
    expect(mail!.text).toBe(feedbackTexte.de.tag31.text)
  })

  it('holt einen verpassten Lauf in den zwei Folgetagen nach, später nicht mehr', () => {
    expect(mails(23)).toHaveLength(1)
    expect(mails(33)).toHaveLength(1)
    for (const tag of [1, 20, 24, 30, 34, 60])
      expect(mails(tag), `Tag ${tag}`).toEqual([])
  })

  it('nicht an Konten mit Abo, auch nicht am Tag 31', () => {
    expect(mails(21, { status: 'active' })).toEqual([])
    expect(mails(31, { status: 'active' })).toEqual([])
    expect(mails(31, { status: 'past_due' })).toEqual([])
  })

  it('jede Mail nur einmal', () => {
    const [tag21] = mails(21)
    expect(mails(22, { settings: [{ creatorId: 'u1', lastFeedbackKey: tag21!.key }] })).toEqual([])
    const [tag31] = mails(31, { settings: [{ creatorId: 'u1', lastFeedbackKey: tag21!.key }] })
    expect(tag31!.key).not.toBe(tag21!.key)
    expect(mails(32, { settings: [{ creatorId: 'u1', lastFeedbackKey: tag31!.key }] })).toEqual([])
  })

  it('schreibt in der Sprache des Kontos', () => {
    const [mail] = mails(21, { settings: [{ creatorId: 'u1', sprache: 'fr' }] })
    expect(mail!.subject).toBe(feedbackTexte.fr.tag21.betreff)
    expect(mail!.text).toBe(feedbackTexte.fr.tag21.text)
  })

  it('nicht an abbestellte Erinnerungen und nicht ohne E-Mail', () => {
    expect(mails(21, { settings: [{ creatorId: 'u1', emailReminders: false }] })).toEqual([])
    expect(mails(21, { users: [{ id: 'u1', email: null }] })).toEqual([])
  })
})

describe('feedbackVersandAn', () => {
  it('ist ohne Schalter aus', () => {
    expect(feedbackVersandAn({})).toBe(false)
    expect(feedbackVersandAn({ TRIAL_FEEDBACK_MAILS: '' })).toBe(false)
    expect(feedbackVersandAn({ TRIAL_FEEDBACK_MAILS: 'off' })).toBe(false)
  })

  it('geht nur mit «on» an', () => {
    expect(feedbackVersandAn({ TRIAL_FEEDBACK_MAILS: 'on' })).toBe(true)
  })
})

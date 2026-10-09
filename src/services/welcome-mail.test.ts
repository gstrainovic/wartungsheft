import { describe, expect, it } from 'vitest'
import willkommenTexte from '../texte/app/willkommen'
import { buildWelcomeMails, willkommenVersandAn } from './welcome-mail'

const users = [{ id: 'u1', email: 'a@b.ch' }]
const START = '2026-10-08T08:53:13.884Z'
const SPRACHEN = ['de', 'fr', 'it', 'en'] as const

/** Lauf des Jobs (07:00 UTC) am Tag `tag` der Testzeit; Tag 1 = Tag der Anmeldung */
function mails(tag: number, opts: { status?: string, settings?: any[], users?: any[], subscriptions?: any[] } = {}) {
  const now = new Date(`${START.slice(0, 10)}T07:00:00.000Z`)
  now.setUTCDate(now.getUTCDate() + tag - 1)
  return buildWelcomeMails({
    users: opts.users ?? users,
    subscriptions: opts.subscriptions ?? [{ userId: 'u1', status: opts.status ?? 'trial', trialStartedAt: START }],
    settings: opts.settings ?? [],
    now,
  })
}

const HERKUNFTSFRAGE_DE = 'Kurze Frage: Wie bist du auf Wartungsheft gestossen?'

describe('buildWelcomeMails', () => {
  it('begrüsst am Tag nach der Anmeldung, im Namen von Goran', () => {
    expect(mails(1)).toEqual([])
    const [mail] = mails(2)
    expect(mail!.email).toBe('a@b.ch')
    expect(mail!.subject).toBe(willkommenTexte.de.betreff)
    expect(mail!.text).toContain('Goran')
  })

  it('fragt nach der Herkunft, wenn das Konto keine Angabe hat', () => {
    const [mail] = mails(2, { settings: [{ creatorId: 'u1' }] })
    expect(mail!.text).toContain(HERKUNFTSFRAGE_DE)
    expect(mail!.mitHerkunftsfrage).toBe(true)
  })

  it('fragt nicht nach der Herkunft, wenn das Konto sie schon nennt', () => {
    const [mail] = mails(2, { settings: [{ creatorId: 'u1', herkunft: 'google' }] })
    expect(mail!.text).not.toContain(HERKUNFTSFRAGE_DE)
    expect(mail!.text).not.toContain('gestossen')
    expect(mail!.mitHerkunftsfrage).toBe(false)
  })

  it('ohne Herkunftsfrage keine doppelten Leerzeilen, mit Frage als eigener Absatz', () => {
    for (const sprache of SPRACHEN) {
      const ohne = mails(2, { settings: [{ creatorId: 'u1', sprache, herkunft: 'google' }] })[0]!.text
      const mit = mails(2, { settings: [{ creatorId: 'u1', sprache }] })[0]!.text
      expect(ohne, sprache).not.toMatch(/\n\n\n/)
      expect(mit, sprache).not.toMatch(/\n\n\n/)
      expect(mit, sprache).toContain(`\n\n${willkommenTexte[sprache].herkunftsfrage}\n`)
    }
  })

  it('schreibt in der Sprache des Kontos', () => {
    for (const sprache of SPRACHEN) {
      const [mail] = mails(2, { settings: [{ creatorId: 'u1', sprache }] })
      expect(mail!.subject, sprache).toBe(willkommenTexte[sprache].betreff)
      expect(mail!.text, sprache).toContain(willkommenTexte[sprache].herkunftsfrage)
    }
  })

  it('zählt Kalendertage: Anmeldung am Vormittag, Lauf am nächsten Morgen ist Tag 2', () => {
    // Anmeldung 08.10. 08:53 UTC, Lauf 09.10. 07:00 UTC: noch keine 24 Stunden, aber der Tag danach
    expect(mails(2)[0]!.email).toBe('a@b.ch')
  })

  it('kommt nur einmal pro Konto', () => {
    expect(mails(3, { settings: [{ creatorId: 'u1', welcomeMailAt: '2026-10-09T07:00:00.000Z' }] })).toEqual([])
  })

  it('holt die Mail bis Tag 7 der Testzeit nach, danach nicht mehr', () => {
    for (const tag of [2, 3, 7])
      expect(mails(tag), `Tag ${tag}`).toHaveLength(1)
    for (const tag of [8, 21, 31])
      expect(mails(tag), `Tag ${tag}`).toEqual([])
  })

  it('nicht an Konten mit Abo, mit abbestellten Erinnerungen oder ohne E-Mail', () => {
    expect(mails(2, { status: 'active' })).toEqual([])
    expect(mails(2, { status: 'past_due' })).toEqual([])
    expect(mails(2, { settings: [{ creatorId: 'u1', emailReminders: false }] })).toEqual([])
    expect(mails(2, { users: [{ id: 'u1', email: null }] })).toEqual([])
    expect(mails(2, { users: [{ id: 'u1' }] })).toEqual([])
  })

  it('nicht an Konten ohne begonnene Testzeit', () => {
    expect(mails(2, { subscriptions: [] })).toEqual([])
  })
})

describe('texte der Willkommensmail', () => {
  it('gibt es in jeder Sprache mit Herkunftsfrage, Antwort-Aufforderung und Abmeldezeile', () => {
    for (const sprache of SPRACHEN) {
      const t = willkommenTexte[sprache]
      const ganz = [t.oben, t.herkunftsfrage, t.unten].join('\n')
      expect(t.betreff, sprache).toMatch(/Wartungsheft/)
      expect(t.herkunftsfrage, sprache).toMatch(/Wartungsheft.*\?$/)
      expect(ganz, sprache).toContain('https://wartungsheft.ch/settings')
      expect(ganz, sprache).not.toMatch(/CHF|\babo\b|abonnement|abbonamento|subscription|prezz|Preis|prix|price/i)
    }
  })

  it('siezt auf Französisch wie die App', () => {
    const t = willkommenTexte.fr
    const ganz = [t.betreff, t.oben, t.herkunftsfrage, t.unten].join('\n')
    expect(ganz).not.toMatch(/(?<!\p{L})(tu|te|ton|ta|tes|toi)(?!\p{L})|(?<!\p{L})t'/iu)
    expect(ganz).toMatch(/\bvous\b/i)
  })

  it('nennt kein Datum der Anmeldung, weil die Mail bis Tag 7 nachgeholt wird', () => {
    for (const sprache of SPRACHEN) {
      const t = willkommenTexte[sprache]
      expect([t.betreff, t.oben, t.unten].join('\n'), sprache).not.toMatch(/\b(gestern|hier|ieri|yesterday)\b/i)
    }
  })
})

describe('willkommenVersandAn', () => {
  it('ist ohne Schalter aus', () => {
    expect(willkommenVersandAn({})).toBe(false)
    expect(willkommenVersandAn({ WELCOME_MAILS: '' })).toBe(false)
    expect(willkommenVersandAn({ WELCOME_MAILS: 'off' })).toBe(false)
    expect(willkommenVersandAn({ TRIAL_FEEDBACK_MAILS: 'on' })).toBe(false)
  })

  it('geht nur mit «on» an', () => {
    expect(willkommenVersandAn({ WELCOME_MAILS: 'on' })).toBe(true)
  })
})

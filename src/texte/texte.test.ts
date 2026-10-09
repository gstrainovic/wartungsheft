import { describe, expect, it } from 'vitest'
import { PRAEFIXE } from '../lib/sprache'
import angebot from './angebot'
import anlagen from './anlagen'
import hilfe from './hilfe'
import layout from './layout'
import login from './login'
import preise from './preise'
import start from './start'

/** Form eines Textobjekts: Schlüssel, Arraylängen und Typen, ohne die Texte selbst */
function form(value: unknown): unknown {
  if (Array.isArray(value))
    return value.map(form)
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, form(v)]))
  return typeof value
}

const TEXTE = { angebot, anlagen, hilfe, layout, login, preise, start }

describe('texte der öffentlichen Seiten', () => {
  for (const [name, texte] of Object.entries(TEXTE)) {
    it(`${name}: jede Sprache hat dieselbe Form wie Deutsch und eigene Texte`, () => {
      for (const sprache of PRAEFIXE) {
        expect(form(texte[sprache]), `${name}.${sprache}`).toEqual(form(texte.de))
        expect(texte[sprache], `${name}.${sprache}`).not.toBe(texte.de)
      }
    })
  }
})

const raw = (dateien: Record<string, unknown>) => dateien as Record<string, string>
const SEITEN_QUELLE = raw(import.meta.glob('../pages/*.vue', { query: '?raw', import: 'default', eager: true }))
const UEBERSETZUNGEN = raw(import.meta.glob('./*/*.vue', { query: '?raw', import: 'default', eager: true }))
const RATGEBER = raw(import.meta.glob('../../content/ratgeber/**/*.md', { query: '?raw', import: 'default', eager: true }))

function zaehle(html: string, tag: string): number {
  return html.match(new RegExp(`<${tag}[\\s>]`, 'g'))?.length ?? 0
}

/** Deutscher Inhalt der Seite: der `<main v-else>`-Block */
function deutsch(seite: string): string {
  return SEITEN_QUELLE[`../pages/${seite}`]!.split('<main v-else')[1]!.split('</main>')[0]!
}

describe('übersetzte Seiten (src/texte/<seite>/<sprache>.vue)', () => {
  const SEITEN = { agb: 'AgbPage.vue', datenschutz: 'DatenschutzPage.vue', impressum: 'ImpressumPage.vue', hilfe: 'HilfePage.vue' }
  for (const [ordner, seite] of Object.entries(SEITEN)) {
    it(`${ordner}: gleiche Gliederung wie Deutsch, interne Links in der eigenen Sprache`, () => {
      const de = deutsch(seite)
      for (const sprache of PRAEFIXE) {
        const html = UEBERSETZUNGEN[`./${ordner}/${sprache}.vue`]!
        for (const tag of ['h1', 'h2', 'table', 'ul'])
          expect(zaehle(html, tag), `${ordner}/${sprache} <${tag}>`).toBe(zaehle(de, tag))
        // Einzige Ausnahme: der Verweis auf die massgebende deutsche Fassung
        const links = [...html.matchAll(/to="(\/[^"]*)"/g)].map(m => m[1]!)
        for (const link of links.filter(l => l !== `/${ordner}`))
          expect(link, `${ordner}/${sprache}`).toMatch(new RegExp(`^/${sprache}(/|$)`))
      }
    })
  }

  it('datenschutz erklärt Herkunftsfrage und Feedback-Mails in jeder Sprache, mit gleicher Unterteilung', () => {
    const TITEL = {
      de: ['Herkunftsfrage bei der Anmeldung', 'Feedback-Mails während der Testzeit'],
      fr: ['Question sur l’origine lors de la connexion', 'E-mails de retour pendant la période d’essai'],
      it: ['Domanda sulla provenienza all\'accesso', 'E-mail di riscontro durante il periodo di prova'],
      en: ['Origin question at sign-in', 'Feedback emails during the trial'],
    }
    const de = deutsch('DatenschutzPage.vue')
    for (const [sprache, titel] of Object.entries(TITEL)) {
      const html = sprache === 'de' ? de : UEBERSETZUNGEN[`./datenschutz/${sprache}.vue`]!
      for (const t of titel)
        expect(html, `datenschutz/${sprache}`).toMatch(new RegExp(`<h3>3\\.\\d ${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h3>`))
      expect(zaehle(html, 'h3'), `datenschutz/${sprache} <h3>`).toBe(zaehle(de, 'h3'))
    }
  })

  it('datenschutz nennt die Willkommensmail nach der Anmeldung in jeder Sprache', () => {
    const WORT = { de: /Willkommensmail/, fr: /bienvenue/i, it: /benvenuto/i, en: /welcome email/i }
    for (const [sprache, wort] of Object.entries(WORT)) {
      const html = sprache === 'de' ? deutsch('DatenschutzPage.vue') : UEBERSETZUNGEN[`./datenschutz/${sprache}.vue`]!
      expect(html, `datenschutz/${sprache}`).toMatch(wort)
    }
  })

  it('rechtstexte nennen die deutsche Fassung als massgebend', () => {
    for (const ordner of ['agb', 'datenschutz', 'impressum']) {
      for (const sprache of PRAEFIXE)
        expect(UEBERSETZUNGEN[`./${ordner}/${sprache}.vue`], `${ordner}/${sprache}`).toContain(`to="/${ordner}"`)
    }
  })
})

describe('ratgeber-übersetzungen', () => {
  const PREFIX = '../../content/ratgeber/'
  const artikel = Object.keys(RATGEBER).map(p => p.slice(PREFIX.length)).filter(p => !p.includes('/'))

  it('gibt es für jeden Artikel in jeder Sprache, mit gleicher Gliederung', () => {
    expect(artikel.length).toBeGreaterThan(0)
    for (const datei of artikel) {
      const de = RATGEBER[PREFIX + datei]!
      for (const sprache of PRAEFIXE) {
        const text = RATGEBER[`${PREFIX}${sprache}/${datei}`]
        expect(text, `${sprache}/${datei}`).toBeDefined()
        expect(text!.match(/^## /gm)?.length, `${sprache}/${datei}`).toBe(de.match(/^## /gm)?.length)
        for (const [, link] of text!.matchAll(/\]\((\/[^)]*)\)/g))
          expect(link, `${sprache}/${datei}`).toMatch(new RegExp(`^/${sprache}/`))
      }
    }
  })
})

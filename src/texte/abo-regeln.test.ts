import { describe, expect, it } from 'vitest'
import { SPRACHEN } from '../lib/sprache'
import bestellung from './app/bestellung'
import einstellungen from './app/einstellungen'
import preise from './preise'

/**
 * Abo-Regeln (find-jobs/akquise/abo-regeln.md) in Bestelldialog, Einstellungen und AGB: verbindlich erst mit der
 * Zahlung, wer nicht zahlt, muss nichts tun; nichts verlängert sich von selbst; kein Kündigen, keine Mahnung, keine
 * Sperre als Drohung. Die AGB siezen auf Französisch, alles andere duzt.
 */
type Code = 'de' | 'fr' | 'it' | 'en'
const CODES = SPRACHEN.map(s => s.code) as Code[]

const NICHTS_TUN: Record<Code, RegExp> = {
  de: /musst du nichts tun/,
  fr: /n’a(s|vez) rien à faire/,
  it: /non devi fare nulla/,
  en: /you don.t need to do anything/,
}

/** Sätze der alten Regeln (automatische Verlängerung, Kündigen, Mahnung, Zahlungsverzug), die nirgends mehr stehen */
const VERBOTEN: Record<Code, RegExp[]> = {
  de: [/verlängert sich (automatisch|jeweils|jährlich)/i, /kündig/i, /kündbar/i, /Mahnung/, /Zahlungsverzug/, /kostenpflichtig/i],
  fr: [/se renouvelle/i, /résili/i, /un rappel/i, /retards? de paiement/i, /payant\b/i],
  it: [/si rinnova/i, /disd/i, /sollecito/i, /ritard[io] di pagamento/i, /a pagamento\b/i],
  en: [/renews/i, /cancel(?!led)/i, /terminat/i, /a reminder/i, /late payment/i, /obligation to pay/i],
}

const KEINE_WEITEREN_RECHNUNGEN: Record<Code, RegExp> = {
  de: /Keine weiteren Rechnungen/,
  fr: /Plus aucune facture/,
  it: /Nessun.altra fattura/,
  en: /No further invoices/,
}

const raw = (dateien: Record<string, unknown>) => dateien as Record<string, string>
const AGB_SEITE = raw(import.meta.glob('../pages/AgbPage.vue', { query: '?raw', import: 'default', eager: true }))['../pages/AgbPage.vue']!
/** Deutscher Inhalt: der `<main v-else>`-Block */
const AGB_DE = AGB_SEITE.split('<main v-else')[1]!.split('</main>')[0]!
const AGB_UEBERSETZT = raw(import.meta.glob('./agb/*.vue', { query: '?raw', import: 'default', eager: true }))

function agb(code: Code): string {
  return code === 'de' ? AGB_DE : AGB_UEBERSETZT[`./agb/${code}.vue`]!
}

function keineVerbote(text: string, code: Code, wo: string) {
  for (const muster of VERBOTEN[code])
    expect(text, `${wo} ${code}: ${muster}`).not.toMatch(muster)
}

describe('abo-regeln in den Texten', () => {
  for (const code of CODES) {
    it(`${code}: Bestellbedingungen sagen «ohne Zahlung nichts tun», der Knopf fordert eine Rechnung an`, () => {
      const t = bestellung[code]
      expect(t.bedingungen).toMatch(NICHTS_TUN[code])
      keineVerbote(t.bedingungen, code, 'bestellung.bedingungen')
      keineVerbote(t.bestellen, code, 'bestellung.bestellen')
    })

    it(`${code}: Einstellungen nennen keine automatische Verlängerung und kein Kündigen`, () => {
      const t = einstellungen[code].abo
      keineVerbote(t.laeuftBis('X'), code, 'einstellungen.laeuftBis')
      keineVerbote(t.gekuendigtBis('X'), code, 'einstellungen.gekuendigtBis')
      expect(t.gekuendigtBis('X')).toMatch(KEINE_WEITEREN_RECHNUNGEN[code])
    })

    it(`${code}: Preisseite verspricht kein Kündigen und keine Verlängerung von selbst`, () => {
      const t = preise[code]
      keineVerbote(t.inbegriffen.join('\n'), code, 'preise.inbegriffen')
      keineVerbote([t.privatIntro(5), t.betriebMonat('X'), t.testzeit].join('\n'), code, 'preise')
    })

    it(`${code}: AGB sagen «ohne Zahlung nichts tun», ohne Kündigen, Mahnung, Sperre oder Verlängerung von selbst`, () => {
      const text = agb(code)
      expect(text).toMatch(NICHTS_TUN[code])
      keineVerbote(text, code, 'agb')
    })
  }
})

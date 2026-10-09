import type { Component } from 'vue'
import { BUSINESS_VEHICLE_YEARLY_CHF, PRIVATE_YEARLY_CHF } from '@strainovic/ai-proxy/plans'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import { formatCurrency } from '../lib/locale'
import { PAGE_META_SPRACHEN } from '../lib/page-meta'
import { parseArticle, renderArticlePage, renderIndexPage } from '../lib/ratgeber'
import { NBSP, sichtbarerText, verstoesse } from './franzoesisch'
import hilfe from './hilfe'

/**
 * Alle französischen Texte gegen die französische Typografie: NBSP vor : ; ? ! » % und nach «, typografischer
 * Apostroph, Zahlen und Währung mit NBSP, Glossar; öffentliche Seiten siezen, die App duzt bewusst.
 */
type Texte = Record<string, unknown>
/**
 * Beträge aus formatCurrency bleiben bewusst im Schweizer Format (CHF 1'234.50, src/lib/locale.ts, Skill
 * texte-und-sprachen); sie sind hier ausgenommen, statische Beträge im Text nicht.
 */
const BETRAEGE = [PRIVATE_YEARLY_CHF, BUSINESS_VEHICLE_YEARLY_CHF].map(b => formatCurrency(b, 'CHF', 'fr'))
const OEFFENTLICH = import.meta.glob(['./*.ts', '!./*.test.ts', '!./franzoesisch.ts', '!./deutsch-finden.ts'], { import: 'default', eager: true }) as Record<string, Texte>
const APP = import.meta.glob(['./app/*.ts'], { import: 'default', eager: true }) as Record<string, Texte>
const SEITEN = import.meta.glob('./*/fr.vue', { import: 'default', eager: true }) as Record<string, Component>
const RATGEBER = import.meta.glob('../../content/ratgeber/fr/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

/** Alle Texte eines Objekts mit Pfad; Funktionen (Mehrzahl, Platzhalter) werden mit Beispielwerten aufgerufen */
function blaetter(value: unknown, pfad = ''): [string, string][] {
  if (typeof value === 'function') {
    return [1, 2].flatMap(n => blaetter((value as (...a: unknown[]) => unknown)(n, 'X', 'Y', 'Z'), `${pfad}(${n})`))
  }
  if (Array.isArray(value))
    return value.flatMap((v, i) => blaetter(v, `${pfad}[${i}]`))
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([k, v]) => blaetter(v, pfad ? `${pfad}.${k}` : k))
  return typeof value === 'string' ? [[pfad, value]] : []
}

function pruefeTexte(name: string, texte: unknown, duzenErlaubt: boolean): string[] {
  return blaetter(texte).flatMap(([pfad, text]) => verstoesse(sichtbarerText(text), { duzenErlaubt, ausnahmen: BETRAEGE }).map(f => `${name} ${pfad}: ${f}`))
}

describe('französische Texte', () => {
  it('die Prüfung erkennt typische Fehler und lässt korrekten Text durch', () => {
    expect(verstoesse('Question_? Oui_: «_actif_», 25_%, l’offre à 10:00, 49_CHF.'.replace(/_/g, NBSP))).toEqual([])
    expect(verstoesse('Question ? Oui: « actif », l\'offre, 25 %, 49 CHF, 1’000, email...')).toHaveLength(10)
    expect(verstoesse('Voir https://wartungsheft.ch/fr/?a=1 ou info@wartungsheft.ch')).toEqual([])
    expect(verstoesse('Tu ajoutes ton véhicule.')).toHaveLength(1)
    expect(verstoesse('Tu ajoutes ton véhicule.', { duzenErlaubt: true })).toEqual([])
  })

  it('öffentliche Seiten (src/texte/*.ts) und Seitentitel', () => {
    const funde = Object.entries(OEFFENTLICH).flatMap(([datei, t]) => pruefeTexte(datei, t.fr, false))
    funde.push(...pruefeTexte('page-meta', PAGE_META_SPRACHEN.fr, false))
    expect(Object.keys(OEFFENTLICH).length).toBeGreaterThan(5)
    expect(funde).toEqual([])
  })

  it('app und Mails (src/texte/app/*.ts)', () => {
    const funde = Object.entries(APP).flatMap(([datei, t]) => pruefeTexte(datei, t.fr, true))
    expect(Object.keys(APP).length).toBeGreaterThan(20)
    expect(funde).toEqual([])
  })

  it('lange Seiten (Hilfe, AGB, Datenschutz, Impressum)', async () => {
    const funde: string[] = []
    for (const [datei, seite] of Object.entries(SEITEN)) {
      const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: { render: () => null } }] })
      const app = createSSRApp({ render: () => h(seite, { fragen: hilfe.fr }) })
      app.use(router)
      const html = await renderToString(app)
      funde.push(...verstoesse(sichtbarerText(html), { ausnahmen: BETRAEGE }).map(f => `${datei}: ${f}`))
    }
    expect(Object.keys(SEITEN)).toHaveLength(4)
    expect(funde).toEqual([])
  })

  it('ratgeber samt Übersicht', () => {
    const artikel = Object.entries(RATGEBER).map(([datei, quelle]) => parseArticle(datei.split('/').pop()!.replace(/\.md$/, ''), quelle, 'fr'))
    const funde = artikel.flatMap(a => verstoesse(sichtbarerText(renderArticlePage(a))).map(f => `${a.slug}: ${f}`))
    funde.push(...verstoesse(sichtbarerText(renderIndexPage(artikel, 'fr'))).map(f => `Übersicht: ${f}`))
    expect(artikel.length).toBeGreaterThan(5)
    expect(funde).toEqual([])
  })
})

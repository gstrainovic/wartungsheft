import type { Sprache } from '../lib/sprache'
import PrimeVue from 'primevue/config'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import { mitSprache, SPRACHEN } from '../lib/sprache'
import anlagenTexte from '../texte/anlagen'
import AnlagenPage from './AnlagenPage.vue'

// Kopf und Fuss gehören nicht zu den Grafiken; der Events-Store zöge den InstantDB-Client mit
vi.mock('../components/LandingHeader.vue', () => ({ default: { render: () => null } }))
vi.mock('../components/LandingFooter.vue', () => ({ default: { render: () => null } }))
vi.mock('../stores/events', () => ({ useEventsStore: () => ({ trackCta: () => {} }) }))

async function rendere(sprache: Sprache): Promise<string> {
  const pfad = mitSprache(sprache, '/anlagen')
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: pfad, component: AnlagenPage }] })
  await router.push(pfad)
  await router.isReady()
  const app = createSSRApp(AnlagenPage)
  app.use(router)
  app.use(PrimeVue, { unstyled: true })
  return renderToString(app)
}

/** Alle `<svg>` mit der Klasse, samt Inhalt */
function grafiken(html: string, klasse: string): string[] {
  return [...html.matchAll(/<svg[^>]*class="([^"]*)"[^>]*>[\s\S]*?<\/svg>/g)]
    .filter(m => m[1]!.split(' ').includes(klasse))
    .map(m => m[0])
}

/** Sichtbarer Text einer Grafik: alle `<text>` aneinander, Umbrüche als Leerzeichen */
function beschriftung(svg: string): string {
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m => m[1]).join(' ')
}

const entschaerfe = (s: string) => s.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

describe('anlagen-Seite: Grafiken', () => {
  for (const { code } of SPRACHEN) {
    const t = anlagenTexte[code]

    it(`${code}: Ablauf breit und schmal, mit übersetztem Titel und allen Schritten`, async () => {
      const html = await rendere(code)
      const svgs = grafiken(html, 'grafik-ablauf')
      expect(svgs).toHaveLength(2)
      expect(svgs.map(s => /grafik-(breit|schmal)/.exec(s)![1])).toEqual(['breit', 'schmal'])
      for (const svg of svgs) {
        expect(svg).toContain('role="img"')
        expect(svg).toMatch(/viewBox="0 0 \d+(\.\d)? \d+(\.\d)?"/)
        expect(svg).toContain(`>${entschaerfe(t.ablauf.bild)}</title>`)
        const text = beschriftung(svg)
        for (const schritt of t.ablauf.schritte) {
          expect(text).toContain(entschaerfe(schritt.ort))
          expect(text).toContain(entschaerfe(schritt.text))
        }
        expect(svg.length).toBeLessThan(10 * 1024)
      }
      expect(html).toContain(`>${entschaerfe(t.ablauf.titel)}</h2>`)
    })

    it(`${code}: Vorher/Nachher breit und schmal, mit übersetztem Titel und allen Zeilen`, async () => {
      const html = await rendere(code)
      const svgs = grafiken(html, 'grafik-vorher-nachher')
      expect(svgs).toHaveLength(2)
      for (const svg of svgs) {
        expect(svg).toContain('role="img"')
        expect(svg).toContain(`>${entschaerfe(t.vorherNachher.bild)}</title>`)
        const text = beschriftung(svg)
        expect(text).toContain(entschaerfe(t.vorherNachher.bisher))
        expect(text).toContain(entschaerfe(t.vorherNachher.neu))
        for (const zeile of t.vorherNachher.zeilen) {
          expect(text).toContain(entschaerfe(zeile.bisher))
          expect(text).toContain(entschaerfe(zeile.neu))
        }
        expect(svg.length).toBeLessThan(10 * 1024)
      }
      expect(html).toContain(`>${entschaerfe(t.vorherNachher.titel)}</h2>`)
    })
  }

  it('ablauf steht direkt unter dem Einstieg, Vorher/Nachher nach dem Nutzen', async () => {
    const html = await rendere('de')
    const stelle = (s: string) => html.indexOf(s)
    expect(stelle('anlagen-hero')).toBeLessThan(stelle('grafik-ablauf'))
    expect(stelle('grafik-ablauf')).toBeLessThan(stelle('anlagen-benefits'))
    expect(stelle('anlagen-benefits')).toBeLessThan(stelle('grafik-vorher-nachher'))
    expect(stelle('grafik-vorher-nachher')).toBeLessThan(stelle('anlagen-fuer'))
  })

  it('titel-ids sind auf der Seite eindeutig', async () => {
    const html = await rendere('de')
    const ids = [...html.matchAll(/<title id="([^"]+)"/g)].map(m => m[1])
    expect(ids).toHaveLength(4)
    expect(new Set(ids).size).toBe(4)
  })
})

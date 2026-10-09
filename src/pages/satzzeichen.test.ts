import type { Component } from 'vue'
import type { Sprache } from '../lib/sprache'
import PrimeVue from 'primevue/config'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import { mitSprache, SPRACHEN } from '../lib/sprache'
import { sichtbarerText } from '../texte/franzoesisch'
import AgbPage from './AgbPage.vue'
import AnlagenPage from './AnlagenPage.vue'
import BetriebPage from './BetriebPage.vue'
import DatenschutzPage from './DatenschutzPage.vue'
import HilfePage from './HilfePage.vue'
import ImpressumPage from './ImpressumPage.vue'
import LandingPage from './LandingPage.vue'
import LoginPage from './LoginPage.vue'
import PrivathalterPage from './PrivathalterPage.vue'

// Anmeldung und Events zögen den InstantDB-Client mit; für den Text reicht ein abgemeldeter Besucher
vi.mock('../composables/useAuth', () => ({
  useAuth: () => ({ user: ref(null), knownEmail: ref(null), sendMagicCode: () => {}, signInWithMagicCode: () => {}, googleAuthUrl: () => '', forgetKnownAccount: () => {} }),
}))
vi.mock('../stores/events', () => ({ useEventsStore: () => ({ trackCta: () => {} }) }))
// Liest beim Start `document`, hat keinen Fliesstext
vi.mock('../components/ThemeSwitch.vue', () => ({ default: { render: () => null } }))

const SEITEN: Record<string, Component> = {
  '/': LandingPage,
  '/login': LoginPage,
  '/impressum': ImpressumPage,
  '/datenschutz': DatenschutzPage,
  '/agb': AgbPage,
  '/hilfe': HilfePage,
  '/betrieb': BetriebPage,
  '/privathalter': PrivathalterPage,
  '/anlagen': AnlagenPage,
}

async function rendere(sprache: Sprache, deutscherPfad: string, seite: Component): Promise<string> {
  const pfad = mitSprache(sprache, deutscherPfad)
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: pfad, component: seite, meta: { public: true } },
    { path: '/:p(.*)*', component: { render: () => null } },
  ] })
  await router.push(pfad)
  await router.isReady()
  const app = createSSRApp(seite)
  app.use(router)
  app.use(PrimeVue, { unstyled: true })
  return renderToString(app)
}

/**
 * Leerzeichen vor einem Satzzeichen, meist durch einen Zeilenumbruch vor `</router-link>` oder `</a>`: Vue macht daraus
 * ein Leerzeichen im Link. Deutsch, Italienisch und Englisch kennen kein Leerzeichen vor . , ; :, Französisch keines
 * vor . und , (vor ; und : steht dort ein NBSP, das prüft src/texte/franzoesisch.test.ts).
 */
function leerzeichenVorSatzzeichen(text: string, sprache: Sprache): string[] {
  const muster = sprache === 'fr' ? /\S[ \t]+[.,](?=\s|$)/gm : /\S[ \t\xA0]+[.,;:](?=\s|$)/gm
  return [...text.matchAll(muster)].map(m => `«${text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 10).replace(/\s+/g, ' ')}»`)
}

describe('öffentliche Seiten: kein Leerzeichen vor einem Satzzeichen', () => {
  it('die Prüfung erkennt den Fehler und lässt korrekten Text durch', () => {
    expect(leerzeichenVorSatzzeichen('steht in der Datenschutzerklärung .', 'de')).toHaveLength(1)
    expect(leerzeichenVorSatzzeichen('in the privacy policy , and', 'en')).toHaveLength(1)
    expect(leerzeichenVorSatzzeichen('Politique de confidentialité .', 'fr')).toHaveLength(1)
    expect(leerzeichenVorSatzzeichen('Stand: 22. September, Version 1.0.', 'de')).toEqual([])
    expect(leerzeichenVorSatzzeichen('Question\xA0: oui\xA0; voir la page.', 'fr')).toEqual([])
  })

  for (const { code } of SPRACHEN) {
    it(`${code}: alle öffentlichen Seiten gerendert`, async () => {
      const funde: string[] = []
      for (const [pfad, seite] of Object.entries(SEITEN)) {
        const text = sichtbarerText(await rendere(code, pfad, seite))
        expect(text.length, `${code} ${pfad}`).toBeGreaterThan(200)
        funde.push(...leerzeichenVorSatzzeichen(text, code).map(f => `${mitSprache(code, pfad)}: ${f}`))
      }
      expect(funde).toEqual([])
    })
  }
})

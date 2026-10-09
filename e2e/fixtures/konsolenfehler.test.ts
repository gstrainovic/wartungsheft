import { describe, expect, it } from 'vitest'
import { istIgnorierterFehler, viteAusfall } from './konsolenfehler'

// Im Projekt `offline` blockiert die Fixture InstantDB (localhost:8888); die Fehler daraus sind gewollt. Fällt aber
// der Vite-Server (localhost:6060) weg, darf das nicht mit ignoriert werden, sonst endet der Test nur mit weisser Seite.
describe('konsolenfehler im Projekt offline', () => {
  it('ignoriert die blockierten InstantDB-Anfragen', () => {
    expect(istIgnorierterFehler('Failed to load resource: net::ERR_CONNECTION_REFUSED', true, 'http://localhost:8888/runtime/session')).toBe(true)
    expect(istIgnorierterFehler('WebSocket connection to \'ws://localhost:8888/runtime/session\' failed', true)).toBe(true)
  })

  it('meldet nicht ladbare Module', () => {
    expect(istIgnorierterFehler('TypeError: Failed to fetch dynamically imported module: http://localhost:6060/src/pages/DashboardPage.vue', true)).toBe(false)
  })

  it('meldet abgelehnte Anfragen an den Vite-Server', () => {
    expect(istIgnorierterFehler('Failed to load resource: net::ERR_CONNECTION_REFUSED', true, 'http://localhost:6060/src/main.ts')).toBe(false)
  })
})

describe('konsolenfehler im Projekt online', () => {
  it('ignoriert nur die bekannten Fremdfehler', () => {
    expect(istIgnorierterFehler('Failed to load resource: the server responded with a status of 402 (Payment Required)', false)).toBe(true)
    expect(istIgnorierterFehler('Failed to load resource: net::ERR_CONNECTION_REFUSED', false, 'http://localhost:8888/x')).toBe(false)
  })
})

describe('viteAusfall', () => {
  it('erklärt eine abgelehnte Anfrage an den Vite-Server', () => {
    const meldung = viteAusfall('http://localhost:6060/src/pages/DashboardPage.vue', 'net::ERR_CONNECTION_REFUSED')
    expect(meldung).toContain('Vite-Server (localhost:6060) nicht erreichbar')
    expect(meldung).toContain('/src/pages/DashboardPage.vue')
  })

  it('schweigt bei blockiertem InstantDB und bei abgebrochenen Seitenwechseln', () => {
    expect(viteAusfall('http://localhost:8888/runtime/session', 'net::ERR_CONNECTION_REFUSED')).toBeNull()
    expect(viteAusfall('http://localhost:6060/src/main.ts', 'net::ERR_ABORTED')).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { PRAEFIXE, SPRACHEN } from '../lib/sprache'

/**
 * Texte der App hinter der Anmeldung (src/texte/app/*.ts): jede Datei hat je Sprache ein Objekt gleicher Form,
 * kein Text ist leer. Funktionen (Mehrzahl, Platzhalter) zählen als Text und müssen etwas liefern.
 */
const DATEIEN = import.meta.glob('./app/*.ts', { import: 'default', eager: true }) as Record<string, Record<string, unknown>>

function form(value: unknown): unknown {
  if (Array.isArray(value))
    return value.map(form)
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, form(v)]))
  return typeof value
}

/** Alle Blätter mit Pfad; Funktionen werden mit Platzhaltern aufgerufen */
function blaetter(value: unknown, pfad = ''): [string, unknown][] {
  if (typeof value === 'function')
    return [[pfad, (value as (...a: unknown[]) => unknown)(2, 'X', 'Y', 'Z')]]
  if (Array.isArray(value))
    return value.flatMap((v, i) => blaetter(v, `${pfad}[${i}]`))
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([k, v]) => blaetter(v, pfad ? `${pfad}.${k}` : k))
  return [[pfad, value]]
}

describe('texte der App (src/texte/app)', () => {
  it('gibt es', () => {
    expect(Object.keys(DATEIEN).length).toBeGreaterThan(0)
  })

  for (const [datei, texte] of Object.entries(DATEIEN)) {
    it(`${datei}: alle vier Sprachen mit derselben Form wie Deutsch`, () => {
      for (const { code } of SPRACHEN)
        expect(texte[code], `${datei} ${code}`).toBeDefined()
      for (const sprache of PRAEFIXE) {
        expect(form(texte[sprache]), `${datei} ${sprache}`).toEqual(form(texte.de))
        expect(texte[sprache], `${datei} ${sprache}`).not.toBe(texte.de)
      }
    })

    it(`${datei}: kein Text leer`, () => {
      for (const { code } of SPRACHEN) {
        const leer = blaetter(texte[code]).filter(([, v]) => typeof v !== 'string' || !v.trim()).map(([p]) => p)
        expect(leer, `${datei} ${code}`).toEqual([])
      }
    })

    it(`${datei}: Schweizer Schreibweise (kein ß)`, () => {
      for (const { code } of SPRACHEN) {
        const mitSz = blaetter(texte[code]).filter(([, v]) => typeof v === 'string' && v.includes('ß')).map(([p]) => p)
        expect(mitSz, `${datei} ${code}`).toEqual([])
      }
    })
  }
})

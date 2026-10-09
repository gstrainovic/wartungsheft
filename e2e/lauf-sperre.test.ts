import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { laufFreigeben, laufSperren } from './lauf-sperre'

// Alle E2E-Läufe teilen eine lokale InstantDB und dieselbe Testperson: ein zweiter Lauf daneben löscht und
// sät Daten des ersten (BO-001 «2 Fahrzeuge» sah 1). Die Sperre reiht parallele Läufe hintereinander.
function sperrDatei() {
  return join(mkdtempSync(join(tmpdir(), 'lauf-sperre-')), 'e2e.lock')
}

const ohneWarten = { schlafen: () => {}, melden: () => {} }
function verbotenesWarten(): never {
  throw new Error('darf nicht warten')
}

describe('laufSperren', () => {
  it('nimmt eine freie Sperre und trägt die eigene PID ein', () => {
    const datei = sperrDatei()
    laufSperren({ datei, pid: 100, ppid: 1, lebt: () => true, ...ohneWarten })
    expect(readFileSync(datei, 'utf8')).toBe('100')
  })

  it('wartet, solange ein anderer Lauf lebt, und übernimmt danach', () => {
    const datei = sperrDatei()
    writeFileSync(datei, '200')
    let runden = 0
    const meldungen: string[] = []
    laufSperren({
      datei,
      pid: 100,
      ppid: 1,
      lebt: () => runden < 3,
      schlafen: () => { runden++ },
      melden: t => meldungen.push(t),
    })
    expect(runden).toBe(3)
    expect(readFileSync(datei, 'utf8')).toBe('100')
    expect(meldungen.join('\n')).toContain('200')
  })

  it('bricht nach der Wartezeit mit einer klaren Meldung ab', () => {
    const datei = sperrDatei()
    writeFileSync(datei, '200')
    let zeit = 0
    expect(() => laufSperren({
      datei,
      pid: 100,
      ppid: 1,
      lebt: () => true,
      warteMs: 10_000,
      jetzt: () => zeit,
      schlafen: (ms) => { zeit += ms },
      melden: () => {},
    })).toThrow(/E2E-Lauf.*200/)
    expect(readFileSync(datei, 'utf8')).toBe('200')
  })

  it('übernimmt die Sperre eines beendeten Laufs sofort', () => {
    const datei = sperrDatei()
    writeFileSync(datei, '200')
    laufSperren({ datei, pid: 100, ppid: 1, lebt: () => false, schlafen: verbotenesWarten, melden: () => {} })
    expect(readFileSync(datei, 'utf8')).toBe('100')
  })

  it('lässt Worker des eigenen Laufs durch (Sperre gehört dem Elternprozess)', () => {
    const datei = sperrDatei()
    writeFileSync(datei, '100')
    laufSperren({ datei, pid: 300, ppid: 100, lebt: () => true, schlafen: verbotenesWarten, melden: () => {} })
    expect(readFileSync(datei, 'utf8')).toBe('100')
  })
})

describe('laufFreigeben', () => {
  it('löscht nur die eigene Sperre', () => {
    const datei = sperrDatei()
    writeFileSync(datei, '200')
    laufFreigeben(datei, 100)
    expect(existsSync(datei)).toBe(true)
    laufFreigeben(datei, 200)
    expect(existsSync(datei)).toBe(false)
  })
})

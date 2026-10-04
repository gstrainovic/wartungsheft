import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function speicher(start: Record<string, string> = {}) {
  const daten = { ...start }
  return {
    getItem: (k: string) => daten[k] ?? null,
    setItem: (k: string, v: string) => { daten[k] = v },
    removeItem: (k: string) => { delete daten[k] },
    daten,
  }
}

describe('app-sprache', () => {
  beforeEach(() => vi.resetModules())
  afterEach(() => vi.unstubAllGlobals())

  it('ist ohne gespeicherte Wahl Deutsch, wie die öffentlichen Seiten ohne Präfix', async () => {
    vi.stubGlobal('localStorage', speicher())
    const { appSprache } = await import('./app-sprache')
    expect(appSprache.value).toBe('de')
  })

  it('übernimmt die gespeicherte Wahl und ignoriert Unbekanntes', async () => {
    vi.stubGlobal('localStorage', speicher({ sprache: 'fr' }))
    expect((await import('./app-sprache')).appSprache.value).toBe('fr')
    vi.resetModules()
    vi.stubGlobal('localStorage', speicher({ sprache: 'xx' }))
    expect((await import('./app-sprache')).appSprache.value).toBe('de')
  })

  it('setAppSprache speichert die Wahl im Browser', async () => {
    const s = speicher()
    vi.stubGlobal('localStorage', s)
    const { appSprache, setAppSprache } = await import('./app-sprache')
    setAppSprache('it')
    expect(appSprache.value).toBe('it')
    expect(s.daten.sprache).toBe('it')
  })

  it('spracheNachLaden: Wahl am Benutzer gilt, sonst wird die Browser-Wahl am Benutzer nachgetragen', async () => {
    vi.stubGlobal('localStorage', speicher())
    const { spracheNachLaden } = await import('./app-sprache')
    expect(spracheNachLaden('it', 'de')).toEqual({ anwenden: 'it' })
    expect(spracheNachLaden('it', 'it')).toEqual({})
    expect(spracheNachLaden(undefined, 'fr')).toEqual({ speichern: 'fr' })
    expect(spracheNachLaden(undefined, 'de')).toEqual({})
    expect(spracheNachLaden('xx', 'en')).toEqual({ speichern: 'en' })
  })

  it('läuft ohne localStorage (Node, Server-Jobs)', async () => {
    vi.stubGlobal('localStorage', undefined)
    const { appSprache, setAppSprache, waehle } = await import('./app-sprache')
    expect(appSprache.value).toBe('de')
    setAppSprache('en')
    expect(waehle({ de: 'Ja', fr: 'Oui', it: 'Sì', en: 'Yes' })).toBe('Yes')
    expect(waehle({ de: 'Ja', fr: 'Oui', it: 'Sì', en: 'Yes' }, 'fr')).toBe('Oui')
  })
})

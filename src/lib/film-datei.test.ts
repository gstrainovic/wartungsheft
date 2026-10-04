import { describe, expect, it } from 'vitest'
import { filmName, filmQuelle, filmUntertitel, untertitelName } from './film-datei'

describe('filmName', () => {
  it('lässt Deutsch ohne Zusatz, andere Sprachen tragen ihr Kürzel', () => {
    expect(filmName('privat', 'de')).toBe('privat')
    expect(filmName('privat', 'fr')).toBe('privat-fr')
    expect(filmName('betrieb', 'en')).toBe('betrieb-en')
  })
})

describe('filmQuelle', () => {
  it('liefert den deutschen Film unverändert, hochkant oder quer', () => {
    expect(filmQuelle('film-privat.webm', 'de', false)).toBe('/film-privat.webm')
    expect(filmQuelle('film-privat.webm', 'de', true)).toBe('/film-privat-desktop.webm')
  })

  it('setzt die Sprache vor das Format, wie die Montage die Dateien schreibt', () => {
    expect(filmQuelle('film-betrieb.webm', 'it', false)).toBe('/film-betrieb-it.webm')
    expect(filmQuelle('film-betrieb.webm', 'it', true)).toBe('/film-betrieb-it-desktop.webm')
  })
})

describe('filmUntertitel', () => {
  it('eine WebVTT-Datei je Film und Sprache, für Hoch- und Querformat dieselbe', () => {
    expect(filmUntertitel('film-privat.webm', 'de')).toBe('/film-privat.vtt')
    expect(filmUntertitel('film-betrieb.webm', 'fr')).toBe('/film-betrieb-fr.vtt')
  })
})

describe('untertitelName', () => {
  it('nennt die Spur im Untertitel-Menü des Players in ihrer eigenen Sprache', () => {
    expect(untertitelName('de')).toBe('Deutsch')
    expect(untertitelName('fr')).toBe('Français')
    expect(untertitelName('it')).toBe('Italiano')
    expect(untertitelName('en')).toBe('English')
  })
})

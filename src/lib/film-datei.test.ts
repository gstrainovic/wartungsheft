import { describe, expect, it } from 'vitest'
import { filmName, filmQuelle } from './film-datei'

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

import { describe, expect, it } from 'vitest'
import { alleFassungen, mitSprache, ohneSprache, spracheAusPfad, SPRACHEN } from './sprache'

describe('spracheAusPfad', () => {
  it('liest das Präfix, ohne Präfix ist es Deutsch', () => {
    expect(spracheAusPfad('/')).toBe('de')
    expect(spracheAusPfad('/betrieb')).toBe('de')
    expect(spracheAusPfad('/fr')).toBe('fr')
    expect(spracheAusPfad('/fr/')).toBe('fr')
    expect(spracheAusPfad('/it/betrieb')).toBe('it')
    expect(spracheAusPfad('/en/ratgeber/mfk-aufgebot')).toBe('en')
  })

  it('verwechselt Pfade, die nur mit den Buchstaben beginnen, nicht mit einem Präfix', () => {
    expect(spracheAusPfad('/french')).toBe('de')
    expect(spracheAusPfad('/itinerar')).toBe('de')
  })
})

describe('ohneSprache', () => {
  it('nimmt das Präfix weg, die Startseite bleibt /', () => {
    expect(ohneSprache('/fr')).toBe('/')
    expect(ohneSprache('/fr/')).toBe('/')
    expect(ohneSprache('/it/privathalter')).toBe('/privathalter')
    expect(ohneSprache('/betrieb')).toBe('/betrieb')
    expect(ohneSprache('/')).toBe('/')
  })
})

describe('mitSprache', () => {
  it('lässt deutsche Pfade unverändert, damit bestehende Links weiter gelten', () => {
    expect(mitSprache('de', '/')).toBe('/')
    expect(mitSprache('de', '/betrieb')).toBe('/betrieb')
  })

  it('setzt das Präfix vor, die Startseite ohne Schrägstrich am Ende', () => {
    expect(mitSprache('fr', '/')).toBe('/fr')
    expect(mitSprache('it', '/betrieb')).toBe('/it/betrieb')
    expect(mitSprache('en', '/#preise')).toBe('/en#preise')
    expect(mitSprache('en', '/login')).toBe('/en/login')
  })
})

describe('alleFassungen', () => {
  it('nennt jede Seite in allen vier Sprachen, Deutsch zuerst', () => {
    expect(SPRACHEN.map(s => s.code)).toEqual(['de', 'fr', 'it', 'en'])
    expect(alleFassungen(['/', '/betrieb'])).toEqual(['/', '/betrieb', '/fr', '/fr/betrieb', '/it', '/it/betrieb', '/en', '/en/betrieb'])
  })
})

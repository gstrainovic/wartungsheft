import { describe, expect, it } from 'vitest'
import { herkunftAusEingabe, herkunftUebernehmen } from './herkunft'

describe('herkunftAusEingabe', () => {
  it('nimmt eine bekannte Antwort, Freitext nur bei «anderes»', () => {
    expect(herkunftAusEingabe('google', 'egal')).toEqual({ herkunft: 'google' })
    expect(herkunftAusEingabe('anderes', '  Garage Meier  ')).toEqual({ herkunft: 'anderes', herkunftText: 'Garage Meier' })
    expect(herkunftAusEingabe('anderes', '')).toEqual({ herkunft: 'anderes' })
  })

  it('verwirft leere und unbekannte Antworten', () => {
    expect(herkunftAusEingabe(null, '')).toBeNull()
    expect(herkunftAusEingabe('fernsehen', '')).toBeNull()
  })

  it('kürzt überlangen Freitext', () => {
    expect(herkunftAusEingabe('anderes', 'x'.repeat(500))!.herkunftText).toHaveLength(200)
  })
})

describe('herkunftUebernehmen', () => {
  const antwort = { herkunft: 'empfehlung' as const }

  it('speichert die Antwort eines neuen Kontos', () => {
    expect(herkunftUebernehmen(null, antwort)).toEqual(antwort)
    expect(herkunftUebernehmen({ herkunft: null, signupNoticeAt: null }, antwort)).toEqual(antwort)
  })

  it('ohne Antwort nichts', () => {
    expect(herkunftUebernehmen(null, null)).toBeNull()
  })

  it('überschreibt keine frühere Antwort', () => {
    expect(herkunftUebernehmen({ herkunft: 'google' }, antwort)).toBeNull()
  })

  it('nicht bei bestehenden Konten, die schon als Anmeldung gemeldet sind (Anmeldung auf neuem Gerät)', () => {
    expect(herkunftUebernehmen({ signupNoticeAt: '2026-09-20T07:00:00.000Z' }, antwort)).toBeNull()
  })
})

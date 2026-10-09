import { describe, expect, it, vi } from 'vitest'
import { ELEVEN, elevenAnfrage, piperText, sprechen, sprecherSchluessel, STIMMEN } from './sprecher'

describe('elevenAnfrage', () => {
  it('ruft die Stimme Andres mit eleven_v3 und den freigegebenen Einstellungen auf', () => {
    const { url, init } = elevenAnfrage('[excited] Hallo!', 'geheim')
    expect(url).toBe('https://api.elevenlabs.io/v1/text-to-speech/BfwuiKSWxqDOcSYQr6EC?output_format=mp3_44100_192')
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ 'xi-api-key': 'geheim', 'Content-Type': 'application/json' })
    expect(JSON.parse(init.body)).toEqual({
      text: '[excited] Hallo!',
      model_id: 'eleven_v3',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    })
  })
})

describe('stimmen je Sprache', () => {
  it('nimmt die gewählten Stimmen: Andres, Nathan, Valentino, Adam Stone', () => {
    expect(STIMMEN).toEqual({
      de: 'BfwuiKSWxqDOcSYQr6EC',
      fr: '6HYJeW6WLg97b4ika29W',
      it: 'lJylpTXX0sNdqq5EUv4M',
      en: 'DEFpwxCUkrj3WAbTDRTZ',
    })
  })

  it('ruft für Französisch Nathan mit denselben Einstellungen wie Andres auf', () => {
    const { url, init } = elevenAnfrage('[excited] Bonjour !', 'geheim', 'fr')
    expect(url).toBe('https://api.elevenlabs.io/v1/text-to-speech/6HYJeW6WLg97b4ika29W?output_format=mp3_44100_192')
    expect(JSON.parse(init.body).voice_settings).toEqual({ stability: 0.5, similarity_boost: 0.75 })
  })
})

describe('sprecherSchluessel', () => {
  it('bleibt für Deutsch wie bisher, damit der Zwischenspeicher keine Credits kostet', () => {
    expect(sprecherSchluessel('[sighs] Und du suchst.', 2)).toBe('97156404-2')
    expect(sprecherSchluessel('[sighs] Und du suchst.', 2, 'de')).toBe('97156404-2')
  })

  it('unterscheidet die Stimme: derselbe Text auf Französisch ist eine andere Datei', () => {
    expect(sprecherSchluessel('Text', 1, 'fr')).not.toBe(sprecherSchluessel('Text', 1))
  })

  it('ist für denselben Text und Durchlauf gleich, sonst verschieden', () => {
    expect(sprecherSchluessel('Text', 1)).toBe(sprecherSchluessel('Text', 1))
    expect(sprecherSchluessel('Text', 1)).not.toBe(sprecherSchluessel('Text', 2))
    expect(sprecherSchluessel('Text', 1)).not.toBe(sprecherSchluessel('Text.', 1))
    expect(sprecherSchluessel('Text', 1)).toMatch(/^[0-9a-f]{8}-1$/)
  })

  it('ändert sich mit Stimme oder Einstellungen, damit kein alter Ton übrig bleibt', () => {
    expect(ELEVEN.stimme).toBe('BfwuiKSWxqDOcSYQr6EC')
  })
})

describe('piperText', () => {
  it('lässt Regie weg und schreibt, was Piper sonst falsch ausspricht, lautnah', () => {
    expect(piperText('[excited] Gibt es ein Serviceheft? 36 Franken, auf wartungsheft.ch!'))
      .toBe('Gibt es ein Serwis-Heft? Sechsunddreissig Franken, auf wartungsheft punkt c h!')
  })
})

function deps(over: Partial<Parameters<typeof sprechen>[2]> = {}) {
  const dateien = new Map<string, Uint8Array>()
  return {
    dateien,
    d: {
      ordner: '/cache',
      schluessel: 'geheim',
      existiert: (p: string) => dateien.has(p),
      schreiben: async (p: string, b: Uint8Array) => {
        dateien.set(p, b)
      },
      fetch: vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { status: 200 })),
      piper: vi.fn(async (_t: string, p: string) => {
        dateien.set(p, new Uint8Array([9]))
      }),
      ...over,
    },
  }
}

describe('sprechen', () => {
  it('holt den Ton bei ElevenLabs und legt ihn im Zwischenspeicher ab', async () => {
    const { d, dateien } = deps()
    const pfad = await sprechen('Hallo!', 1, d)
    expect(pfad).toBe(`/cache/${sprecherSchluessel('Hallo!', 1)}.mp3`)
    expect(dateien.get(pfad)).toEqual(new Uint8Array([1, 2, 3]))
    expect(d.fetch).toHaveBeenCalledTimes(1)
  })

  it('kostet beim zweiten Mal keine Credits', async () => {
    const { d } = deps()
    await sprechen('Hallo!', 1, d)
    await sprechen('Hallo!', 1, d)
    expect(d.fetch).toHaveBeenCalledTimes(1)
  })

  it('meldet einen Fehler von ElevenLabs mit Status, ohne den Schlüssel zu nennen', async () => {
    const { d } = deps({ fetch: vi.fn(async () => new Response('quota_exceeded', { status: 401 })) })
    await expect(sprechen('Hallo!', 1, d)).rejects.toThrow(/ElevenLabs 401: quota_exceeded/)
    await expect(sprechen('Hallo!', 1, d)).rejects.not.toThrow(/geheim/)
  })

  it('spricht mit der Stimme der verlangten Sprache', async () => {
    const { d } = deps()
    const pfad = await sprechen('Ciao!', 1, d, 'it')
    expect(pfad).toBe(`/cache/${sprecherSchluessel('Ciao!', 1, 'it')}.mp3`)
    expect(d.fetch).toHaveBeenCalledWith(expect.stringContaining('/lJylpTXX0sNdqq5EUv4M?'), expect.anything())
  })

  it('spricht ohne Schlüssel nicht mit Piper: keine Gratis-Stimme in einer Auslieferung (Skill produktvideos)', async () => {
    const { d } = deps({ schluessel: undefined })
    await expect(sprechen('[excited] Hallo!', 1, d)).rejects.toThrow(/Piper nur als Entwurf/)
    expect(d.piper).not.toHaveBeenCalled()
    expect(d.fetch).not.toHaveBeenCalled()
  })

  it('nimmt Piper nur als ausdrücklichen Entwurf (WAV)', async () => {
    const { d } = deps({ schluessel: undefined, entwurf: true })
    const pfad = await sprechen('[excited] Hallo!', 1, d)
    expect(pfad).toBe(`/cache/piper-${sprecherSchluessel('Hallo!', 1)}.wav`)
    expect(d.piper).toHaveBeenCalledWith('Hallo!', pfad)
    expect(d.fetch).not.toHaveBeenCalled()
  })

  it('bleibt bei ElevenLabs, auch wenn ein Entwurf erlaubt ist', async () => {
    const { d } = deps({ entwurf: true })
    expect(await sprechen('Hallo!', 1, d)).toBe(`/cache/${sprecherSchluessel('Hallo!', 1)}.mp3`)
    expect(d.piper).not.toHaveBeenCalled()
  })
})

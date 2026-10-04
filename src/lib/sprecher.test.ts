import { describe, expect, it, vi } from 'vitest'
import { ELEVEN, elevenAnfrage, piperText, sprechen, sprecherSchluessel } from './sprecher'

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

describe('sprecherSchluessel', () => {
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

  it('fällt ohne Schlüssel auf Piper zurück (WAV)', async () => {
    const { d } = deps({ schluessel: undefined })
    const pfad = await sprechen('[excited] Hallo!', 1, d)
    expect(pfad).toBe(`/cache/piper-${sprecherSchluessel('Hallo!', 1)}.wav`)
    expect(d.piper).toHaveBeenCalledWith('Hallo!', pfad)
    expect(d.fetch).not.toHaveBeenCalled()
  })
})

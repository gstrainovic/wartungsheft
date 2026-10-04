/**
 * Sprecher der Werbefilme (Skill `werbefilm`, Abschnitt «Sprecher»): ElevenLabs mit der Stimme Andres, Rückfall
 * Piper, wenn kein Schlüssel da ist. Jede Aufnahme landet unter einem Namen aus Text, Stimme und Durchlauf im
 * Zwischenspeicher (`video-out/sprecher/`), damit ein Neubau keine Credits kostet. Datei- und Netzzugriff kommen
 * von aussen (`scripts/sprecher.ts`), damit die Logik ohne Netz testbar bleibt.
 */
import { ohneRegie } from './werbefilm.ts'

export const ELEVEN = {
  stimme: 'BfwuiKSWxqDOcSYQr6EC',
  modell: 'eleven_v3',
  einstellungen: { stability: 0.5, similarity_boost: 0.75 },
  format: 'mp3_44100_192',
} as const

export function elevenAnfrage(text: string, schluessel: string): { url: string, init: { method: string, headers: Record<string, string>, body: string } } {
  return {
    url: `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN.stimme}?output_format=${ELEVEN.format}`,
    init: {
      method: 'POST',
      headers: { 'xi-api-key': schluessel, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: ELEVEN.modell, voice_settings: ELEVEN.einstellungen }),
    },
  }
}

/** FNV-1a über Text und Stimme: gleicher Text, gleiche Datei; neue Stimme oder Einstellung, neue Datei */
export function sprecherSchluessel(text: string, durchlauf: number): string {
  let h = 0x811C9DC5
  for (const c of JSON.stringify([ELEVEN, text])) {
    h ^= c.codePointAt(0)!
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return `${h.toString(16).padStart(8, '0')}-${durchlauf}`
}

const PIPER_LAUTE: [RegExp, string][] = [
  [/Serviceheft/g, 'Serwis-Heft'],
  [/\b36\b/g, 'Sechsunddreissig'],
  [/\b30\b/g, 'Dreissig'],
  [/\b25\b/g, 'Fünfundzwanzig'],
  [/wartungsheft\.ch/g, 'wartungsheft punkt c h'],
]

/** Piper liest Regie, Zahlen und «Serviceheft» falsch; hier steht, was es stattdessen hören muss */
export function piperText(text: string): string {
  return PIPER_LAUTE.reduce((t, [muster, ersatz]) => t.replace(muster, ersatz), ohneRegie(text))
}

export interface SprecherDeps {
  /** Zwischenspeicher, z. B. video-out/sprecher */
  ordner: string
  /** ElevenLabs-Schlüssel aus ~/.config/elevenlabs/key; fehlt er, spricht Piper */
  schluessel?: string
  existiert: (pfad: string) => boolean
  schreiben: (pfad: string, daten: Uint8Array) => Promise<void>
  fetch: (url: string, init: { method: string, headers: Record<string, string>, body: string }) => Promise<Response>
  piper: (text: string, pfad: string) => Promise<void>
}

/** Pfad der Sprecheraufnahme für `text` (mit Regie) im Durchlauf `durchlauf`; erzeugt sie nur, wenn sie fehlt */
export async function sprechen(text: string, durchlauf: number, d: SprecherDeps): Promise<string> {
  if (!d.schluessel) {
    const t = piperText(text)
    const pfad = `${d.ordner}/piper-${sprecherSchluessel(t, durchlauf)}.wav`
    if (!d.existiert(pfad))
      await d.piper(t, pfad)
    return pfad
  }
  const pfad = `${d.ordner}/${sprecherSchluessel(text, durchlauf)}.mp3`
  if (d.existiert(pfad))
    return pfad
  const { url, init } = elevenAnfrage(text, d.schluessel)
  const res = await d.fetch(url, init)
  if (!res.ok)
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`)
  await d.schreiben(pfad, new Uint8Array(await res.arrayBuffer()))
  return pfad
}

/**
 * Text → Sprecheraufnahme für die Werbefilme (Skill `werbefilm`, Abschnitt «Sprecher»).
 *
 *   node scripts/sprecher.ts "[excited] 30 Tage gratis testen!" [durchlauf] [sprache]   # gibt den Pfad der MP3 aus
 *
 * ElevenLabs (Stimme Andres, eleven_v3) mit dem Schlüssel aus ~/.config/elevenlabs/key; ohne Schlüssel Piper mit
 * de_DE-thorsten-high (WAV). Ergebnis im Zwischenspeicher video-out/sprecher/, ein zweiter Aufruf kostet nichts.
 * Der Schlüssel wird nie ausgegeben.
 */
import type { Sprache } from '../src/lib/sprache.ts'
import type { SprecherDeps } from '../src/lib/sprecher.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { sprechen } from '../src/lib/sprecher.ts'

export const SPRECHER_ORDNER = join(fileURLToPath(new URL('..', import.meta.url)), 'video-out/sprecher')
const SCHLUESSEL = join(homedir(), '.config/elevenlabs/key')
const PIPER_STIMME = process.env.PIPER_VOICE ?? join(homedir(), '.local/share/piper-voices/de_DE-thorsten-high.onnx')

export function sprecherDeps(): SprecherDeps {
  mkdirSync(SPRECHER_ORDNER, { recursive: true })
  return {
    ordner: SPRECHER_ORDNER,
    schluessel: existsSync(SCHLUESSEL) ? readFileSync(SCHLUESSEL, 'utf8').trim() || undefined : undefined,
    existiert: existsSync,
    schreiben: async (pfad, daten) => writeFileSync(pfad, daten),
    fetch: (url, init) => fetch(url, init),
    piper: async (text, pfad) => {
      // Tempo 1.12: Zuschauer kamen beim Lesen der Untertitel sonst nicht mit
      execFileSync('piper', ['--model', PIPER_STIMME, '--length-scale', '1.12', '--output_file', pfad], { input: text, stdio: ['pipe', 'ignore', 'ignore'] })
    },
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [text, durchlauf = '1', sprache = 'de'] = process.argv.slice(2)
  if (!text) {
    console.error('Aufruf: node scripts/sprecher.ts "<Text mit [Regie]>" [durchlauf] [de|fr|it|en]')
    process.exit(1)
  }
  console.log(await sprechen(text, Number(durchlauf), sprecherDeps(), sprache as Sprache))
}

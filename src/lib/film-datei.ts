/**
 * Dateinamen der Werbefilme je Sprache (Skill `werbefilm`). Die Montage (`scripts/werbefilm.ts`) schreibt
 * `film-<film>[-<sprache>][-desktop].{mp4,webm}`, `LandingVideo.vue` liest dieselben Namen. Deutsch trägt kein
 * Kürzel, damit die bestehenden Dateien und Links gelten.
 */
import type { Sprache } from './sprache.ts'
import { SPRACHEN } from './sprache.ts'

/** Name eines Films in einer Sprache: privat, privat-fr */
export function filmName(film: string, sprache: Sprache): string {
  return sprache === 'de' ? film : `${film}-${sprache}`
}

/** Pfad unter public/ für die Seite: deutsche Datei (film-privat.webm) in Sprache und Format der Anzeige */
export function filmQuelle(datei: string, sprache: Sprache, quer: boolean): string {
  const basis = datei.replace(/\.webm$/, '')
  const film = filmName(basis, sprache)
  return `/${film}${quer ? '-desktop' : ''}.webm`
}

/** Untertitel (WebVTT) zum Film einer Sprache; Hoch- und Querformat haben dieselben Zeiten, also eine Datei */
export function filmUntertitel(datei: string, sprache: Sprache): string {
  return `/${filmName(datei.replace(/\.webm$/, ''), sprache)}.vtt`
}

/** Name der Untertitelspur im Menü des Players, in der Sprache der Spur */
export function untertitelName(sprache: Sprache): string {
  return SPRACHEN.find(s => s.code === sprache)!.name
}

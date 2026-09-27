/**
 * Sprachen der öffentlichen Seiten. Deutsch ist die Hauptfassung und steht ohne Präfix, damit bestehende Links
 * gültig bleiben; Französisch, Italienisch und Englisch liegen unter /fr, /it und /en mit denselben Pfaden.
 * Die App hinter der Anmeldung bleibt deutsch. Bewusst ohne Browser- und Vite-Abhängigkeit, `vite.config.ts`
 * importiert die Datei.
 */

export const SPRACHEN = [
  { code: 'de', tag: 'de-CH', name: 'Deutsch' },
  { code: 'fr', tag: 'fr-CH', name: 'Français' },
  { code: 'it', tag: 'it-CH', name: 'Italiano' },
  { code: 'en', tag: 'en', name: 'English' },
] as const

export type Sprache = (typeof SPRACHEN)[number]['code']

export const PRAEFIXE = ['fr', 'it', 'en'] as const satisfies readonly Sprache[]

const PRAEFIX = /^\/(fr|it|en)(?=\/|#|$)/

export function spracheAusPfad(pfad: string): Sprache {
  return (PRAEFIX.exec(pfad)?.[1] as Sprache | undefined) ?? 'de'
}

/** Pfad ohne Sprachpräfix: /fr/betrieb → /betrieb, /fr → / */
export function ohneSprache(pfad: string): string {
  const rest = pfad.replace(PRAEFIX, '')
  return rest === '' || rest === '/' ? '/' : rest
}

/** Deutscher Pfad in der gewünschten Sprache: /betrieb → /fr/betrieb, / → /fr, /#preise → /fr#preise */
export function mitSprache(sprache: Sprache, pfad: string): string {
  if (sprache === 'de')
    return pfad
  return pfad === '/' || pfad.startsWith('/#') ? `/${sprache}${pfad.slice(1)}` : `/${sprache}${pfad}`
}

/** Jeder deutsche Pfad in allen Sprachen, Deutsch zuerst */
export function alleFassungen(pfade: string[]): string[] {
  return SPRACHEN.flatMap(s => pfade.map(p => mitSprache(s.code, p)))
}

export function sprachTag(sprache: Sprache): string {
  return SPRACHEN.find(s => s.code === sprache)!.tag
}

/**
 * PrimeVue-Texte (config.locale) auf die App-Sprache setzen; main.ts ruft das beim Start und bei jedem Wechsel.
 * Woche beginnt am Montag, wie in der Schweiz und in Grossbritannien.
 */
import type { Sprache } from './sprache'
import texte from '../texte/app/primevue'

export function primeVueSprache(locale: Record<string, any>, sprache: Sprache): void {
  const { aria, ...rest } = texte[sprache]
  Object.assign(locale, rest, { firstDayOfWeek: 1 })
  locale.aria = { ...locale.aria, ...aria }
}

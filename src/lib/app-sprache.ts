/**
 * Sprache der App hinter der Anmeldung. Die öffentlichen Seiten lesen ihre Sprache aus dem Pfad (sprache.ts),
 * die App aus dieser Wahl: zuerst die Einstellung am Benutzer (Entität `settings`, Feld `sprache`, setzt
 * stores/reminders.ts nach dem Laden), sonst die im Browser gemerkte Wahl (Login-Seite in einer Sprache besucht
 * oder in den Einstellungen gewählt), sonst Deutsch wie die öffentlichen Seiten ohne Präfix.
 * Läuft auch in Node (Server-Jobs, Tests): ohne localStorage bleibt nur der Wert im Speicher.
 */
import type { Sprache } from './sprache.ts'
import { ref } from 'vue'
import { SPRACHEN } from './sprache.ts'

const SCHLUESSEL = 'sprache'

export function istSprache(wert: unknown): wert is Sprache {
  return SPRACHEN.some(s => s.code === wert)
}

function gespeichert(): Sprache {
  try {
    const wert = globalThis.localStorage?.getItem(SCHLUESSEL)
    return istSprache(wert) ? wert : 'de'
  }
  catch {
    return 'de'
  }
}

export const appSprache = ref<Sprache>(gespeichert())

export function setAppSprache(sprache: Sprache): void {
  appSprache.value = sprache
  try {
    globalThis.localStorage?.setItem(SCHLUESSEL, sprache)
  }
  catch {}
}

/**
 * Nach dem Laden der Einstellungen am Benutzer: eine dort gespeicherte Sprache gilt (anderes Gerät, Wahl in den
 * Einstellungen); fehlt sie, wird eine nicht-deutsche Browser-Wahl nachgetragen, damit auch Erinnerungsmails sie kennen.
 */
export function spracheNachLaden(amBenutzer: unknown, browser: Sprache): { anwenden?: Sprache, speichern?: Sprache } {
  if (istSprache(amBenutzer))
    return amBenutzer === browser ? {} : { anwenden: amBenutzer }
  return browser === 'de' ? {} : { speichern: browser }
}

/** Fassung in der App-Sprache (oder der angegebenen), für Code ausserhalb von Komponenten */
export function waehle<T>(texte: Record<Sprache, T>, sprache: Sprache = appSprache.value): T {
  return texte[sprache]
}

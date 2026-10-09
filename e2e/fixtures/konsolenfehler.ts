// Filter der Konsolenfehler für die Fixture in test-fixtures.ts (eigene Datei ohne Playwright-Import, damit Vitest
// sie prüfen kann: konsolenfehler.test.ts).

// Only unfixable third-party errors here — everything else must be fixed, not ignored.
// Tesseract.js WASM runs in a Web Worker — its console.error can't be intercepted from JS.
// The warning fires for images without DPI metadata (all browser-resized images).
const IGNORED_ERRORS = [
  /Invalid resolution.*dpi/,
  // Bewusste 402-Antwort des AI-Proxys bei erreichtem Monatslimit (AP-002)
  /status of 402 \(Payment Required\)/,
]

const VITE_SERVER = /^https?:\/\/(?:localhost|127\.0\.0\.1):6060\//

// Zeichen dafür, dass die App ihren eigenen Code nicht laden kann (Vite weg): gilt auch offline als Fehler.
const MODUL_NICHT_LADBAR = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/

// Abbrüche, die ein weggefallener Server erzeugt. ERR_ABORTED fehlt bewusst: so endet jede Anfrage, die ein
// Seitenwechsel abbricht.
const SERVER_WEG = /ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ERR_EMPTY_RESPONSE|ERR_CONNECTION_CLOSED/

/**
 * Ob ein Konsolenfehler den Test nicht scheitern lässt. Offline sind die Fehler der blockierten InstantDB
 * (localhost:8888) gewollt und alles andere ebenfalls ignoriert, ausser die App kann Module vom Vite-Server nicht laden.
 * `url` ist der Ort der Meldung (`msg.location().url`), bei «Failed to load resource» die Adresse der Anfrage.
 */
export function istIgnorierterFehler(text: string, offline: boolean, url = ''): boolean {
  if (MODUL_NICHT_LADBAR.test(text))
    return false
  if (offline)
    return !(VITE_SERVER.test(url) && SERVER_WEG.test(text))
  return IGNORED_ERRORS.some(pattern => pattern.test(text))
}

/** Klare Meldung für eine fehlgeschlagene Anfrage an den Vite-Server, sonst null. */
export function viteAusfall(url: string, fehler: string): string | null {
  if (!VITE_SERVER.test(url) || !SERVER_WEG.test(fehler))
    return null
  return `[Vite-Server (localhost:6060) nicht erreichbar] ${url}: ${fehler}. Wurde das Vite während des Laufs beendet oder neu gestartet?`
}

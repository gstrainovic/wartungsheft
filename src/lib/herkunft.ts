/**
 * Herkunftsfrage bei der Anmeldung: eine freiwillige Frage auf der Login-Seite (nur auf unbekannten Geräten). Die Wahl
 * liegt bis zur Anmeldung im Browser (localStorage, damit sie auch den Umweg über Google übersteht) und kommt danach
 * an das Konto (Entität `settings`, Felder `herkunft` und `herkunftText`; stores/reminders.ts). Die Meldung neuer
 * Anmeldungen an den Betreiber nennt sie (services/signup-notice.ts).
 */

export const HERKUNFT_OPTIONEN = ['google', 'anzeige', 'empfehlung', 'verzeichnis', 'social', 'anderes'] as const
export type Herkunft = typeof HERKUNFT_OPTIONEN[number]

export interface HerkunftAntwort {
  herkunft: Herkunft
  /** nur bei `anderes` */
  herkunftText?: string
}

const SPEICHER = 'herkunft'
const MAX_TEXT = 200

function istHerkunft(wert: unknown): wert is Herkunft {
  return typeof wert === 'string' && (HERKUNFT_OPTIONEN as readonly string[]).includes(wert)
}

/** Antwort aus den Feldern der Login-Seite; null, wenn nichts gewählt ist */
export function herkunftAusEingabe(wahl: string | null | undefined, text: string | null | undefined): HerkunftAntwort | null {
  if (!istHerkunft(wahl))
    return null
  const freitext = wahl === 'anderes' ? (text ?? '').trim().slice(0, MAX_TEXT) : ''
  return freitext ? { herkunft: wahl, herkunftText: freitext } : { herkunft: wahl }
}

/**
 * Was nach der Anmeldung ans Konto geht: nur bei einem neuen Konto (noch keine Antwort, noch nicht als Anmeldung
 * gemeldet). Wer sich mit einem bestehenden Konto auf einem neuen Gerät anmeldet, wird nicht nachträglich eingeordnet.
 */
export function herkunftUebernehmen(
  settings: { herkunft?: string | null, signupNoticeAt?: string | null } | null | undefined,
  antwort: HerkunftAntwort | null,
): HerkunftAntwort | null {
  if (!antwort || settings?.herkunft || settings?.signupNoticeAt)
    return null
  return antwort
}

export function merkeHerkunft(antwort: HerkunftAntwort | null): void {
  try {
    if (antwort)
      localStorage.setItem(SPEICHER, JSON.stringify(antwort))
    else
      localStorage.removeItem(SPEICHER)
  }
  catch {}
}

export function gemerkteHerkunft(): HerkunftAntwort | null {
  try {
    const roh = JSON.parse(localStorage.getItem(SPEICHER) ?? 'null')
    return herkunftAusEingabe(roh?.herkunft, roh?.herkunftText)
  }
  catch {
    return null
  }
}

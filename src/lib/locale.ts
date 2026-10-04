/**
 * Zahlen, Beträge und Daten je Sprache der App (app-sprache.ts): de, fr und it im Schweizer Format
 * (1'234.50, 14.09.2026), en im britischen (1,234.50, 14/09/2026). Währung bleibt CHF, Rechnungen behalten ihre.
 * Bewusst ohne Intl: Browser und Node liefern für de-CH unterschiedliche Apostrophe (U+2019 bzw. U+0027) und für
 * fr-CH/it-CH je nach ICU-Stand Komma oder Schrägstrich; das Format soll überall gleich aussehen und in Tests
 * vergleichbar sein. Für DACH oder global werden daraus Einstellungen pro Deployment und pro Nutzer (siehe todo.md).
 */
import type { Sprache } from './sprache.ts'
import { appSprache } from './app-sprache.ts'

export const DEFAULT_CURRENCY = 'CHF'
/** Sprachcode für PrimeVue InputNumber, nur noch für Deutsch; sonst zahlenLocale() */
export const LOCALE = 'de-CH'

interface Format {
  tausender: string
  datum: string
  monate: string[]
  /** Locale für Intl in PrimeVue InputNumber; fr nutzt de-CH, damit der Dezimalpunkt wie in der Anzeige bleibt */
  intl: string
}

const FORMATE: Record<Sprache, Format> = {
  de: { tausender: '\'', datum: '.', intl: 'de-CH', monate: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] },
  fr: { tausender: '\'', datum: '.', intl: 'de-CH', monate: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'] },
  it: { tausender: '\'', datum: '.', intl: 'it-CH', monate: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'] },
  en: { tausender: ',', datum: '/', intl: 'en-GB', monate: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
}

/** Locale für PrimeVue InputNumber in der App-Sprache */
export function zahlenLocale(sprache: Sprache = appSprache.value): string {
  return FORMATE[sprache].intl
}

export function formatNumber(value: number | undefined | null, decimals = 0, sprache: Sprache = appSprache.value): string {
  const fixed = Math.abs(value ?? 0).toFixed(decimals)
  const [whole, fraction] = fixed.split('.')
  const grouped = whole!.replace(/\B(?=(\d{3})+(?!\d))/g, FORMATE[sprache].tausender)
  const sign = (value ?? 0) < 0 ? '-' : ''
  return fraction ? `${sign}${grouped}.${fraction}` : `${sign}${grouped}`
}

export function formatCurrency(value: number | undefined | null, currency: string = DEFAULT_CURRENCY, sprache: Sprache = appSprache.value): string {
  return `${currency} ${formatNumber(value, 2, sprache)}`
}

/**
 * Datum als TT.MM.JJJJ (en: TT/MM/JJJJ). ISO-Strings werden textuell gelesen (kein Date-Parsing, also keine
 * Verschiebung um einen Tag durch Zeitzonen); Date-Objekte nach lokaler Zeit. Unbekannte Formate bleiben unverändert,
 * leer bleibt leer.
 */
export function formatDate(value: string | Date | undefined | null, sprache: Sprache = appSprache.value): string {
  if (!value)
    return ''
  const t = FORMATE[sprache].datum
  if (value instanceof Date)
    return `${String(value.getDate()).padStart(2, '0')}${t}${String(value.getMonth() + 1).padStart(2, '0')}${t}${value.getFullYear()}`
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  return m ? `${m[3]}${t}${m[2]}${t}${m[1]}` : value
}

/** Monat «JJJJ-MM» als «September 2026» bzw. «septembre 2026» */
export function formatMonth(value: string | undefined | null, sprache: Sprache = appSprache.value): string {
  const m = /^(\d{4})-(\d{2})/.exec(value ?? '')
  if (!m)
    return value ?? ''
  return `${FORMATE[sprache].monate[Number(m[2]) - 1] ?? m[2]} ${m[1]}`
}

const CURRENCY_ALIASES: Record<string, string> = {
  '€': 'EUR',
  'EURO': 'EUR',
  'FR.': 'CHF',
  'FR': 'CHF',
  'SFR.': 'CHF',
  'SFR': 'CHF',
  'FRANKEN': 'CHF',
  '$': 'USD',
  'US$': 'USD',
}

/** Währung aus Scan oder Formular auf einen ISO-Code bringen; leer heisst Standardwährung, Unbekanntes bleibt stehen. */
export function normalizeCurrency(value: string | undefined | null): string {
  const raw = (value ?? '').trim()
  if (!raw)
    return DEFAULT_CURRENCY
  const upper = raw.toUpperCase()
  return CURRENCY_ALIASES[upper] ?? upper
}

/**
 * Fehler aus API, Proxy und Netz in eine kurze Nutzermeldung in der App-Sprache übersetzen.
 * Technische Details gehen nur in die Konsole, nie in die Oberfläche.
 */
import texte from '../texte/app/fehler'
import { appSprache, waehle } from './app-sprache'

function statusOf(err: unknown): number | undefined {
  if (!err || typeof err !== 'object')
    return undefined
  const e = err as Record<string, unknown>
  for (const key of ['statusCode', 'status'] as const) {
    if (typeof e[key] === 'number')
      return e[key] as number
  }
  return undefined
}

function messageOf(err: unknown): string {
  if (err instanceof Error)
    return `${err.name} ${err.message}`
  return typeof err === 'string' ? err : ''
}

export function userMessage(err: unknown): string {
  const t = waehle(texte)
  const status = statusOf(err)
  const msg = messageOf(err)
  const has = (code: number) => status === code || new RegExp(`\\b${code}\\b`).test(msg)

  // 429 vor dem Monatslimit prüfen: «Rate limit» enthält ebenfalls «limit»
  if (has(429) || /rate.?limit/i.test(msg))
    return t.rate
  // Der ai-proxy formuliert Monatslimit und Testzeit deutsch für Nutzer (mit Kontingent und Plan); in anderen
  // Sprachen gilt die eigene, kürzere Meldung
  if (err instanceof Error && err.message.startsWith('Testzeit vorbei'))
    return appSprache.value === 'de' ? err.message : t.testzeit
  if (err instanceof Error && err.message.startsWith('Monatslimit erreicht'))
    return appSprache.value === 'de' ? err.message : t.limit
  if (has(402) || /limit/i.test(msg))
    return t.limit
  if (/failed to fetch|fetch failed|networkerror|network request failed|offline|load failed/i.test(msg))
    return t.offline
  if (has(401) || has(403))
    return t.auth
  console.error('[fehler]', err)
  return t.allgemein
}

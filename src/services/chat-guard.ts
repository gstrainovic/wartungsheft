/**
 * Guard gegen Erfolgsbehauptungen ohne Tool-Aufruf (Mistral schreibt gern «eingetragen», ohne add_maintenance
 * aufzurufen). Reine Funktion, damit sie ohne InstantDB testbar ist; `sendChatMessage` fasst bei true einmal
 * mit `toolChoice: 'required'` nach.
 */

/** Tools, die etwas speichern; Lese-Tools (list_vehicles, get_vehicle …) zählen nicht als ausgeführte Aktion */
export const WRITE_TOOLS = new Set([
  'add_vehicle',
  'update_vehicle',
  'delete_vehicle',
  'set_maintenance_schedule',
  'add_invoice',
  'delete_invoice',
  'add_maintenance',
])

// Partizip mit Hilfsverb («wurde eingetragen»), am Satzende oder vor Doppelpunkt («Wartung … eingetragen:»), oder
// hinter einem Häkchen. «erfasst» nur mit Hilfsverb: «Ich habe folgende Daten erfasst:» ist die Vorschau vor der
// Bestätigung, kein Erfolg. Fragen («eintragen?») bleiben aussen vor.
const ACTION_WORDS = 'angelegt|eingetragen|gespeichert|erfasst|gelöscht|aktualisiert|erstellt|hinzugefügt'
const DONE_WORDS = 'angelegt|eingetragen|gespeichert|gelöscht|aktualisiert|erstellt|hinzugefügt'
const ACTION_CLAIM = new RegExp(
  `\\b(?:wurde|wurden|habe ich|ist|sind)\\b[^.?]{1,80}\\b(?:${ACTION_WORDS})\\b`
  + `|\\b(?:${DONE_WORDS})\\s*(?:[:.!]|$)`
  + `|✅[^\\n]{0,80}\\b(?:${DONE_WORDS})\\b`,
  'i',
)

// Dieselbe Regel für Französisch, Italienisch und Englisch (Chat antwortet in der App-Sprache). Akzente vertragen
// kein \b, darum Buchstaben-Grenzen per \p{L}. «saisi», «inserito», «recorded» zählen wie «erfasst» nur im Passiv:
// «J'ai saisi les données suivantes :» ist die Vorschau.
const L = '(?<!\\p{L})'
const R = '(?!\\p{L})'
const FR_DONE = '(?:enregistr|ajout|cré|supprim|sauvegard|mis à jour|mise à jour)(?:é|ée|és|ées)?'
const IT_DONE = '(?:registrat|aggiunt|salvat|creat|eliminat|cancellat|aggiornat)[oaie]'
const EN_DONE = 'saved|added|created|deleted|removed|updated|entered|logged'
const OTHER_CLAIM = new RegExp([
  // Passiv mit erfassen-Wörtern
  `${L}(?:a été|ont été|est|sont)${R}[^.?]{1,80}${L}(?:${FR_DONE}|saisi(?:e|s|es)?)${R}`,
  `${L}(?:è stat[oa]|sono stat[ie])${R}[^.?]{1,80}${L}(?:${IT_DONE}|inserit[oaie])${R}`,
  `${L}(?:has been|have been|was|were|is now|are now)${R}[^.?]{1,80}${L}(?:${EN_DONE}|recorded)${R}`,
  // Aktiv («j'ai enregistré», «ho salvato», «I have saved»)
  `${L}(?:j'ai|j’ai)[^.?]{1,40}${L}${FR_DONE}${R}`,
  `${L}ho${R}[^.?]{1,40}${L}${IT_DONE}${R}`,
  `${L}(?:I have|I've|I’ve)${R}[^.?]{1,40}${L}(?:${EN_DONE})${R}`,
  // Am Satzende, vor Doppelpunkt oder hinter Häkchen
  `${L}(?:${FR_DONE}|${IT_DONE}|${EN_DONE}|recorded)\\s*(?:[:.!]|$)`,
].join('|'), 'iu')
const OTHER_NEGATION = /(?<!\p{L})(?:aucun|aucune|pas|jamais|rien|nessun|nessuna|nessuno|non|niente|mai|no|not|none|never|nothing)(?!\p{L})/iu

export interface GuardResult {
  text: string
  steps?: Array<{ toolCalls?: Array<{ toolName?: string }> }>
}

// Verneinte Sätze («noch keine Wartungen eingetragen», «kein Fahrzeug angelegt») sind Auskunft, kein Erfolg
const NEGATION = /\b(?:kein|keine|keinen|keinem|keiner|nicht|noch nicht|nichts)\b/i

export function claimsActionWithoutTool(result: GuardResult): boolean {
  const wroteSomething = (result.steps ?? []).some(s => (s.toolCalls ?? []).some(c => WRITE_TOOLS.has(c.toolName ?? '')))
  if (wroteSomething)
    return false
  const sentences = (result.text || '').split(/(?<=[.!?:])\s+|\n+/)
  return sentences.some(s => (!NEGATION.test(s) && ACTION_CLAIM.test(s)) || (!OTHER_NEGATION.test(s) && OTHER_CLAIM.test(s)))
}

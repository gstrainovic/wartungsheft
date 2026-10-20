#!/usr/bin/env node
/**
 * Setzt die geschützten Leerzeichen (U+00A0) der französischen Typografie in Markdown-Dateien – die Edit-Werkzeuge
 * machen aus U+00A0 ein normales Leerzeichen, deshalb per Skript (Skill texte-und-sprachen, franzoesisch.test.ts):
 * NBSP vor : ; ? ! » % und nach «, Apostroph ’, Ellipse …, Tausendertrenner, Währung und Einheiten nach Zahlen.
 * Aufruf: node scripts/fr-nbsp.mjs [datei ...]  (Standard: content/ratgeber/fr/*.md)
 * Ausgabe: die Änderungen, damit sie vor dem Speichern prüfbar sind.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const NBSP = String.fromCharCode(0xA0)

export function frNbsp(text) {
  return text
    // Apostroph zwischen Buchstaben, Ellipsen
    .replace(/(\p{L})'(\p{L})/gu, '$1’$2')
    .replace(/(?<!\.)\.\.\./g, '…')
    // Tausendertrenner: 15'000 und 15 000 → 15 NBSP 000
    .replace(/(\d)['’](\d{3})\b/g, `$1${NBSP}$2`)
    .replace(/(\d) (\d{3})\b/g, `$1${NBSP}$2`)
    // Währung und Einheiten nach Zahlen
    .replace(/(\d) (CHF|Fr\.)/g, `$1${NBSP}$2`)
    .replace(/(CHF|Fr\.) (\d)/g, `$1${NBSP}$2`)
    .replace(/(\d) (km|kg|Mo|Go|Ko|MB|GB|KB)\b/g, `$1${NBSP}$2`)
    // NBSP vor Doppelpunkt (nicht bei Uhrzeiten), Semikolon, Ausrufe- und Fragezeichen, schliessendem Guillemet, Prozent
    .replace(/(\S) :(?!\d)/g, `$1${NBSP}:`)
    .replace(/(\S) ?([;»%])/g, `$1${NBSP}$2`)
    .replace(/(\S) ?([?!])/g, `$1${NBSP}$2`)
    // NBSP nach öffnendem Guillemet
    .replace(/« (?=\S)/g, `«${NBSP}`)
}

const dateien = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync('content/ratgeber/fr').filter(f => f.endsWith('.md')).map(f => join('content/ratgeber/fr', f))

for (const datei of dateien) {
  const vorher = readFileSync(datei, 'utf8')
  const nachher = frNbsp(vorher)
  if (nachher !== vorher) {
    writeFileSync(datei, nachher)
    console.log(`NBSP gesetzt: ${datei}`)
  }
}

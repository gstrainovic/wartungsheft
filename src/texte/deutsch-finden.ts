/**
 * Heuristik für app-deutsch.test.ts: findet deutsche Oberflächentexte, die fest in einer .vue- oder .ts-Datei stehen.
 * Gesucht wird in Textknoten des Templates und in allen Zeichenketten (Attribute, Ausdrücke, Script). Deutsch ist,
 * was einen Umlaut oder eines der häufigen deutschen Wörter enthält. Nicht gezählt: Kommentare, <style>, Zeilen mit
 * console., Beschreibungen für das Sprachmodell (`.describe(`, `description:`), Adressen und einzelne kleingeschriebene
 * Schlüssel wie 'bremsflüssigkeit'.
 */

const WOERTER = [
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'und',
  'oder',
  'nicht',
  'kein',
  'keine',
  'ist',
  'sind',
  'wird',
  'werden',
  'wurde',
  'mit',
  'für',
  'von',
  'vom',
  'zum',
  'zur',
  'bitte',
  'Bitte',
  'noch',
  'alle',
  'ein',
  'eine',
  'einen',
  'auf',
  'aus',
  'bei',
  'nach',
  'Fahrzeug',
  'Fahrzeuge',
  'Rechnung',
  'Rechnungen',
  'Wartung',
  'Wartungen',
  'Werkstatt',
  'Datum',
  'Betrag',
  'Kosten',
  'Speichern',
  'Abbrechen',
  'Bearbeiten',
  'Schliessen',
  'Zurück',
  'Einstellungen',
  'Kilometerstand',
  'Verlauf',
  'Neu',
  'Neue',
  'Neues',
  'Erledigt',
  'Fehler',
  'Jahr',
  'Monate',
  'Wartungsplan',
  'Kontrollschild',
  'Marke',
  'Modell',
  'Baujahr',
  'Senden',
  'Eintragen',
  'Abmelden',
  'Nutzung',
  'Ja',
  'Nein',
]
const WORT = new RegExp(`(?:^|\\P{L})(?:${WOERTER.join('|')})(?=$|\\P{L})`, 'u')
const UMLAUT = /[äöüß]/i
const SCHLUESSEL = /^[a-zäöü_\d-]+$/
const ADRESSE = /^(?:https?:|mailto:|\/|\.\/|\.\.\/|[\w.+-]+@)/

function istDeutsch(text: string): boolean {
  const t = text.trim()
  if (!t || SCHLUESSEL.test(t) || ADRESSE.test(t))
    return false
  return UMLAUT.test(t) || WORT.test(t)
}

function ohneKommentare(quelle: string): string {
  return quelle
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`\w])\/\/.*$/gm, '$1')
    .split('\n')
    .filter(z => !/console\.|\.describe\(|\bdescription:/.test(z))
    .join('\n')
}

/** Deutsche Texte in Fundreihenfolge; Textknoten zuerst je Stelle, dann Zeichenketten */
export function deutscheTexte(quelle: string): string[] {
  const rein = ohneKommentare(quelle)
  const funde: { pos: number, text: string }[] = []

  // Zeichenketten: '…', "…", `…` (auch in Attributen und Template-Ausdrücken)
  const zeichenketten = /'((?:[^'\\\n]|\\.)*)'|"([^"\n]*)"|`((?:[^`\\]|\\.)*)`/g
  // Textknoten im Template: zwischen > und <, ohne {{ … }}
  const template = /<template[\s\S]*<\/template>/.exec(rein)
  if (template) {
    const start = template.index
    for (const m of template[0].matchAll(/>([^<>]+)</g)) {
      for (const teil of m[1]!.split(/\{\{[\s\S]*?\}\}/)) {
        if (istDeutsch(teil))
          funde.push({ pos: start + m.index!, text: teil.trim() })
      }
    }
  }
  for (const m of rein.matchAll(zeichenketten)) {
    const text = m[1] ?? m[2] ?? m[3] ?? ''
    // Attributwert mit Ausdruck: die inneren Zeichenketten zählen einzeln
    if (m[2] !== undefined && /'/.test(text)) {
      for (const innen of text.matchAll(/'((?:[^'\\]|\\.)*)'/g)) {
        if (istDeutsch(innen[1]!))
          funde.push({ pos: m.index! + innen.index!, text: innen[1]!.trim() })
      }
      continue
    }
    if (istDeutsch(text))
      funde.push({ pos: m.index!, text: text.trim() })
  }
  return funde.sort((a, b) => a.pos - b.pos).map(f => f.text)
}

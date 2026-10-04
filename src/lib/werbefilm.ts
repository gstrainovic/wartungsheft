/**
 * Reine Rechenschritte der Werbefilm-Montage (`scripts/werbefilm.ts`, Skill `werbefilm`): Abschnittslängen aus den
 * Sprechdauern, Satzgrenzen aus den Pausen der Sprecheraufnahme, Untertitel-Spur und SRT, Musikpegel unter der
 * Stimme und die Wahl des besseren von zwei Sprecher-Durchläufen. Ohne Datei- und Prozesszugriff, damit testbar.
 */

export interface Zeitraum {
  von: number
  bis: number
}

export interface Cue extends Zeitraum {
  text: string
}

/** Auf Millisekunden runden, sonst schleppen Summen wie 0.1 + 0.2 lange Nachkommastellen in Filter und SRT */
function ms(x: number): number {
  return Math.round(x * 1000) / 1000
}

/** Regieanweisungen für ElevenLabs (`[excited]`) werden nicht gesprochen und gehören nicht in den Untertitel */
export function ohneRegie(text: string): string {
  return text.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Sätze eines Sprechertexts, ohne Regie; ein Doppelpunkt trennt nicht */
export function saetze(text: string): string[] {
  return ohneRegie(text).split(/(?<=[.!?])\s+/).filter(s => s.length > 0)
}

/**
 * Wo in einer Sprecheraufnahme (Länge `dauer`) die einzelnen Sätze liegen. `stillen` sind die Pausen, die ffmpeg
 * `silencedetect` meldet. Stille am Anfang und Ende zählt nicht zum Sprechen; jede Satzgrenze liegt in der Pause,
 * die der nach Zeichenzahl erwarteten Stelle am nächsten ist. Ohne Pause wird nach Zeichenzahl geteilt.
 */
export function satzGrenzen(saetzeListe: string[], dauer: number, stillen: Zeitraum[]): Zeitraum[] {
  let anfang = 0
  let ende = dauer
  const innen: Zeitraum[] = []
  for (const s of stillen) {
    if (s.von <= 0.05)
      anfang = Math.max(anfang, s.bis)
    else if (s.bis >= dauer - 0.05)
      ende = Math.min(ende, s.von)
    else
      innen.push(s)
  }
  const laengen = saetzeListe.map(s => s.length)
  const gesamt = laengen.reduce((a, b) => a + b, 0) || 1
  const ergebnis: Zeitraum[] = []
  let von = anfang
  let zeichen = 0
  for (let i = 0; i < saetzeListe.length; i++) {
    if (i === saetzeListe.length - 1) {
      ergebnis.push({ von: ms(von), bis: ms(ende) })
      break
    }
    zeichen += laengen[i]!
    const erwartet = anfang + (ende - anfang) * zeichen / gesamt
    const spanne = (ende - anfang) * 0.25
    const kandidat = innen
      .filter(s => s.von > von && Math.abs((s.von + s.bis) / 2 - erwartet) <= spanne)
      .sort((a, b) => Math.abs((a.von + a.bis) / 2 - erwartet) - Math.abs((b.von + b.bis) / 2 - erwartet))[0]
    if (kandidat) {
      ergebnis.push({ von: ms(von), bis: ms(kandidat.von) })
      von = kandidat.bis
    }
    else {
      ergebnis.push({ von: ms(von), bis: ms(erwartet) })
      von = erwartet
    }
  }
  return ergebnis
}

/**
 * Sekunde in der Aufnahme, ab der ein Abschnitt läuft. Mit `vorEnde` vom Ende der Aufnahme gerechnet: Szenen mit
 * Scan dauern je Lauf verschieden lang, die Pausen danach sind fest.
 */
export function startInAufnahme(a: { start: number, vorEnde?: number }, laenge: number): number {
  return a.vorEnde === undefined ? a.start : ms(Math.max(0, laenge - a.vorEnde))
}

/** Länge eines Abschnitts: Einsatz, Sprechdauer und Luft danach, nie kürzer als das Minimum */
export function abschnittDauer(sprechdauer: number, minimum: number, vorlauf: number, nachlauf: number): number {
  return ms(Math.max(minimum, vorlauf + sprechdauer + nachlauf))
}

/** Beginn jedes Abschnitts im Film, wenn je zwei Abschnitte sich um `blende` Sekunden überblenden */
export function zeitplan(dauern: number[], blende: number): { starts: number[], laenge: number } {
  const starts: number[] = []
  let t = 0
  for (const [i, d] of dauern.entries()) {
    starts.push(ms(t))
    t += d - (i < dauern.length - 1 ? blende : 0)
  }
  return { starts, laenge: ms(t) }
}

export interface AbschnittTon {
  /** Beginn des Abschnitts im Film */
  start: number
  /** Einsatz des Sprechers nach Abschnittsbeginn */
  vorlauf: number
  /** Sätze mit ihrer Lage in der Sprecheraufnahme */
  saetze: Cue[]
}

/** Untertitel in Filmzeit: ab dem ersten Laut, kurz über den letzten hinaus, nie über den nächsten Satz */
export function untertitelSpur(abschnitte: AbschnittTon[], opt: { nachhalten: number, mindestens: number }): Cue[] {
  const roh: Cue[] = []
  for (const a of abschnitte) {
    for (const s of a.saetze) {
      const von = a.start + a.vorlauf + s.von
      const bis = Math.max(a.start + a.vorlauf + s.bis + opt.nachhalten, von + opt.mindestens)
      roh.push({ von, bis, text: s.text })
    }
  }
  return roh.map((c, i) => {
    const naechster = roh[i + 1]
    const bis = naechster ? Math.min(c.bis, naechster.von - 0.05) : c.bis
    return { von: ms(c.von), bis: ms(bis), text: c.text }
  })
}

/** Höchstens zwei möglichst gleich lange Zeilen; sehr lange Texte werden fortlaufend umbrochen */
export function zeilenUmbruch(text: string, breite: number): string[] {
  if (text.length <= breite)
    return [text]
  const woerter = text.split(' ')
  if (text.length <= breite * 2) {
    let beste: string[] = [text]
    let besteMax = Infinity
    for (let i = 1; i < woerter.length; i++) {
      const a = woerter.slice(0, i).join(' ')
      const b = woerter.slice(i).join(' ')
      const m = Math.max(a.length, b.length)
      if (m < besteMax) {
        besteMax = m
        beste = [a, b]
      }
    }
    if (besteMax <= breite)
      return beste
  }
  const zeilen: string[] = []
  let zeile = ''
  for (const w of woerter) {
    if (zeile && (`${zeile} ${w}`).length > breite) {
      zeilen.push(zeile)
      zeile = w
    }
    else {
      zeile = zeile ? `${zeile} ${w}` : w
    }
  }
  if (zeile)
    zeilen.push(zeile)
  return zeilen
}

function srtZeit(s: number): string {
  const t = Math.round(s * 1000)
  const z = (n: number, l = 2): string => String(n).padStart(l, '0')
  return `${z(Math.floor(t / 3_600_000))}:${z(Math.floor(t / 60_000) % 60)}:${z(Math.floor(t / 1000) % 60)},${z(t % 1000, 3)}`
}

/** Untertitelspur für YouTube (SRT) */
export function srt(cues: Cue[]): string {
  return `${cues.map((c, i) => `${i + 1}\n${srtZeit(c.von)} --> ${srtZeit(c.bis)}\n${zeilenUmbruch(c.text, 42).join('\n')}`).join('\n\n')}\n`
}

/** Sprechstellen mit kurzer Pause dazwischen zusammenfassen, sonst hebt und senkt sich die Musik in jeder Atempause */
export function sprechzeitenZusammenfassen(zeiten: Zeitraum[], luecke: number): Zeitraum[] {
  const sortiert = [...zeiten].sort((a, b) => a.von - b.von)
  const ergebnis: Zeitraum[] = []
  for (const z of sortiert) {
    const letzte = ergebnis[ergebnis.length - 1]
    if (letzte && z.von - letzte.bis <= luecke)
      letzte.bis = Math.max(letzte.bis, z.bis)
    else
      ergebnis.push({ ...z })
  }
  return ergebnis
}

/**
 * Lautstärke der Musik als ffmpeg-Ausdruck für `volume=...:eval=frame`: Grundpegel, unter der Stimme abgesenkt,
 * mit Rampen von `rampe` Sekunden davor und danach.
 */
export function musikAusdruck(sprechzeiten: Zeitraum[], opt: { grund: number, unter: number, rampe: number }): string {
  const grund = String(ms(opt.grund))
  if (sprechzeiten.length === 0)
    return grund
  const r = String(ms(opt.rampe))
  const stellen = sprechzeiten.map(z =>
    `clip(min((t-${ms(z.von - opt.rampe)})/${r},(${ms(z.bis + opt.rampe)}-t)/${r}),0,1)`)
  const absenkung = stellen.reduce((acc, s) => `max(${acc},${s})`)
  return `${grund}-${ms(opt.grund - opt.unter)}*${absenkung}`
}

const ZAHLWOERTER: Record<string, string> = {
  fuenfundzwanzig: '25',
  fünfundzwanzig: '25',
  dreissig: '30',
  sechsunddreissig: '36',
  vingtcinq: '25',
  trente: '30',
  trentesix: '36',
  venticinque: '25',
  trenta: '30',
  trentasei: '36',
  twentyfive: '25',
  thirty: '30',
  thirtysix: '36',
}

function woerter(text: string): string[] {
  return ohneRegie(text).toLowerCase().replace(/ß/g, 'ss').replace(/-/g, '').split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 0).map(w => ZAHLWOERTER[w] ?? w)
}

/** Wörter des Sprechertexts, die in der Spracherkennung fehlen (Mehrfachvorkommen zählen einzeln) */
export function wortfehler(text: string, erkannt: string): number {
  const vorrat = new Map<string, number>()
  for (const w of woerter(erkannt))
    vorrat.set(w, (vorrat.get(w) ?? 0) + 1)
  let fehler = 0
  for (const w of woerter(text)) {
    const n = vorrat.get(w) ?? 0
    if (n > 0)
      vorrat.set(w, n - 1)
    else
      fehler++
  }
  return fehler
}

export interface DurchlaufMessung {
  /** längste Pause mitten im Text in Sekunden */
  laengsteStille: number
  /** Lautheitsspanne (LRA aus ffmpeg ebur128) in LU: klein heisst gleichmässig */
  lautheitsSpanne: number
  /** Wörter, die die Spracherkennung anders hört als geschrieben (vor allem Zahlen); fehlt ohne Erkennung */
  wortfehler?: number
}

/** Index des besseren Durchlaufs: kein Aussetzer, alle Wörter verständlich, gleichmässige Lautstärke */
export function besterDurchlauf(messungen: DurchlaufMessung[]): number {
  const wert = (m: DurchlaufMessung): number =>
    (m.laengsteStille > 0.8 ? 10 : 0) + (m.wortfehler ?? 0) * 5 + m.lautheitsSpanne
  let beste = 0
  for (const [i, m] of messungen.entries()) {
    if (wert(m) < wert(messungen[beste]!))
      beste = i
  }
  return beste
}

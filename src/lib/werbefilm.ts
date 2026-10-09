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
  // Nur gewöhnlichen Leerraum zusammenfassen: das geschützte Leerzeichen vor ? ! : (Französisch) bleibt stehen
  return text.replace(/\[[^\]]*\]/g, ' ').replace(/[ \t\r\n]+/g, ' ').trim()
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

/**
 * Stumme Fassung zur Freigabe (Bild und Text ohne Sprecher, keine Credits): Sprechdauer aus der Wortzahl geschätzt,
 * die Szene nie kürzer als der Clip ab seinem Start (`verfuegbar`). Die Sätze verteilen sich nach Zeichenzahl über
 * die Szene ohne Einsatz und Luft, Zeiten ab Einsatz wie bei `satzGrenzen`.
 */
export function stummeLage(text: string, verfuegbar: number, opt: { woerterProSekunde: number, vorlauf: number, nachlauf: number }): { dauer: number, saetze: Cue[] } {
  const liste = saetze(text)
  if (!liste.length)
    return { dauer: ms(verfuegbar), saetze: [] }
  const woerter = ohneRegie(text).split(' ').length
  const dauer = abschnittDauer(woerter / opt.woerterProSekunde, verfuegbar, opt.vorlauf, opt.nachlauf)
  const flaeche = dauer - opt.vorlauf - opt.nachlauf
  return { dauer, saetze: satzGrenzen(liste, flaeche, []).map((g, i) => ({ ...g, text: liste[i]! })) }
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

/**
 * Untertitelspur für die Website (WebVTT, `<track>` in LandingVideo.vue): ohne festen Umbruch, weil der Film am
 * Handy nur 390 px breit ist und der Browser selbst umbricht
 */
export function vtt(cues: Cue[]): string {
  const zeit = (s: number): string => srtZeit(s).replace(',', '.')
  const text = (t: string): string => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `WEBVTT\n\n${cues.map(c => `${zeit(c.von)} --> ${zeit(c.bis)}\n${text(c.text)}`).join('\n\n')}\n`
}

/**
 * Stumme Fassung (Tutorial zur Freigabe): Untertitel nie eingebrannt, sondern als abschaltbare Spur (mov_text,
 * deutsch) in der MP4 und als VTT und SRT daneben. Liefert die ffmpeg-Argumente (libx264) und die Textdateien.
 */
export function stummeFassung(bild: string, ziel: string, cues: Cue[]): { ffmpeg: string[], dateien: Record<string, string> } {
  const srtDatei = `${ziel}.srt`
  return {
    ffmpeg: ['-i', bild, '-i', srtDatei, '-map', '0:v', '-map', '1:s', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-g', '60', '-c:s', 'mov_text', '-metadata:s:s:0', 'language=deu', '-movflags', '+faststart', `${ziel}.mp4`],
    dateien: { [`${ziel}.vtt`]: vtt(cues), [srtDatei]: srt(cues) },
  }
}

/**
 * Vertonte Fassung (Tutorial, Handy und Desktop): Bild H.264 High, Ton AAC, Untertitel nie eingebrannt, sondern als
 * abschaltbare Spur (mov_text, deutsch) in der MP4 und als VTT und SRT daneben. `crf` hält die Datei unter 10 MB.
 */
export function vertonteFassung(bild: string, ton: string, ziel: string, cues: Cue[], crf = 26): { ffmpeg: string[], dateien: Record<string, string> } {
  const srtDatei = `${ziel}.srt`
  return {
    ffmpeg: ['-i', bild, '-i', ton, '-i', srtDatei, '-map', '0:v', '-map', '1:a', '-map', '2:s', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-g', '60', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-c:s', 'mov_text', '-metadata:s:a:0', 'language=deu', '-metadata:s:s:0', 'language=deu', '-movflags', '+faststart', `${ziel}.mp4`],
    dateien: { [`${ziel}.vtt`]: vtt(cues), [srtDatei]: srt(cues) },
  }
}

/**
 * Sekunde in der Aufnahme, ab der jeder Teil läuft (Tutorial: Teile ab Marken, Länge aus der Sprechdauer). Ein Teil
 * beginnt an seiner Marke; spricht der vorige Teil desselben Clips darüber hinaus, setzt er nahtlos dort an, wo
 * der vorige ohne Überblendung steht, damit kein Bild doppelt kommt.
 */
export function aufnahmeStarts(teile: { clip: string, marke: number }[], dauern: number[], blende: number): number[] {
  const starts: number[] = []
  teile.forEach((t, i) => {
    const vorher = teile[i - 1]
    const weiter = vorher?.clip === t.clip ? starts[i - 1]! + dauern[i - 1]! - blende : 0
    starts.push(ms(Math.max(t.marke, weiter)))
  })
  return starts
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

/** Ausschnitt der Aufnahme: Mittelpunkt relativ zum Bild (0–1), Vergrösserung, optional Kamerafahrt nach `bisX` */
export interface Blick { x: number, y: number, s: number, bisX?: number }

/**
 * ffmpeg-crop für eine Aufnahme `breite`×`hoehe`, die auf `w`×`h` skaliert wird: Seitenverhältnis des Ziels, durch
 * `s` verkleinert, um den Mittelpunkt gelegt und am Rand gehalten. Mit `bisX` fährt der Ausschnitt in `dauer`
 * Sekunden gleichmässig vom Start- zum Zielpunkt (für Zeilen, die breiter sind als der Ausschnitt).
 */
export function ausschnitt(breite: number, hoehe: number, blick: Blick | undefined, w: number, h: number, dauer: number): string {
  const ziel = w / h
  let cw = breite
  let ch = cw / ziel
  if (ch > hoehe) {
    ch = hoehe
    cw = ch * ziel
  }
  // Abrunden auf gerade Pixel: aufgerundet wäre der Ausschnitt um ein Pixel grösser als die Aufnahme (2080 > 2079)
  const s = blick?.s ?? 1
  cw = Math.floor(cw / s / 2) * 2
  ch = Math.floor(ch / s / 2) * 2
  const links = (mitte: number) => Math.min(Math.max(0, Math.round(mitte * breite - cw / 2)), breite - cw)
  const x = links(blick?.x ?? 0.5)
  const y = Math.min(Math.max(0, Math.round((blick?.y ?? 0.5) * hoehe - ch / 2)), hoehe - ch)
  if (blick?.bisX === undefined)
    return `crop=${cw}:${ch}:${x}:${y}`
  return `crop=${cw}:${ch}:'${x}+${links(blick.bisX) - x}*min(1,t/${ms(dauer)})':${y}`
}

/** Geräusch zu einer Aktion im Bild (Klick, Glocke), `bei` Sekunden nach Beginn bzw. vor Ende des Abschnitts */
export interface Effekt { datei: string, bei: number, vonEnde?: boolean, pegel: number }

/** Effekte aller Abschnitte auf der Filmzeit, aus Abschnittsbeginn (`starts`) und -länge (`dauern`) */
export function effektZeiten(abschnitte: { effekte?: Effekt[] }[], starts: number[], dauern: number[]): { datei: string, sekunde: number, pegel: number }[] {
  return abschnitte.flatMap((a, i) => (a.effekte ?? []).map(e => ({
    datei: e.datei,
    sekunde: ms(e.vonEnde ? starts[i]! + dauern[i]! - e.bei : starts[i]! + e.bei),
    pegel: e.pegel,
  })))
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

/**
 * Welche Durchläufe für einen Sprechertext gebraucht werden: neu zwei zum Vergleich, mit fester Wahl
 * (`video-scripts/sprecher-auswahl.json`) nur der gewählte, damit eine übernommene Aufnahme keinen zweiten kostet
 */
export function durchlaeufe(gewaehlt: number | undefined): number[] {
  return gewaehlt ? [gewaehlt] : [1, 2]
}

/**
 * Masse und Rechnungen für die Inline-Grafiken der Angebotsseiten (GrafikAblauf.vue, GrafikVorherNachher.vue),
 * übernommen aus strainovic-it.ch (app/utils/grafik.ts). SVG bricht Text nicht selbst um, deshalb schätzt
 * `umbrechen` die Zeilen über eine mittlere Zeichenbreite. Jede Grafik gibt es breit (680) und schmal (340):
 * die breite liest sich auf dem Desktop etwa in Originalgrösse, die schmale auf dem Telefon.
 * Bewusst ohne Vue, damit `grafik.test.ts` die Kästen je Sprache ohne Rendern prüfen kann.
 */

export const GRAFIK = {
  breit: 680,
  schmal: 340,
  innen: 12, // Innenabstand der Kästen
  rundung: 6,
  pfeil: 32, // Platz für einen Pfeil zwischen zwei Kästen
  // Schriftgrössen: oben die Rolle (Mono), unten der Inhalt (Inter, halbfett)
  oben: 11,
  unten: 14,
  // Mittlere Zeichenbreite in em: JetBrains Mono exakt 0.6, Inter halbfett knapp darunter
  monoBreite: 0.6,
  sansBreite: 0.58,
} as const

export type GrafikArt = 'breit' | 'schmal'

export interface GrafikText {
  x: number
  y: number
  text: string
  klasse: string
}

export interface GrafikKasten {
  x: number
  y: number
  b: number
  h: number
  klasse: string
  texte: GrafikText[]
  symbol?: string
}

export interface GrafikPfeil {
  linie: string
  spitze: string
}

export interface GrafikLayout {
  b: number
  h: number
  kaesten: GrafikKasten[]
  pfeile: GrafikPfeil[]
}

export interface AblaufSchritt {
  ort: string
  text: string
  /** Schritt, den Wartungsheft selbst erledigt: einziger in der Akzentfarbe */
  eigen?: boolean
}

export interface VorherNachher {
  bisher: string
  neu: string
  zeilen: { bisher: string, neu: string }[]
}

// Auf eine Nachkommastelle, damit das SVG klein bleibt
const r = (n: number) => Math.round(n * 10) / 10

/** Bricht an Leerzeichen um; ein Wort, das allein zu lang ist, darf nach einem Bindestrich brechen */
export function umbrechen(text: string, zeichen: number): string[] {
  const teile: { wort: string, leer: boolean }[] = []
  for (const wort of text.split(/\s+/).filter(Boolean)) {
    const stuecke = wort.length > zeichen ? wort.split(/(?<=-)/) : [wort]
    stuecke.forEach((s, i) => teile.push({ wort: s, leer: i === 0 }))
  }
  const zeilen: string[] = []
  let zeile = ''
  for (const { wort, leer } of teile) {
    const neu = zeile ? zeile + (leer ? ' ' : '') + wort : wort
    if (zeile && neu.length > zeichen) {
      zeilen.push(zeile)
      zeile = wort
    }
    else {
      zeile = neu
    }
  }
  if (zeile)
    zeilen.push(zeile)
  return zeilen
}

/** Kasten mit Rolle oben (Mono, gedämpft) und Inhalt darunter; mit Symbol rückt die Rolle ein */
function kasten(x: number, y: number, b: number, oben: string, unten: string, klasse: string, symbol?: 'kreuz' | 'haken'): GrafikKasten {
  const { innen, oben: go, unten: gu, monoBreite, sansBreite } = GRAFIK
  const einzug = symbol ? 16 : 0
  const breite = b - 2 * innen
  const obenZeilen = umbrechen(oben, Math.floor((breite - einzug) / (go * monoBreite)))
  const untenZeilen = umbrechen(unten, Math.floor(breite / (gu * sansBreite)))
  const texte: GrafikText[] = []
  let grund = y + innen + go
  obenZeilen.forEach((text, i) => {
    if (i)
      grund += go * 1.35
    texte.push({ x: r(x + innen + einzug), y: r(grund), text, klasse: 'g-oben' })
  })
  grund += 8
  untenZeilen.forEach((text) => {
    grund += gu * 1.35
    texte.push({ x: r(x + innen), y: r(grund - gu * 0.35), text, klasse: 'g-unten' })
  })
  const h = grund - y + innen - gu * 0.1
  // Symbol auf Höhe der ersten Rollenzeile, 8 × 8
  const sx = x + innen
  const sy = y + innen + go - 8
  const pfad = symbol === 'kreuz'
    ? `M${r(sx)} ${r(sy)}l8 8m0-8l-8 8`
    : symbol === 'haken' ? `M${r(sx)} ${r(sy + 4.5)}l3 3l5.5-7` : undefined
  return { x: r(x), y: r(y), b: r(b), h: r(h), klasse, texte, symbol: pfad }
}

/** Kästen einer Reihe auf gleiche Höhe bringen */
function gleichHoch(kaesten: GrafikKasten[]): number {
  const h = Math.max(...kaesten.map(k => k.h))
  for (const k of kaesten)
    k.h = h
  return h
}

// Pfeil als Linie plus gefüllte Spitze, ohne <marker>: Marker bräuchten ids, die sich bei zwei Grafiken wiederholen
function pfeilQuer(x1: number, x2: number, y: number): GrafikPfeil {
  return { linie: `M${r(x1)} ${r(y)}H${r(x2 - 6)}`, spitze: `M${r(x2 - 7)} ${r(y - 4.5)}L${r(x2)} ${r(y)}L${r(x2 - 7)} ${r(y + 4.5)}Z` }
}

function pfeilRunter(x: number, y1: number, y2: number): GrafikPfeil {
  return { linie: `M${r(x)} ${r(y1)}V${r(y2 - 6)}`, spitze: `M${r(x - 4.5)} ${r(y2 - 7)}L${r(x)} ${r(y2)}L${r(x + 4.5)} ${r(y2 - 7)}Z` }
}

/** Ablauf: breit eine Reihe von links nach rechts, schmal untereinander mit Pfeilen nach unten */
export function ablaufLayout(schritte: AblaufSchritt[], art: GrafikArt): GrafikLayout {
  const klasse = (s: AblaufSchritt) => (s.eigen ? 'g-kasten g-kasten-eigen' : 'g-kasten')
  if (art === 'breit') {
    const n = schritte.length
    const b = (GRAFIK.breit - (n - 1) * GRAFIK.pfeil) / n
    const kaesten = schritte.map((s, i) => kasten(i * (b + GRAFIK.pfeil) + 1, 1, b - 2, s.ort, s.text, klasse(s)))
    const h = gleichHoch(kaesten)
    const pfeile = kaesten.slice(1).map((k, i) => pfeilQuer(kaesten[i]!.x + kaesten[i]!.b + 5, k.x - 5, 1 + h / 2))
    return { b: GRAFIK.breit, h: r(h + 2), kaesten, pfeile }
  }
  const kaesten: GrafikKasten[] = []
  const pfeile: GrafikPfeil[] = []
  let y = 1
  for (const s of schritte) {
    if (kaesten.length) {
      pfeile.push(pfeilRunter(GRAFIK.schmal / 2, y + 4, y + 26))
      y += 30
    }
    const k = kasten(1, y, GRAFIK.schmal - 2, s.ort, s.text, klasse(s))
    kaesten.push(k)
    y += k.h
  }
  return { b: GRAFIK.schmal, h: r(y + 1), kaesten, pfeile }
}

/** Vorher/Nachher: links (oben) der bisherige Zustand mit Kreuz, rechts (unten) der mit Wartungsheft mit Haken */
export function vorherNachherLayout(v: VorherNachher, art: GrafikArt): GrafikLayout {
  const kaesten: GrafikKasten[] = []
  const pfeile: GrafikPfeil[] = []
  let y = 1
  if (art === 'breit') {
    const b = (GRAFIK.breit - GRAFIK.pfeil) / 2
    for (const z of v.zeilen) {
      if (kaesten.length)
        y += 10
      const reihe = [
        kasten(1, y, b - 2, v.bisher, z.bisher, 'g-kasten g-kasten-bisher', 'kreuz'),
        kasten(b + GRAFIK.pfeil + 1, y, b - 2, v.neu, z.neu, 'g-kasten g-kasten-eigen', 'haken'),
      ]
      const h = gleichHoch(reihe)
      pfeile.push(pfeilQuer(b + 4, b + GRAFIK.pfeil - 4, y + h / 2))
      kaesten.push(...reihe)
      y += h
    }
    return { b: GRAFIK.breit, h: r(y + 1), kaesten, pfeile }
  }
  for (const z of v.zeilen) {
    if (kaesten.length)
      y += 18
    const oben = kasten(1, y, GRAFIK.schmal - 2, v.bisher, z.bisher, 'g-kasten g-kasten-bisher', 'kreuz')
    y += oben.h
    pfeile.push(pfeilRunter(GRAFIK.schmal / 2, y + 3, y + 21))
    y += 24
    const unten = kasten(1, y, GRAFIK.schmal - 2, v.neu, z.neu, 'g-kasten g-kasten-eigen', 'haken')
    y += unten.h
    kaesten.push(oben, unten)
  }
  return { b: GRAFIK.schmal, h: r(y + 1), kaesten, pfeile }
}

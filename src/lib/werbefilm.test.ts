import { describe, expect, it } from 'vitest'
import {
  abschnittDauer,
  besterDurchlauf,
  musikAusdruck,
  ohneRegie,
  saetze,
  satzGrenzen,
  sprechzeitenZusammenfassen,
  srt,
  startInAufnahme,
  untertitelSpur,
  wortfehler,
  zeilenUmbruch,
  zeitplan,
} from './werbefilm'

describe('ohneRegie', () => {
  it('entfernt Regieanweisungen in eckigen Klammern und doppelte Leerzeichen', () => {
    expect(ohneRegie('[excited] Montagmorgen im Betrieb.  [enthusiastic] Los!')).toBe('Montagmorgen im Betrieb. Los!')
  })
})

describe('saetze', () => {
  it('trennt nach Punkt, Ausrufe- und Fragezeichen, Regie bleibt beim Satz', () => {
    expect(saetze('[excited] Montagmorgen im Betrieb. Welcher Lieferwagen muss zum Service?'))
      .toEqual(['Montagmorgen im Betrieb.', 'Welcher Lieferwagen muss zum Service?'])
  })

  it('trennt nicht nach einem Doppelpunkt', () => {
    expect(saetze('Der Käufer fragt: Gibt es ein Serviceheft?')).toEqual(['Der Käufer fragt: Gibt es ein Serviceheft?'])
  })
})

describe('satzGrenzen', () => {
  it('ohne Stille: ganze Sprechdauer für einen Satz, Stille am Anfang und Ende abgezogen', () => {
    const grenzen = satzGrenzen(['Und du suchst.'], 2, [{ von: 0, bis: 0.1 }, { von: 1.6, bis: 2 }])
    expect(grenzen).toEqual([{ von: 0.1, bis: 1.6 }])
  })

  it('legt die Grenze in die Pause, die der erwarteten Stelle am nächsten liegt', () => {
    // zwei gleich lange Sätze: erwartet um 5 s, die Pause bei 4.8–5.3 gewinnt gegen die kurze bei 2.0
    const grenzen = satzGrenzen(['Aaaa aaaa aaaa.', 'Bbbb bbbb bbbb.'], 10, [{ von: 2, bis: 2.25 }, { von: 4.8, bis: 5.3 }])
    expect(grenzen).toEqual([{ von: 0, bis: 4.8 }, { von: 5.3, bis: 10 }])
  })

  it('ohne passende Pause teilt es nach Zeichenzahl', () => {
    const grenzen = satzGrenzen(['Aaaa.', 'Bbbbbbbbbbbbbbb.'], 7, [])
    expect(grenzen[0]!.von).toBe(0)
    expect(grenzen[0]!.bis).toBeCloseTo(7 * 5 / 21, 3)
    expect(grenzen[1]!.bis).toBe(7)
  })
})

describe('abschnittDauer', () => {
  it('wächst mit der Sprechdauer, nie unter das Minimum', () => {
    expect(abschnittDauer(2, 5, 0.3, 1.2)).toBe(5)
    expect(abschnittDauer(6, 5, 0.3, 1.2)).toBeCloseTo(7.5, 6)
  })
})

describe('startInAufnahme', () => {
  it('nimmt die feste Sekunde, wenn kein Abstand zum Ende verlangt ist', () => {
    expect(startInAufnahme({ start: 4.5 }, 12.5)).toBe(4.5)
  })

  it('rechnet vom Ende der Aufnahme zurück, damit ein langsamer Scan den Ausschnitt nicht verschiebt', () => {
    expect(startInAufnahme({ start: 4.5, vorEnde: 8 }, 12.5)).toBe(4.5)
    expect(startInAufnahme({ start: 4.5, vorEnde: 8 }, 17.6)).toBe(9.6)
    expect(startInAufnahme({ start: 0, vorEnde: 8 }, 6)).toBe(0)
  })
})

describe('zeitplan', () => {
  it('rechnet die Überblendung von jedem Abschnittsbeginn ab', () => {
    expect(zeitplan([5, 6, 4], 0.5)).toEqual({ starts: [0, 4.5, 10], laenge: 14 })
  })
})

describe('untertitelSpur', () => {
  it('setzt die Sätze auf die Filmzeit und hält sie kurz nach dem letzten Laut', () => {
    const spur = untertitelSpur([
      { start: 0, vorlauf: 0.3, saetze: [{ text: 'Eins.', von: 0.1, bis: 1.5 }, { text: 'Zwei.', von: 1.9, bis: 3 }] },
      { start: 4.5, vorlauf: 0.3, saetze: [{ text: 'Drei.', von: 0, bis: 2 }] },
    ], { nachhalten: 0.4, mindestens: 1 })
    expect(spur).toEqual([
      { von: 0.4, bis: 2.15, text: 'Eins.' },
      { von: 2.2, bis: 3.7, text: 'Zwei.' },
      { von: 4.8, bis: 7.2, text: 'Drei.' },
    ])
  })

  it('zeigt einen sehr kurzen Satz mindestens so lange wie verlangt', () => {
    const spur = untertitelSpur([{ start: 10, vorlauf: 0.3, saetze: [{ text: 'Alles da.', von: 0, bis: 0.5 }] }], { nachhalten: 0.2, mindestens: 1.5 })
    expect(spur).toEqual([{ von: 10.3, bis: 11.8, text: 'Alles da.' }])
  })
})

describe('zeilenUmbruch', () => {
  it('bricht in höchstens zwei ausgewogene Zeilen um', () => {
    expect(zeilenUmbruch('Ab heute nicht mehr: Rechnung fotografieren genügt.', 42))
      .toEqual(['Ab heute nicht mehr: Rechnung', 'fotografieren genügt.'])
    expect(zeilenUmbruch('Alles da.', 42)).toEqual(['Alles da.'])
  })
})

describe('srt', () => {
  it('schreibt nummerierte Blöcke mit Komma vor den Millisekunden', () => {
    expect(srt([{ von: 0.4, bis: 2.15, text: 'Eins.' }, { von: 61.25, bis: 63, text: 'Zwei.' }])).toBe(
      '1\n00:00:00,400 --> 00:00:02,150\nEins.\n\n2\n00:01:01,250 --> 00:01:03,000\nZwei.\n',
    )
  })
})

describe('sprechzeitenZusammenfassen', () => {
  it('fasst Sprechstellen mit kurzer Pause zusammen, damit die Musik nicht pumpt', () => {
    expect(sprechzeitenZusammenfassen([{ von: 1, bis: 3 }, { von: 3.5, bis: 5 }, { von: 8, bis: 9 }], 1.2))
      .toEqual([{ von: 1, bis: 5 }, { von: 8, bis: 9 }])
  })
})

describe('musikAusdruck', () => {
  it('ohne Sprecher bleibt die Musik auf dem Grundpegel', () => {
    expect(musikAusdruck([], { grund: 0.2, unter: 0.05, rampe: 0.4 })).toBe('0.2')
  })

  it('senkt unter der Stimme mit Rampen ab (ffmpeg-Ausdruck für volume, eval=frame)', () => {
    expect(musikAusdruck([{ von: 2, bis: 5 }], { grund: 0.2, unter: 0.05, rampe: 0.4 }))
      .toBe('0.2-0.15*clip(min((t-1.6)/0.4,(5.4-t)/0.4),0,1)')
  })

  it('nimmt bei mehreren Stellen das Maximum der Absenkung', () => {
    expect(musikAusdruck([{ von: 2, bis: 5 }, { von: 8, bis: 9 }], { grund: 0.2, unter: 0.05, rampe: 0.4 }))
      .toBe('0.2-0.15*max(clip(min((t-1.6)/0.4,(5.4-t)/0.4),0,1),clip(min((t-7.6)/0.4,(9.4-t)/0.4),0,1))')
  })
})

describe('wortfehler', () => {
  it('zählt Wörter des Texts, die die Erkennung nicht hört; Zahlen als Ziffern oder Wörter gelten gleich', () => {
    expect(wortfehler('[excited] 36 Franken pro Fahrzeug und Jahr!', 'Sechsunddreißig Franken pro Fahrzeug und Jahr.')).toBe(0)
    expect(wortfehler('30 Tage gratis testen!', '13 Tage gratis testen')).toBe(1)
    expect(wortfehler('Gibt es ein Serviceheft?', 'Gibt es ein Service-Heft?')).toBe(0)
  })

  it('kennt die Zahlwörter auf Französisch, Italienisch und Englisch', () => {
    expect(wortfehler('36 francs. 30 jours, 25 francs', 'Trente-six francs. Trente jours, vingt-cinq francs')).toBe(0)
    expect(wortfehler('36 franchi. 30 giorni, 25 franchi', 'Trentasei franchi. Trenta giorni, venticinque franchi')).toBe(0)
    expect(wortfehler('36 francs. 30 days, 25 francs', 'Thirty-six francs. Thirty days, twenty-five francs')).toBe(0)
  })
})

describe('besterDurchlauf', () => {
  it('meidet Aussetzer (lange Stille mitten im Satz)', () => {
    expect(besterDurchlauf([
      { laengsteStille: 1.1, lautheitsSpanne: 2 },
      { laengsteStille: 0.4, lautheitsSpanne: 3 },
    ])).toBe(1)
  })

  it('nimmt sonst die gleichmässigere Lautstärke', () => {
    expect(besterDurchlauf([
      { laengsteStille: 0.3, lautheitsSpanne: 4.5 },
      { laengsteStille: 0.4, lautheitsSpanne: 2.1 },
    ])).toBe(1)
  })

  it('gewichtet falsch erkannte Wörter (Zahlen) schwerer als die Lautstärke', () => {
    expect(besterDurchlauf([
      { laengsteStille: 0.3, lautheitsSpanne: 1, wortfehler: 1 },
      { laengsteStille: 0.3, lautheitsSpanne: 4, wortfehler: 0 },
    ])).toBe(1)
  })
})

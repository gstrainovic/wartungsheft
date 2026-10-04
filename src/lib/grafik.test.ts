import { describe, expect, it } from 'vitest'
import anlagenTexte from '../texte/anlagen'
import { ablaufLayout, GRAFIK, umbrechen, vorherNachherLayout } from './grafik'
import { SPRACHEN } from './sprache'

describe('umbrechen', () => {
  it('bricht an Leerzeichen, ohne die Zeichenzahl zu überschreiten', () => {
    expect(umbrechen('Eine Liste mit allen Fristen', 12)).toEqual(['Eine Liste', 'mit allen', 'Fristen'])
  })

  it('bricht ein zu langes Wort nach dem Bindestrich', () => {
    expect(umbrechen('Excel-Listen', 8)).toEqual(['Excel-', 'Listen'])
  })
})

describe('grafiken der Anlagen-Seite: kein Text ragt aus seinem Kasten', () => {
  const { innen, oben, unten, monoBreite, sansBreite } = GRAFIK

  for (const { code } of SPRACHEN) {
    const t = anlagenTexte[code]
    const layouts = {
      'ablauf breit': ablaufLayout(t.ablauf.schritte, 'breit'),
      'ablauf schmal': ablaufLayout(t.ablauf.schritte, 'schmal'),
      'vorher/nachher breit': vorherNachherLayout(t.vorherNachher, 'breit'),
      'vorher/nachher schmal': vorherNachherLayout(t.vorherNachher, 'schmal'),
    }
    for (const [name, g] of Object.entries(layouts)) {
      it(`${code}: ${name}`, () => {
        for (const k of g.kaesten) {
          expect(k.x + k.b, `${name}: Kasten rechts`).toBeLessThanOrEqual(g.b)
          expect(k.y + k.h, `${name}: Kasten unten`).toBeLessThanOrEqual(g.h)
          for (const z of k.texte) {
            const breite = z.text.length * (z.klasse === 'g-oben' ? oben * monoBreite : unten * sansBreite)
            expect(z.x + breite, `${name}: «${z.text}»`).toBeLessThanOrEqual(k.x + k.b - innen + 0.5)
            expect(z.y, `${name}: «${z.text}» unten`).toBeLessThanOrEqual(k.y + k.h - innen / 2)
          }
        }
      })
    }
  }
})

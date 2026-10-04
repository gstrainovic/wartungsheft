import { describe, expect, it } from 'vitest'
import { deutscheTexte } from './deutsch-finden'

describe('deutscheTexte (Heuristik für fest eingebaute deutsche Texte)', () => {
  it('findet Textknoten und Attribute im Template', () => {
    const vue = `<template>
  <h2>Fahrzeuge</h2>
  <Button label="Speichern" icon="pi pi-check" />
  <p>{{ t.titel }}</p>
  <InputText placeholder="z. B. Garage Müller" />
</template>`
    expect(deutscheTexte(vue)).toEqual(['Fahrzeuge', 'Speichern', 'z. B. Garage Müller'])
  })

  it('findet Zeichenketten im Script, auch in Ausdrücken', () => {
    const vue = `<script setup lang="ts">
const titel = ref('Neue Rechnung')
toast.add({ summary: \`\${n} Wartungen eingetragen\` })
const key = 'bremsflüssigkeit'
</script>
<template><Button :label="offen ? 'Schliessen' : t.oeffnen" /></template>`
    expect(deutscheTexte(vue)).toEqual(['Neue Rechnung', `\${n} Wartungen eingetragen`, 'Schliessen'])
  })

  it('übergeht Kommentare, Konsole, Stile, Prompt-Beschreibungen und Schlüssel', () => {
    const ts = `// Rechnung für das Fahrzeug speichern
/* Wartung über die Rechnung */
console.error('Fehler beim Speichern der Rechnung', err)
const s = z.string().describe('Datum der Rechnung')
const tool = { description: 'Fahrzeug anlegen' }
const url = 'https://wartungsheft.ch/hilfe'
const k = 'oelwechsel'
<style>.a::after { content: 'Über'; }</style>`
    expect(deutscheTexte(ts)).toEqual([])
  })

  it('lässt englische und neutrale Texte stehen', () => {
    expect(deutscheTexte(`<template><span>km</span><Button label="OK" /><i class="pi pi-car" /></template>`)).toEqual([])
    expect(deutscheTexte(`const a = 'The vehicle was saved'`)).toEqual([])
  })
})

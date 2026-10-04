<script setup lang="ts">
import type { VorherNachher } from '../lib/grafik'
import { computed, useId } from 'vue'
import { GRAFIK, vorherNachherLayout } from '../lib/grafik'

// Vorher/Nachher-Leiste (Vorbild: ProduktVorherNachher.vue auf strainovic-it.ch). Zeigt nur, was die Seite im
// Text schon sagt: links der bisherige Zustand, gedämpft und mit Kreuz, rechts der mit Wartungsheft, mit Haken
// und Akzentfarbe. Beschriftungen als Props aus src/texte/.
const props = defineProps<{ titel: string } & VorherNachher>()
const id = useId()
const grafiken = computed(() => ({ breit: vorherNachherLayout(props, 'breit'), schmal: vorherNachherLayout(props, 'schmal') }))
</script>

<template>
  <figure class="grafik">
    <svg
      v-for="(g, art) in grafiken"
      :key="art"
      :class="`grafik-vorher-nachher grafik-${art}`"
      :viewBox="`0 0 ${g.b} ${g.h}`"
      role="img"
      :aria-labelledby="`${id}-${art}`"
    >
      <title :id="`${id}-${art}`">{{ titel }}</title>
      <g v-for="(k, i) in g.kaesten" :key="i">
        <rect :class="k.klasse" :x="k.x" :y="k.y" :width="k.b" :height="k.h" :rx="GRAFIK.rundung" />
        <path v-if="k.symbol" class="g-symbol" :d="k.symbol" />
        <text v-for="(z, j) in k.texte" :key="j" :class="z.klasse" :x="z.x" :y="z.y">{{ z.text }}</text>
      </g>
      <g v-for="(p, i) in g.pfeile" :key="`p${i}`">
        <path class="g-pfeil" :d="p.linie" />
        <path class="g-spitze" :d="p.spitze" />
      </g>
    </svg>
  </figure>
</template>

<style src="../styles/grafik.css"></style>

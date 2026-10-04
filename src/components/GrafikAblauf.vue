<script setup lang="ts">
import type { AblaufSchritt } from '../lib/grafik'
import { computed, useId } from 'vue'
import { ablaufLayout, GRAFIK } from '../lib/grafik'

// Ablauf eines Angebots als Kästen mit Pfeilen (Vorbild: ProduktAblauf.vue auf strainovic-it.ch).
// Alle Beschriftungen kommen als Props aus src/texte/, die Komponente kennt keine Sprache.
// Der Schritt mit `eigen: true` trägt als einziger die Akzentfarbe.
const props = defineProps<{ titel: string, schritte: AblaufSchritt[] }>()
const id = useId()
const grafiken = computed(() => ({ breit: ablaufLayout(props.schritte, 'breit'), schmal: ablaufLayout(props.schritte, 'schmal') }))
</script>

<template>
  <figure class="grafik">
    <svg
      v-for="(g, art) in grafiken"
      :key="art"
      :class="`grafik-ablauf grafik-${art}`"
      :viewBox="`0 0 ${g.b} ${g.h}`"
      role="img"
      :aria-labelledby="`${id}-${art}`"
    >
      <title :id="`${id}-${art}`">{{ titel }}</title>
      <g v-for="(k, i) in g.kaesten" :key="i">
        <rect :class="k.klasse" :x="k.x" :y="k.y" :width="k.b" :height="k.h" :rx="GRAFIK.rundung" />
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

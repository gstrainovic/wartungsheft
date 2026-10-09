<script setup lang="ts">
/**
 * Tutorial «So startest du mit Wartungsheft» auf der Hilfe, in der Sprache der Seite (public/film-tutorial[-fr]…,
 * entsteht mit `node scripts/werbefilm.ts tutorial`). Der Rahmen mit id="video" steht sofort, damit der Verweis
 * aus der Checkliste «Einrichten» (/hilfe#video) die Stelle findet, bevor der Film geladen ist.
 */
import { useSprache } from '../composables/useSprache'
import texte from '../texte/tutorial'
import LandingVideo from './LandingVideo.vue'

const { t } = useSprache(texte)
</script>

<template>
  <div id="video" class="tutorial-video">
    <LandingVideo file="film-tutorial.mp4" :title="t.titel" subtitle="" :hinweis="t.hinweis" />
  </div>
</template>

<style scoped>
.tutorial-video {
  scroll-margin-top: 4rem;
}
</style>

<script setup lang="ts">
import Button from 'primevue/button'
import GrafikAblauf from '../components/GrafikAblauf.vue'
import GrafikVorherNachher from '../components/GrafikVorherNachher.vue'
import LandingFooter from '../components/LandingFooter.vue'
import LandingHeader from '../components/LandingHeader.vue'
import { useSprache } from '../composables/useSprache'
import { useEventsStore } from '../stores/events'
import anlagenTexte from '../texte/anlagen'

// Hypothese H3: Wartungsplan für Liegenschaften und Anlagen (Validierung in ~/projects/wartungsplan).
// Noch kein Produkt: die Seite sammelt Vorbestellungen per Mail, Zahlung erst bei Lieferung. Texte in src/texte/anlagen.ts.
const { t } = useSprache(anlagenTexte)

const CONTACT_EMAIL = 'info@wartungsheft.ch'

function vorbestellen() {
  useEventsStore().trackCta('anlagen')
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.value.mailBetreff)}&body=${encodeURIComponent(t.value.mailText)}`
}
</script>

<template>
  <div class="anlagen">
    <LandingHeader />

    <main class="anlagen-container anlagen-main">
      <section class="anlagen-hero">
        <h1>{{ t.titel }}</h1>
        <p class="anlagen-problem">
          {{ t.problem }}
        </p>
      </section>

      <section class="anlagen-grafik">
        <h2>{{ t.ablauf.titel }}</h2>
        <GrafikAblauf :titel="t.ablauf.bild" :schritte="t.ablauf.schritte" />
      </section>

      <section class="anlagen-benefits">
        <div v-for="b in t.benefits" :key="b.title" class="anlagen-benefit">
          <i :class="`pi ${b.icon}`" />
          <h2>{{ b.title }}</h2>
          <p>{{ b.text }}</p>
        </div>
      </section>

      <section class="anlagen-grafik">
        <h2>{{ t.vorherNachher.titel }}</h2>
        <GrafikVorherNachher
          :titel="t.vorherNachher.bild"
          :bisher="t.vorherNachher.bisher"
          :neu="t.vorherNachher.neu"
          :zeilen="t.vorherNachher.zeilen"
        />
      </section>

      <section class="anlagen-fuer">
        <h2>{{ t.fuerWenTitel }}</h2>
        <p>
          {{ t.fuerWen }}
        </p>
      </section>

      <section class="anlagen-price">
        <strong>{{ t.preis }}</strong>
        <span>{{ t.preisHinweis }}</span>
        <p class="anlagen-vorbestellung">
          {{ t.vorbestellung }}
        </p>
        <div class="anlagen-actions">
          <Button :label="t.knopf" size="large" icon="pi pi-envelope" icon-pos="right" @click="vorbestellen" />
        </div>
        <p class="anlagen-contact">
          {{ t.kontaktVor }} <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>{{ t.kontaktNach }}
        </p>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>

<style scoped>
.anlagen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.anlagen-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

.anlagen-main {
  flex: 1;
  padding-top: 3rem;
  padding-bottom: 4rem;
}

.anlagen-hero {
  text-align: center;
  margin-bottom: 3rem;
}

.anlagen-hero h1 {
  font-size: clamp(1.8rem, 4.5vw, 3rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 1rem;
}

.anlagen-problem {
  font-size: 1.15rem;
  color: var(--p-text-muted-color);
  max-width: 640px;
  margin: 0 auto;
}

.anlagen-grafik {
  margin-bottom: 3rem;
}

.anlagen-grafik h2 {
  font-size: 1.25rem;
  margin: 0 0 1.25rem;
  text-align: center;
}

.anlagen-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.anlagen-benefit i {
  font-size: 1.75rem;
  color: #059669;
}

.anlagen-benefit h2 {
  font-size: 1.1rem;
  margin: 0.75rem 0 0.5rem;
}

.anlagen-benefit p,
.anlagen-fuer p {
  margin: 0;
  color: var(--p-text-muted-color);
}

.anlagen-fuer {
  margin-bottom: 3rem;
}

.anlagen-fuer h2 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
}

.anlagen-price {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.anlagen-price strong {
  font-size: 1.6rem;
}

.anlagen-price span,
.anlagen-vorbestellung,
.anlagen-contact {
  max-width: 640px;
  color: var(--p-text-muted-color);
  margin: 0;
}

.anlagen-actions {
  margin: 1rem 0 0.5rem;
}
</style>

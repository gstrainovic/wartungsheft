<script setup lang="ts">
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import DemoDueList from '../components/DemoDueList.vue'
import LandingFooter from '../components/LandingFooter.vue'
import LandingHeader from '../components/LandingHeader.vue'
import LandingVideo from '../components/LandingVideo.vue'
import PriceTable from '../components/PriceTable.vue'
import { useAuthEntry } from '../composables/useAuthEntry'
import { useSprache } from '../composables/useSprache'
import startTexte from '../texte/start'

const router = useRouter()
const { label, go } = useAuthEntry()
const { t, pfad } = useSprache(startTexte)
</script>

<template>
  <div class="landing">
    <!-- Header -->
    <LandingHeader />

    <!-- Hero -->
    <section class="hero">
      <div class="landing-container hero-inner">
        <div class="hero-grid">
          <div class="hero-copy">
            <h1>{{ t.hero.titel }}</h1>
            <p class="hero-subtitle">
              {{ t.hero.text }}
            </p>
            <div class="hero-actions">
              <Button
                :label="label"
                icon="pi pi-arrow-right"
                icon-pos="right"
                size="large"
                @click="go"
              />
            </div>
          </div>
          <DemoDueList class="hero-demo" />
        </div>
        <div class="hero-stats">
          <div v-for="stat in t.hero.stats" :key="stat.titel" class="hero-stat">
            <strong>{{ stat.titel }}</strong>
            <span>{{ stat.text }}</span>
          </div>
        </div>
      </div>
    </section>

    <LandingVideo />

    <!-- Problem -->
    <section class="section section-alt">
      <div class="landing-container">
        <h2>{{ t.problem.titel }}</h2>
        <div class="problem-grid">
          <div v-for="karte in t.problem.karten" :key="karte.icon" class="problem-card">
            <i :class="`pi ${karte.icon}`" />
            <h3>{{ karte.titel }}</h3>
            <p>{{ karte.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="section">
      <div class="landing-container">
        <h2>{{ t.features.titel }}</h2>
        <div class="features-grid">
          <div v-for="karte in t.features.karten" :key="karte.icon" class="feature-card">
            <div class="feature-icon">
              <i :class="`pi ${karte.icon}`" />
            </div>
            <h3>{{ karte.titel }}</h3>
            <p>{{ karte.text }}</p>
            <DemoDueList v-if="karte.demo" compact />
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="section section-alt">
      <div class="landing-container">
        <h2>{{ t.ablauf.titel }}</h2>
        <div class="steps">
          <template v-for="(schritt, i) in t.ablauf.schritte" :key="schritt.titel">
            <div v-if="i > 0" class="step-arrow">
              <i class="pi pi-arrow-right" />
            </div>
            <div class="step">
              <div class="step-number">
                {{ i + 1 }}
              </div>
              <h3>{{ schritt.titel }}</h3>
              <p>{{ schritt.text }}</p>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Für wen: die Preise stehen auf den zwei Angebotsseiten (Betrieb, Privathalter), hier nur der Weg dorthin -->
    <section id="fuer-wen" class="section">
      <div class="landing-container">
        <h2>{{ t.fuerWen.titel }}</h2>
        <p class="section-subtitle">
          {{ t.fuerWen.text }}
        </p>
        <div class="pricing-grid pricing-grid-two">
          <div class="pricing-card">
            <h3>{{ t.fuerWen.betrieb.titel }}</h3>
            <p class="audience-text">
              {{ t.fuerWen.betrieb.text }}
            </p>
            <ul class="pricing-features">
              <li v-for="punkt in t.fuerWen.betrieb.punkte" :key="punkt">
                <i class="pi pi-check" /> {{ punkt }}
              </li>
            </ul>
            <Button
              :label="t.fuerWen.betrieb.knopf"
              icon="pi pi-arrow-right"
              icon-pos="right"
              fluid
              @click="router.push(pfad('/betrieb'))"
            />
          </div>
          <div class="pricing-card">
            <h3>{{ t.fuerWen.privat.titel }}</h3>
            <p class="audience-text">
              {{ t.fuerWen.privat.text }}
            </p>
            <ul class="pricing-features">
              <li v-for="punkt in t.fuerWen.privat.punkte" :key="punkt">
                <i class="pi pi-check" /> {{ punkt }}
              </li>
            </ul>
            <Button
              :label="t.fuerWen.privat.knopf"
              icon="pi pi-arrow-right"
              icon-pos="right"
              outlined
              fluid
              @click="router.push(pfad('/privathalter'))"
            />
          </div>
        </div>
      </div>
    </section>

    <section id="preise" class="section section-alt">
      <div class="landing-container">
        <h2>{{ t.preise }}</h2>
        <PriceTable />
      </div>
    </section>

    <!-- CTA -->
    <section class="section section-cta">
      <div class="landing-container cta-inner">
        <h2>{{ t.cta.titel }}</h2>
        <p>{{ t.cta.text }}</p>
        <Button
          :label="label"
          icon="pi pi-arrow-right"
          icon-pos="right"
          size="large"
          severity="contrast"
          @click="go"
        />
      </div>
    </section>

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>

<style scoped>
.landing {
  font-family: var(--p-font-family);
  color: var(--p-text-color);
  background: var(--p-surface-ground);
}

/* Kopf und Fuss sind LandingHeader.vue und LandingFooter.vue */

/* Container */
.landing-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Hero */
.hero {
  padding: 5rem 0 4rem;
  text-align: center;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 3rem;
  align-items: center;
  text-align: left;
  margin-bottom: 3rem;
}

.hero-demo {
  max-width: 460px;
  width: 100%;
  justify-self: end;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 1rem;
  color: var(--p-text-color);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--p-text-muted-color);
  max-width: 600px;
  margin: 0 0 2rem;
  line-height: 1.6;
}

@media (max-width: 800px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }

  .hero-subtitle {
    margin: 0 auto 2rem;
  }

  .hero-demo {
    justify-self: center;
  }
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hero-stat strong {
  font-size: 1.1rem;
  color: var(--p-primary-color);
}

.hero-stat span {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

/* Sections */
.section {
  padding: 4rem 0;
}

.section-alt {
  background: var(--p-surface-card);
}

.section h2 {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.section-subtitle {
  text-align: center;
  color: var(--p-text-muted-color);
  margin: 0 0 2.5rem;
}

/* Problem Grid */
.problem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.problem-card {
  padding: 1.5rem;
  border-radius: var(--p-border-radius);
  background: var(--p-surface-ground);
  border: 1px solid var(--p-surface-border);
}

.problem-card i {
  font-size: 2rem;
  color: var(--p-red-500);
  margin-bottom: 0.75rem;
  display: block;
}

.problem-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

.problem-card p {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.feature-card {
  padding: 1.5rem;
  border-radius: var(--p-border-radius);
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  transition: box-shadow 0.2s;
}

.feature-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.feature-icon i {
  font-size: 1.25rem;
}

.feature-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

.feature-card p {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Steps */
.steps {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
}

.step {
  flex: 1;
  min-width: 200px;
  max-width: 280px;
  text-align: center;
}

.step-number {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 auto 1rem;
}

.step h3 {
  margin: 0 0 0.5rem;
}

.step p {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.95rem;
  line-height: 1.5;
}

.step-arrow {
  display: flex;
  align-items: center;
  padding-top: 1rem;
  color: var(--p-text-muted-color);
}

.step-arrow i {
  font-size: 1.5rem;
}

/* Pricing */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: 1.5rem;
  max-width: 900px;
  margin: 2.5rem auto 0;
}

.pricing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  border-radius: var(--p-border-radius);
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  text-align: center;
}

.pricing-grid-two {
  max-width: 760px;
}

.pricing-card h3 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

/* wächst mit, damit Haken-Liste und Knopf in beiden Karten auf gleicher Höhe stehen */
.audience-text {
  flex: 1;
  color: var(--p-text-muted-color);
  margin: 0 0 1.25rem;
  text-align: left;
  line-height: 1.5;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  text-align: left;
}

.pricing-features li {
  padding: 0.4rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.pricing-features li i {
  color: var(--p-green-500);
  font-size: 0.85rem;
  flex-shrink: 0;
  margin-top: 0.3rem;
}

/* CTA */
.section-cta {
  text-align: center;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  padding: 4rem 0;
}

.section-cta h2 {
  color: inherit;
}

.section-cta p {
  color: inherit;
  opacity: 0.85;
  margin-bottom: 1.5rem;
}

/* Footer */
/* Mobile */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 0 2rem;
  }

  .hero-stats {
    gap: 1.5rem;
  }

  .steps {
    flex-direction: column;
    align-items: center;
  }

  .step-arrow {
    transform: rotate(90deg);
    padding: 0;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}
</style>

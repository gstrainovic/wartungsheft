<script setup lang="ts">
import type { LandingSegment } from '../stores/events'
import Button from 'primevue/button'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthEntry } from '../composables/useAuthEntry'
import { useSprache } from '../composables/useSprache'
import { mitSprache, ohneSprache, SPRACHEN } from '../lib/sprache'
import layoutTexte from '../texte/layout'
import AppLogo from './AppLogo.vue'
import ThemeSwitch from './ThemeSwitch.vue'

// Ein Kopf für alle öffentlichen Seiten (/, /betrieb, /privathalter, /impressum, /datenschutz):
// Logo, Menü mit Ankern auf die Startseite, Sprachwahl, Hell-Dunkel-Schalter, «Anmelden» und der Knopf in die
// Testzeit. Auf Handy bleiben Logo-Symbol, Sprachwahl, Schalter, «Anmelden» und Knopf. Kennt der Browser das Konto
// schon, entfällt der Test-Knopf. Der Ratgeber steht nur im Fuss.
const props = defineProps<{
  /** Klick auf den Knopf zählt in `events`, wenn die Seite zu einer Hypothese gehört */
  segment?: LandingSegment
}>()

const { entry, label, go } = useAuthEntry(props.segment)
const { sprache, pfad, t } = useSprache(layoutTexte)
const route = useRoute()

// Dieselbe Seite in jeder Sprache
const fassungen = computed(() => SPRACHEN.map(s => ({ ...s, pfad: mitSprache(s.code, ohneSprache(route.path)) })))
</script>

<template>
  <header class="landing-header">
    <div class="landing-header-inner">
      <router-link :to="pfad('/')" class="landing-logo" aria-label="Wartungsheft">
        <AppLogo size="1.75rem" />
        <span class="landing-logo-text">Wartungsheft</span>
      </router-link>
      <!-- Auf dem Handy eine eigene schmale Zeile unter Logo und Knöpfen -->
      <div class="landing-tools">
        <!-- Sprachwahl als Links wie auf strainovic-it.ch; eine Auswahlliste war im dunklen Design unlesbar -->
        <nav class="landing-lang" :aria-label="t.sprachwahl" data-testid="language-switch">
          <router-link
            v-for="f in fassungen"
            :key="f.code"
            :to="f.pfad"
            :hreflang="f.tag"
            :lang="f.tag"
            :title="f.name"
            :aria-current="f.code === sprache ? 'true' : undefined"
            :class="{ 'landing-lang-aktiv': f.code === sprache }"
          >
            {{ f.code.toUpperCase() }}
          </router-link>
        </nav>
        <ThemeSwitch :label="t.dunkel" />
      </div>
      <nav class="landing-nav">
        <router-link :to="pfad('/#features')" class="landing-anker">
          {{ t.menue.features }}
        </router-link>
        <router-link :to="pfad('/#how-it-works')" class="landing-anker">
          {{ t.menue.ablauf }}
        </router-link>
        <router-link :to="pfad('/#preise')" class="landing-anker">
          {{ t.menue.preise }}
        </router-link>
        <router-link :to="pfad('/betrieb')">
          {{ t.menue.betrieb }}
        </router-link>
        <router-link :to="pfad('/privathalter')">
          {{ t.menue.privat }}
        </router-link>
        <router-link
          v-if="entry !== 'app'"
          :to="pfad('/login')"
          class="landing-login"
          :class="{ 'landing-login-known': entry === 'login' }"
        >
          {{ t.einstieg.login }}
        </router-link>
        <Button
          v-if="entry !== 'login'"
          :label="entry === 'trial' ? t.kopfTrial : label"
          size="small"
          @click="go"
        />
      </nav>
    </div>
  </header>
</template>

<style scoped>
.landing-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--p-surface-card);
  border-bottom: 1px solid var(--p-surface-border);
  backdrop-filter: blur(8px);
}

.landing-header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.75rem 1.5rem;
}

/* Sprachwahl und Schalter rechts aussen, nach Menü und Knöpfen */
.landing-tools {
  order: 2;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.landing-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-primary-color);
  text-decoration: none;
}

.landing-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.landing-nav a {
  color: var(--p-text-muted-color);
  text-decoration: none;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: color 0.2s;
}

.landing-nav a:hover {
  color: var(--p-text-color);
}

.landing-nav .p-button {
  white-space: nowrap;
}

/* Sprachwahl: vier kurze Links, die aktuelle Sprache in der Markenfarbe, auch auf dem Handy sichtbar */
.landing-lang {
  display: flex;
  gap: 0.6rem;
}

.landing-lang a {
  color: var(--p-text-muted-color);
  text-decoration: none;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
}

.landing-lang a:hover {
  color: var(--p-text-color);
}

.landing-lang a.landing-lang-aktiv {
  color: var(--p-primary-color);
  font-weight: 600;
}

.landing-nav a.landing-login {
  color: var(--p-text-color);
  font-weight: 600;
}

/* Bekanntes Konto: «Anmelden» ist der einzige Knopf im Kopf */
.landing-nav a.landing-login-known {
  padding: 0.4rem 0.9rem;
  border-radius: var(--p-border-radius-md, 6px);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

/* Ab Tabletbreite eine Zeile. Damit Sprachwahl und Schalter auch mit den längeren französischen Texten passen,
   fallen zuerst die Anker auf die Startseite weg, dann die Links auf die Angebotsseiten */
@media (min-width: 768px) {
  .landing-header-inner {
    flex-wrap: nowrap;
  }
}

/* Schmaler: Sprachwahl und Schalter in einer zweiten, schmalen Zeile unter Logo, «Anmelden» und Testknopf */
@media (max-width: 767px) {
  .landing-tools {
    order: 3;
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 1400px) {
  .landing-nav > a.landing-anker {
    display: none;
  }
}

@media (max-width: 1024px) {
  .landing-nav > a:not(.landing-login) {
    display: none;
  }
}

/* Handy: Logo nur als Symbol, damit «Anmelden» und der Test-Knopf in eine Zeile passen */
@media (max-width: 480px) {
  .landing-header-inner {
    padding: 0.75rem 1rem;
  }

  .landing-nav {
    gap: 0.75rem;
  }

  .landing-logo-text {
    display: none;
  }
}
</style>

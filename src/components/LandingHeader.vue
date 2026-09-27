<script setup lang="ts">
import type { Sprache } from '../lib/sprache'
import type { LandingSegment } from '../stores/events'
import Button from 'primevue/button'
import { useRoute, useRouter } from 'vue-router'
import { useAuthEntry } from '../composables/useAuthEntry'
import { useSprache } from '../composables/useSprache'
import { mitSprache, ohneSprache, SPRACHEN } from '../lib/sprache'
import layoutTexte from '../texte/layout'
import AppLogo from './AppLogo.vue'

// Ein Kopf für alle öffentlichen Seiten (/, /betrieb, /privathalter, /impressum, /datenschutz):
// Logo, Menü mit Ankern auf die Startseite, Sprachwahl, «Anmelden» und der Knopf in die Testzeit. Auf Handy bleiben
// Logo-Symbol, Sprachwahl, «Anmelden» und Knopf. Kennt der Browser das Konto schon, entfällt der Test-Knopf.
const props = defineProps<{
  /** Klick auf den Knopf zählt in `events`, wenn die Seite zu einer Hypothese gehört */
  segment?: LandingSegment
}>()

const { entry, label, go } = useAuthEntry(props.segment)
const { sprache, pfad, t } = useSprache(layoutTexte)
const route = useRoute()
const router = useRouter()

// Dieselbe Seite in der gewählten Sprache
function spracheWechseln(event: Event) {
  const ziel = (event.target as HTMLSelectElement).value as Sprache
  router.push(mitSprache(ziel, ohneSprache(route.path)))
}
</script>

<template>
  <header class="landing-header">
    <div class="landing-header-inner">
      <router-link :to="pfad('/')" class="landing-logo" aria-label="Wartungsheft">
        <AppLogo size="1.75rem" />
        <span class="landing-logo-text">Wartungsheft</span>
      </router-link>
      <nav class="landing-nav">
        <router-link :to="pfad('/#features')">
          {{ t.menue.features }}
        </router-link>
        <router-link :to="pfad('/#how-it-works')">
          {{ t.menue.ablauf }}
        </router-link>
        <router-link :to="pfad('/#preise')">
          {{ t.menue.preise }}
        </router-link>
        <router-link :to="pfad('/betrieb')">
          {{ t.menue.betrieb }}
        </router-link>
        <router-link :to="pfad('/privathalter')">
          {{ t.menue.privat }}
        </router-link>
        <!-- Ratgeber ist fertiges HTML ausserhalb der App (src/lib/ratgeber.ts): voller Seitenwechsel, kein Router -->
        <a :href="pfad('/ratgeber')">
          {{ t.menue.ratgeber }}
        </a>
        <select
          class="landing-lang"
          :value="sprache"
          :aria-label="t.sprachwahl"
          data-testid="language-switch"
          @change="spracheWechseln"
        >
          <option v-for="s in SPRACHEN" :key="s.code" :value="s.code" :lang="s.tag">
            {{ s.code.toUpperCase() }}
          </option>
        </select>
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
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
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

/* Sprachwahl: klein, auch auf dem Handy sichtbar */
.landing-lang {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.25rem 0.35rem;
  border: 1px solid var(--p-surface-border);
  border-radius: var(--p-border-radius-md, 6px);
  background: var(--p-surface-card);
  color: var(--p-text-color);
  cursor: pointer;
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

@media (max-width: 768px) {
  .landing-nav a:not(.landing-login) {
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

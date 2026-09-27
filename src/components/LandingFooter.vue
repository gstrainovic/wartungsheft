<script setup lang="ts">
import { useSprache } from '../composables/useSprache'
import layoutTexte from '../texte/layout'

// Ein Fuss für alle öffentlichen Seiten (/, /betrieb, /privathalter, /impressum, /datenschutz, /agb, /login):
// Herkunft und Kontakt, Links auf Zielgruppen und Rechtliches. Kein Logo, das steht im Kopf (sticky).
// Auf den Übersetzungen steht dazu, dass die App selbst deutsch ist.
const CONTACT_EMAIL = 'info@wartungsheft.ch'
const { pfad, t } = useSprache(layoutTexte)
</script>

<template>
  <footer class="landing-footer">
    <div class="landing-footer-inner">
      <p class="footer-note">
        {{ t.fuss.hinweis }}
        <template v-if="t.appSprache">
          {{ t.appSprache }}
        </template>
        {{ t.fuss.fragen }} <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>
      </p>
      <nav class="footer-links">
        <router-link :to="pfad('/betrieb')">
          {{ t.fuss.betrieb }}
        </router-link>
        <router-link :to="pfad('/privathalter')">
          {{ t.fuss.privat }}
        </router-link>
        <router-link :to="pfad('/hilfe')">
          {{ t.fuss.hilfe }}
        </router-link>
        <!-- Ratgeber ist fertiges HTML ausserhalb der App (src/lib/ratgeber.ts): voller Seitenwechsel, kein Router -->
        <a :href="pfad('/ratgeber')">
          {{ t.fuss.ratgeber }}
        </a>
        <router-link :to="pfad('/impressum')">
          {{ t.fuss.impressum }}
        </router-link>
        <router-link :to="pfad('/datenschutz')">
          {{ t.fuss.datenschutz }}
        </router-link>
        <router-link :to="pfad('/agb')">
          {{ t.fuss.agb }}
        </router-link>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.landing-footer {
  padding: 2rem 0;
  border-top: 1px solid var(--p-surface-border);
  background: var(--p-surface-card);
}

.landing-footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-note {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.footer-note a {
  color: var(--p-primary-color);
}

/* Umbruch erlaubt, sonst schiebt die Linkzeile die Seite auf schmalen Displays in die Breite */
.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
}

.footer-links a {
  color: var(--p-text-muted-color);
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: var(--p-text-color);
}
</style>

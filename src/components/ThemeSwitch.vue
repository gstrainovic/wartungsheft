<script setup lang="ts">
import { ref } from 'vue'

// Hell-Dunkel-Schalter im Kopf der öffentlichen Seiten, gestaltet wie auf strainovic-it.ch. Schreibt dieselbe
// Einstellung wie die Einstellungen der App (`theme` im localStorage, Klasse `dark-mode` am html-Element, main.ts
// wendet sie vor dem Mount an). Bewusst ohne den Settings-Store: der schriebe beim Anlegen «system» als Standard
// und änderte so das Design der Landing Page für Besucher ohne eigene Wahl.
defineProps<{ label: string }>()

const dunkel = ref(document.documentElement.classList.contains('dark-mode'))

function umschalten() {
  dunkel.value = !dunkel.value
  document.documentElement.classList.toggle('dark-mode', dunkel.value)
  try {
    localStorage.setItem('theme', dunkel.value ? 'dark' : 'light')
  }
  catch {
    // Speicher gesperrt: die Wahl gilt dann nur für diesen Besuch
  }
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="dunkel"
    :aria-label="label"
    :title="label"
    class="schalter"
    :class="{ 'schalter-dunkel': dunkel }"
    data-testid="theme-switch"
    @click="umschalten"
  >
    <span class="schalter-knopf">
      <svg v-if="!dunkel" class="schalter-sonne" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.4" />
        <g stroke-linecap="round" stroke-width="2">
          <path d="M12 1.4v2.2M12 20.4v2.2M1.4 12h2.2M20.4 12h2.2" />
          <path d="M4.4 4.4 6 6M18 18l1.6 1.6M19.6 4.4 18 6M6 18l-1.6 1.6" />
        </g>
      </svg>
      <svg v-else class="schalter-mond" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
    </span>
  </button>
</template>

<style scoped>
.schalter {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 2.9rem;
  padding: 0.16rem;
  border: 1px solid color-mix(in srgb, var(--p-text-color) 30%, transparent);
  border-radius: 999px;
  background-color: var(--p-surface-ground);
  cursor: pointer;
}

.schalter-knopf {
  display: grid;
  place-items: center;
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 999px;
  background-color: var(--p-surface-card);
  border: 1px solid color-mix(in srgb, var(--p-text-color) 30%, transparent);
  transition: transform 170ms ease;
}

.schalter-dunkel .schalter-knopf {
  transform: translateX(1.24rem);
  background-color: var(--p-primary-color);
  border-color: var(--p-primary-color);
}

.schalter-sonne,
.schalter-mond {
  width: 0.8rem;
  height: 0.8rem;
}

.schalter-sonne {
  fill: var(--p-text-muted-color);
  stroke: var(--p-text-muted-color);
}

.schalter-mond {
  fill: var(--p-primary-contrast-color);
}
</style>

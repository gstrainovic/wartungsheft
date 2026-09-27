<script setup lang="ts">
import Badge from 'primevue/badge'
import { computed } from 'vue'
import { useSprache } from '../composables/useSprache'
import preisTexte from '../texte/preise'

// Gerenderte Beispiel-Ansicht der Fälligkeitsliste für Landing Pages: gleiche Farben, Icons und Badges wie im Dashboard,
// aber feste Daten ohne Store. «compact» zeigt nur Bezeichnung und Badge. Texte je Sprache in src/texte/preise.ts.
withDefaults(defineProps<{ compact?: boolean, vehicle?: string }>(), {
  compact: false,
  vehicle: 'VW Caddy · SG 48 213',
})

const { t } = useSprache(preisTexte)

const STIL = [
  { severity: 'success', icon: 'pi pi-check-circle', color: 'var(--p-green-500)' },
  { severity: 'warn', icon: 'pi pi-clock', color: 'var(--p-yellow-500)' },
  { severity: 'danger', icon: 'pi pi-exclamation-triangle', color: 'var(--p-red-500)' },
] as const

const rows = computed(() => t.value.demo.zeilen.map((zeile, i) => ({ ...zeile, ...STIL[i]! })))
</script>

<template>
  <div class="demo-due" :class="{ 'demo-due-compact': compact }" :aria-label="t.demo.beschreibung">
    <div v-if="!compact" class="demo-due-head">
      <i class="pi pi-car" />
      <span>{{ vehicle }}</span>
      <Badge :value="t.demo.ueberfaellig" severity="danger" />
    </div>
    <div v-for="row in rows" :key="row.label" class="demo-due-row">
      <i :class="row.icon" :style="{ color: row.color }" />
      <div class="demo-due-text">
        <div class="demo-due-label">
          {{ row.label }}
        </div>
        <div v-if="!compact" class="demo-due-caption">
          {{ row.caption }}
        </div>
      </div>
      <Badge :value="row.status" :severity="row.severity" />
    </div>
    <div v-if="!compact" class="demo-due-foot">
      {{ t.demo.fuss }}
    </div>
  </div>
</template>

<style scoped>
.demo-due {
  text-align: left;
  border-radius: var(--p-border-radius);
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.demo-due-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  border-bottom: 1px solid var(--p-surface-border);
}

.demo-due-head i {
  color: var(--p-primary-color);
}

.demo-due-head .p-badge {
  margin-left: auto;
}

.demo-due-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--p-surface-border);
}

.demo-due-row:last-of-type {
  border-bottom: none;
}

.demo-due-row > i {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.demo-due-text {
  flex: 1;
  min-width: 0;
}

.demo-due-label {
  font-weight: 500;
}

.demo-due-caption {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.demo-due-foot {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  background: var(--p-surface-ground);
  border-top: 1px solid var(--p-surface-border);
}

.demo-due-compact {
  box-shadow: none;
  margin-top: 1rem;
}

.demo-due-compact .demo-due-row {
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;
}

.demo-due-compact .demo-due-row > i {
  font-size: 1rem;
}
</style>

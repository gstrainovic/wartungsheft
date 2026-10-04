<script setup lang="ts">
/**
 * Fahrzeug verkauft oder abgegeben: Datum und Kilometerstand festhalten, statt es zu löschen. Löschen nimmt
 * Rechnungen und Wartungen mit, die im Jahresabschluss und in der Aufbewahrung fehlen würden.
 */
import type { Vehicle } from '../stores/vehicles'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import { ref, watch } from 'vue'
import { useSprache } from '../composables/useSprache'
import { zahlenLocale } from '../lib/locale'
import { useVehiclesStore } from '../stores/vehicles'
import allgemein from '../texte/app/allgemein'
import texte from '../texte/app/verkauf'

const props = defineProps<{ vehicle: Vehicle | null }>()
const emit = defineEmits<{ close: [], sold: [] }>()
const { t } = useSprache(texte)
const { t: a } = useSprache(allgemein)

const store = useVehiclesStore()
const today = new Date().toISOString().slice(0, 10)
const date = ref(today)
const mileage = ref<number | null>(null)
const saving = ref(false)

watch(() => props.vehicle, (v) => {
  date.value = today
  mileage.value = v?.mileage || null
}, { immediate: true })

async function save(): Promise<void> {
  if (!props.vehicle || !date.value)
    return
  saving.value = true
  try {
    await store.update(props.vehicle.id, { soldAt: date.value, soldMileage: mileage.value || null })
    emit('sold')
    emit('close')
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="!!vehicle"
    modal
    :header="t.titel"
    data-testid="sell-vehicle-dialog"
    :style="{ width: 'min(480px, 94vw)' }"
    @update:visible="emit('close')"
  >
    <p class="intro">
      <strong>{{ vehicle?.make }} {{ vehicle?.model }}</strong> {{ t.einleitung }}
    </p>
    <div class="fields">
      <div class="field">
        <label for="sold-date">{{ t.datum }}</label>
        <InputText id="sold-date" v-model="date" type="date" fluid />
      </div>
      <div class="field">
        <label for="sold-mileage">{{ t.kilometerstand }}</label>
        <InputNumber v-model="mileage" input-id="sold-mileage" :locale="zahlenLocale()" suffix=" km" :aria-label="t.kmBeiUebergabe" fluid />
      </div>
    </div>
    <p class="hint">
      {{ t.tipp }}
    </p>
    <template #footer>
      <Button :label="a.abbrechen" text severity="secondary" @click="emit('close')" />
      <Button :label="t.eintragen" icon="pi pi-check" :disabled="!date" :loading="saving" @click="save" />
    </template>
  </Dialog>
</template>

<style scoped>
.intro {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field > label {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.hint {
  margin: 1rem 0 0;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

@media (max-width: 480px) {
  .fields {
    grid-template-columns: 1fr;
  }
}
</style>
